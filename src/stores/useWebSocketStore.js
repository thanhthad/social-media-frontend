import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

const getWsUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  // replace /api with /ws
  return apiBase.replace(/\/api\/?$/, '/ws');
};

const useWebSocketStore = create((set, get) => ({
  stompClient: null,
  connected: false,
  notifications: [],
  messages: [],
  incomingMessages: [],
  lastMessage: null,
  unreadNotifCount: 0,
  messageListeners: new Set(),
  reactionListeners: new Set(),
  conversationListeners: new Set(),

  // Connect to STOMP WebSocket broker
  connect: (token) => {
    if (!token) return;

    // Avoid duplicate connection if already connected or connecting
    const currentClient = get().stompClient;
    if (currentClient && get().connected) return;

    if (currentClient) {
      currentClient.deactivate();
    }

    const wsUrl = getWsUrl();
    console.log('[WebSocket] Connecting to:', wsUrl);

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        // Uncomment if deep STOMP debug logs are needed:
        // console.log('[STOMP]', msg);
      },
      onConnect: (frame) => {
        console.log('[WebSocket] Connected successfully to STOMP broker.');
        set({ connected: true, stompClient: client });

        // 1. Subscribe to Personal Notifications
        client.subscribe('/user/queue/notifications', (message) => {
          try {
            const notif = JSON.parse(message.body);
            set((state) => ({
              notifications: [notif, ...state.notifications],
              unreadNotifCount: state.unreadNotifCount + 1,
            }));

            // Toast alert for user
            toast(notif.content || 'Bạn có thông báo mới!', {
              icon: '🔔',
              duration: 4000,
            });
          } catch (e) {
            console.error('Failed to parse notification payload', e);
          }
        });

        // 2. Subscribe to Personal Messages
        client.subscribe('/user/queue/messages', (message) => {
          try {
            const msg = JSON.parse(message.body);
            set((state) => ({
              messages: [msg, ...state.messages],
              incomingMessages: [msg, ...state.incomingMessages],
              lastMessage: msg,
            }));

            // Notify registered message listeners
            get().messageListeners.forEach((listener) => {
              try {
                listener(msg);
              } catch (e) {
                console.error('Error in message listener', e);
              }
            });
          } catch (e) {
            console.error('Failed to parse incoming message payload', e);
          }
        });

        // 3. Subscribe to Message Reactions
        client.subscribe('/user/queue/message-reactions', (message) => {
          try {
            const reaction = JSON.parse(message.body);
            get().reactionListeners.forEach((listener) => {
              try {
                listener(reaction);
              } catch (e) {
                console.error('Error in reaction listener', e);
              }
            });
          } catch (e) {
            console.error('Failed to parse reaction payload', e);
          }
        });

        // 4. Subscribe to Conversations updates
        client.subscribe('/user/queue/conversations', (message) => {
          try {
            const conv = JSON.parse(message.body);
            get().conversationListeners.forEach((listener) => {
              try {
                listener(conv);
              } catch (e) {
                console.error('Error in conversation listener', e);
              }
            });
          } catch (e) {
            console.error('Failed to parse conversation payload', e);
          }
        });

        // 5. Subscribe to System Topic
        client.subscribe('/topic/system', (message) => {
          try {
            const sysMsg = message.body;
            toast(sysMsg, { icon: '📢' });
          } catch (e) {}
        });
      },
      onStompError: (frame) => {
        console.warn('[WebSocket] STOMP broker error:', frame.headers['message']);
        set({ connected: false });
      },
      onWebSocketClose: () => {
        set({ connected: false });
      },
    });

    client.activate();
    set({ stompClient: client });
  },

  disconnect: () => {
    const client = get().stompClient;
    if (client) {
      client.deactivate();
      set({ connected: false, stompClient: null });
    }
  },

  // Message listeners registration
  addMessageListener: (listener) => {
    const listeners = get().messageListeners;
    listeners.add(listener);
    set({ messageListeners: new Set(listeners) });
    return () => {
      listeners.delete(listener);
      set({ messageListeners: new Set(listeners) });
    };
  },

  // Reaction listeners registration
  addReactionListener: (listener) => {
    const listeners = get().reactionListeners;
    listeners.add(listener);
    set({ reactionListeners: new Set(listeners) });
    return () => {
      listeners.delete(listener);
      set({ reactionListeners: new Set(listeners) });
    };
  },

  // Conversation listeners registration
  addConversationListener: (listener) => {
    const listeners = get().conversationListeners;
    listeners.add(listener);
    set({ conversationListeners: new Set(listeners) });
    return () => {
      listeners.delete(listener);
      set({ conversationListeners: new Set(listeners) });
    };
  },

  clearNotifications: () => set({ notifications: [], unreadNotifCount: 0 }),
  clearMessages: () => set({ incomingMessages: [], lastMessage: null }),
  setUnreadNotifCount: (count) => set({ unreadNotifCount: count }),
  decrementUnreadNotifCount: () =>
    set((state) => ({ unreadNotifCount: Math.max(0, state.unreadNotifCount - 1) })),
}));

export default useWebSocketStore;
