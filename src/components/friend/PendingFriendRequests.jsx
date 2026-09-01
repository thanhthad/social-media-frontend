import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import friendshipService from '../../services/friendshipService';
import toast from 'react-hot-toast';
import { UserCheck, UserX, UserPlus, Sparkles, Clock } from 'lucide-react';

export default function PendingFriendRequests({ onActionSuccess, limit = null, isWidget = false }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState({});

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await friendshipService.getPendingFriendRequests(0, 20);
      const data = res.data?.data?.content || res.data?.data || [];
      const list = Array.isArray(data) ? data : [];
      setRequests(limit ? list.slice(0, limit) : list);
    } catch (err) {
      console.error('Failed to load pending friend requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId) => {
    setProcessingIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await friendshipService.acceptFriendRequest(userId);
      toast.success('Đã chấp nhận lời mời kết bạn!');
      setRequests((prev) => prev.filter((r) => (r.userId || r.id) !== userId));
      if (onActionSuccess) onActionSuccess(userId, 'accepted');
    } catch (err) {
      console.error('Failed to accept friend request:', err);
      toast.error(err.response?.data?.message || 'Không thể chấp nhận lời mời');
    } finally {
      setProcessingIds((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleReject = async (userId) => {
    setProcessingIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await friendshipService.rejectFriendRequest(userId);
      toast.success('Đã từ chối lời mời kết bạn');
      setRequests((prev) => prev.filter((r) => (r.userId || r.id) !== userId));
      if (onActionSuccess) onActionSuccess(userId, 'rejected');
    } catch (err) {
      console.error('Failed to reject friend request:', err);
      toast.error(err.response?.data?.message || 'Không thể từ chối lời mời');
    } finally {
      setProcessingIds((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (!loading && requests.length === 0 && isWidget) {
    return null;
  }

  if (isWidget) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-indigo-600" />
            Lời mời kết bạn
            {requests.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </h3>
          <Link
            to="/friends"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            [1, 2].map((n) => (
              <div key={n} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : (
            requests.map((req) => {
              const reqId = req.userId || req.id;
              const isProcessing = processingIds[reqId];
              return (
                <div
                  key={reqId}
                  className="p-3 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 transition"
                >
                  <Link
                    to={`/users/${reqId}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <img
                      src={req.avatarUrl || 'https://via.placeholder.com/40'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-xs truncate hover:text-blue-600 transition">
                        {req.fullName || req.username}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">@{req.username}</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(reqId)}
                      disabled={isProcessing}
                      className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <UserCheck size={14} />
                      Xác nhận
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(reqId)}
                      disabled={isProcessing}
                      className="py-1.5 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                      title="Xóa lời mời"
                    >
                      <UserX size={14} />
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => {
            const reqId = req.userId || req.id;
            const isProcessing = processingIds[reqId];
            return (
              <div
                key={reqId}
                className="p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition flex flex-col items-center text-center space-y-3"
              >
                <img
                  src={req.avatarUrl || 'https://via.placeholder.com/64'}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="w-full">
                  <Link
                    to={`/users/${reqId}`}
                    className="font-bold text-gray-900 text-sm hover:text-blue-600 truncate block"
                  >
                    {req.fullName || req.username}
                  </Link>
                  <p className="text-xs text-gray-400 truncate mt-0.5">@{req.username}</p>
                </div>

                <div className="flex items-center gap-2 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => handleAccept(reqId)}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <UserCheck size={14} />
                    Xác nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(reqId)}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    <UserX size={14} />
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-400 space-y-2">
          <Clock size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="font-semibold text-gray-700 text-sm">Không có lời mời kết bạn nào</p>
          <p className="text-xs text-gray-400">
            Khi có ai đó gửi lời mời kết bạn cho bạn, yêu cầu sẽ hiển thị tại đây.
          </p>
        </div>
      )}
    </div>
  );
}
