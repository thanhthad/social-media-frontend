import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import datingService from '../services/datingService';
import conversationService from '../services/conversationService';
import toast from 'react-hot-toast';
import {
  Heart,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  UserX,
  Flame,
  Clock,
  User,
} from 'lucide-react';

export default function DatingMatchesPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChatUserId, setStartingChatUserId] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await datingService.getMyMatches();
      const list = res.data?.data || res.data || [];
      setMatches(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load matches', err);
      toast.error('Không thể tải danh sách tương hợp');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (matchedUserId) => {
    if (!matchedUserId) return;
    setStartingChatUserId(matchedUserId);
    try {
      const res = await conversationService.createPrivateConversation(matchedUserId);
      const conv = res.data?.data || res.data;
      const convId = conv?.id || conv?.conversationId;
      toast.success('Đang mở đoạn chat...');
      navigate('/messages', { state: { activeConvId: convId } });
    } catch (err) {
      console.error('Failed to start chat', err);
      navigate('/messages');
    } finally {
      setStartingChatUserId(null);
    }
  };

  const handleUnmatch = async (matchId, partnerName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn huỷ tương hợp với ${partnerName || 'người này'} không?`)) {
      return;
    }
    try {
      await datingService.unmatch(matchId);
      setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
      toast.success('Đã huỷ tương hợp.');
    } catch (err) {
      console.error('Failed to unmatch', err);
      toast.error('Không thể huỷ tương hợp');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 px-3 sm:px-4 space-y-4">
      {/* ── Top Header ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dating"
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-700 transition active:scale-95"
            title="Quay lại Hẹn hò"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Tương Hợp Của Bạn</h1>
              <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[11px] font-bold rounded-full shadow-xs">
                {matches.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-semibold">
              Những người đã cùng thích hồ sơ hẹn hò của bạn
            </p>
          </div>
        </div>

        <Link
          to="/dating"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-2xl text-xs font-bold transition active:scale-95"
        >
          <Flame size={15} className="fill-current text-pink-500" />
          <span>Quẹt thẻ</span>
        </Link>
      </div>

      {/* ── Main Content ── */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-400">Đang tải danh sách kết đôi...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto ring-8 ring-pink-50/50">
            <Heart size={32} className="fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Chưa có lượt tương hợp nào</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Hãy tiếp tục khám phá và thả tim cho những hồ sơ bạn ấn tượng để nhận được lượt ghép đôi nhé!
            </p>
          </div>
          <Link
            to="/dating"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition transform active:scale-95 text-xs"
          >
            <Sparkles size={16} />
            <span>Khám phá ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {matches.map((item) => {
            const mId = item.matchId;
            const targetId = item.matchedUserId;
            const isStarting = startingChatUserId === targetId;

            return (
              <div
                key={mId || targetId}
                className="bg-white rounded-3xl p-4 shadow-xs border border-gray-100 hover:border-pink-200 hover:shadow-md transition flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start gap-3.5">
                  {/* Avatar with Gradient Ring */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-pink-500 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-tr from-pink-500 to-rose-600 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                      <Heart size={10} className="fill-current" />
                    </span>
                  </div>

                  {/* Partner Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-gray-900 truncate group-hover:text-pink-600 transition">
                      {item.name || item.username}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">@{item.username}</p>
                    {item.bio && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => handleStartChat(targetId)}
                    disabled={isStarting}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>{isStarting ? 'Đang mở...' : 'Nhắn tin'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUnmatch(mId, item.name || item.username)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Huỷ tương hợp"
                  >
                    <UserX size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
