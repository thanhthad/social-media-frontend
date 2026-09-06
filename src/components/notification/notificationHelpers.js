/**
 * Shared notification helper utilities used by NotificationDropdown,
 * NotificationBanner, and NotificationsPage.
 */

/**
 * Returns an emoji icon for a notification type.
 */
export function getNotifIcon(type) {
  switch (type) {
    case 'POST_REACTION':     return '❤️';
    case 'COMMENT_REACTION':  return '👍';
    case 'POST_COMMENT':
    case 'COMMENT':           return '💬';
    case 'COMMENT_REPLY':     return '↩️';
    case 'FRIEND_REQUEST':    return '👥';
    case 'FRIEND_ACCEPTED':   return '✅';
    case 'FOLLOW':            return '➕';
    default:                  return '🔔';
  }
}

/**
 * Returns Tailwind background-color class for the accent line / indicator.
 */
export function getNotifBgColor(type) {
  switch (type) {
    case 'POST_REACTION':
    case 'COMMENT_REACTION':  return 'bg-rose-500';
    case 'POST_COMMENT':
    case 'COMMENT':
    case 'COMMENT_REPLY':     return 'bg-indigo-500';
    case 'FRIEND_REQUEST':
    case 'FRIEND_ACCEPTED':   return 'bg-emerald-500';
    case 'FOLLOW':            return 'bg-sky-500';
    default:                  return 'bg-indigo-500';
  }
}

/**
 * Returns Tailwind text-color class for the icon.
 */
export function getNotifTextColor(type) {
  switch (type) {
    case 'POST_REACTION':
    case 'COMMENT_REACTION':  return 'text-rose-600 bg-rose-100';
    case 'POST_COMMENT':
    case 'COMMENT':
    case 'COMMENT_REPLY':     return 'text-indigo-600 bg-indigo-100';
    case 'FRIEND_REQUEST':
    case 'FRIEND_ACCEPTED':   return 'text-emerald-600 bg-emerald-100';
    case 'FOLLOW':            return 'text-sky-600 bg-sky-100';
    default:                  return 'text-indigo-600 bg-indigo-100';
  }
}

/**
 * Returns the navigate URL for a notification.
 * Uses targetUrl from server if available, else derives from type/entityId.
 */
export function getNotifUrl(notif) {
  if (notif.targetUrl) return notif.targetUrl;
  if (notif.type === 'FRIEND_REQUEST' || notif.type === 'FRIEND_ACCEPTED') return '/friends';
  if (notif.entityType === 'POST' && notif.entityId) return `/posts/${notif.entityId}`;
  if (notif.senderId) return `/users/${notif.senderId}`;
  return '/';
}

/**
 * Groups notifications by relative day label.
 */
export function groupNotificationsByDay(notifications) {
  const groups = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const seen = new Map();

  for (const notif of notifications) {
    const d = new Date(notif.createdAt);
    d.setHours(0, 0, 0, 0);

    let label;
    if (d >= today) label = 'Hôm nay';
    else if (d >= yesterday) label = 'Hôm qua';
    else if (d >= weekAgo) label = 'Tuần này';
    else label = 'Cũ hơn';

    if (!seen.has(label)) {
      seen.set(label, []);
      groups.push({ label, items: seen.get(label) });
    }
    seen.get(label).push(notif);
  }
  return groups;
}
