import { useState, useEffect } from 'react';
import storyService from '../../services/storyService';
import { useUser } from '../../contexts/UserContext';
import CreateStoryModal from './CreateStoryModal';
import StoryViewerModal from './StoryViewerModal';
import { Plus } from 'lucide-react';

export default function StoryBar() {
  const { user } = useUser();
  const [feedStories, setFeedStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewerState, setViewerState] = useState({ open: false, index: 0, stories: [] });

  const fetchStories = async () => {
    try {
      const [feedRes, myRes] = await Promise.all([
        storyService.getFeed().catch(() => ({ data: { data: [] } })),
        storyService.getMyStories().catch(() => ({ data: { data: [] } })),
      ]);

      const fData = feedRes.data?.data || [];
      const mData = myRes.data?.data || [];
      setFeedStories(Array.isArray(fData) ? fData : []);
      setMyStories(Array.isArray(mData) ? mData : (mData ? [mData] : []));
    } catch (err) {
      console.error('Failed to load stories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Combine my story (if exists) + other users' stories
  const allStories = [
    ...(myStories.length > 0
      ? [
          {
            userId: user?.id,
            username: user?.username || 'Tin của bạn',
            avatarUrl: user?.avatarUrl,
            url: myStories[0]?.url,
            mediaType: myStories[0]?.mediaType,
            content: myStories[0]?.content,
            isMine: true,
          },
        ]
      : []),
    ...feedStories.filter((s) => s.userId !== user?.id),
  ];

  const handleOpenViewer = (index) => {
    setViewerState({ open: true, index, stories: allStories });
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-4 border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto pb-1 no-scrollbar">
          {/* Your Story (Create / View) */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group select-none">
            <div
              onClick={() => {
                if (myStories.length > 0) {
                  handleOpenViewer(0);
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="relative p-[2.5px] rounded-full group-hover:scale-105 transition-transform duration-200"
            >
              {/* Gradient ring if has story, else subtle ring */}
              <div
                className={`p-[2px] rounded-full ${
                  myStories.length > 0
                    ? 'bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 shadow-md shadow-indigo-500/20'
                    : 'bg-slate-200'
                }`}
              >
                <div className="p-[2px] bg-white rounded-full">
                  <img
                    src={user?.avatarUrl || 'https://via.placeholder.com/150'}
                    alt=""
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Indigo Plus Button */}
              {myStories.length === 0 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateModal(true);
                  }}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs"
                >
                  <Plus size={14} strokeWidth={3} />
                </div>
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[72px] text-center">
              Tin của bạn
            </span>
          </div>

          {/* Skeletons while loading */}
          {loading &&
            [1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1.5 flex-shrink-0 animate-pulse">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200" />
                <div className="w-12 h-2.5 bg-slate-200 rounded-full" />
              </div>
            ))}

          {/* Feed Stories */}
          {!loading &&
            feedStories
              .filter((s) => s.userId !== user?.id)
              .map((story, idx) => {
                const actualIdx = myStories.length > 0 ? idx + 1 : idx;
                return (
                  <div
                    key={`story-${story.storyId || story.id || story.userId || idx}-${idx}`}
                    onClick={() => handleOpenViewer(actualIdx)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group select-none"
                  >
                    <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                      <div className="p-[2px] bg-white rounded-full">
                        <img
                          src={story.avatarUrl || 'https://via.placeholder.com/150'}
                          alt={story.username}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-800 truncate max-w-[72px] text-center">
                      {story.username}
                    </span>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateStoryModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchStories}
        />
      )}

      {viewerState.open && (
        <StoryViewerModal
          stories={viewerState.stories}
          initialIndex={viewerState.index}
          currentUserId={user?.id}
          onClose={() => setViewerState({ open: false, index: 0, stories: [] })}
          onStoryDeleted={fetchStories}
        />
      )}
    </>
  );
}
