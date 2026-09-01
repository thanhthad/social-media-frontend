import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import reelService from '../../services/reelService';

export default function ReelShareModal({ isOpen, onClose, reel, onShareSuccess }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !reel) return null;

  const shareUrl = `${window.location.origin}/reels?reelId=${reel.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Đã sao chép liên kết Reel vào clipboard!');
      reelService.incrementShare(reel.id).catch(() => {});
      if (onShareSuccess) onShareSuccess();
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Không thể sao chép liên kết');
    }
  };

  const handleSocialShare = (platform) => {
    reelService.incrementShare(reel.id).catch(() => {});
    if (onShareSuccess) onShareSuccess();

    let url = '';
    const text = encodeURIComponent(`Xem video Reel này của @${reel.username}: ${reel.content || ''}`);

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(shareUrl)}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Share2 size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Chia sẻ Reel</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Reel preview snippet */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            {reel.thumbnailUrl ? (
              <img
                src={reel.thumbnailUrl}
                alt=""
                className="w-12 h-16 object-cover rounded-xl shadow-sm"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 font-bold">
                Reel
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-800 truncate">@{reel.username}</p>
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                {reel.content || 'Video Reel'}
              </p>
            </div>
          </div>

          {/* Social share icons */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col items-center gap-1.5 group p-2 hover:bg-blue-50 rounded-2xl transition"
            >
              <div className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-600">Facebook</span>
            </button>

            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex flex-col items-center gap-1.5 group p-2 hover:bg-gray-100 rounded-2xl transition"
            >
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-600">X (Twitter)</span>
            </button>

            <button
              onClick={() => handleSocialShare('telegram')}
              className="flex flex-col items-center gap-1.5 group p-2 hover:bg-sky-50 rounded-2xl transition"
            >
              <div className="w-12 h-12 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
                <Send size={20} className="-ml-0.5" />
              </div>
              <span className="text-[11px] font-semibold text-gray-600">Telegram</span>
            </button>

            <button
              onClick={() => handleSocialShare('whatsapp')}
              className="flex flex-col items-center gap-1.5 group p-2 hover:bg-emerald-50 rounded-2xl transition"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
                <MessageCircle size={22} />
              </div>
              <span className="text-[11px] font-semibold text-gray-600">WhatsApp</span>
            </button>
          </div>

          {/* Copy link input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600">Liên kết chia sẻ</label>
            <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-3 text-xs text-gray-600 outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
