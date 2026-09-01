import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, X, ArrowRight, Flame } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

export default function MatchModal({ isOpen, onClose, matchProfile }) {
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Confetti / Heart particle explosion
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#38bdf8', '#fbbf24', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 3,
        gravity: 0.15,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        isHeart: Math.random() > 0.4,
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.isHeart) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const s = p.radius;
          ctx.moveTo(0, s / 3);
          ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
          ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, s / 3);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (particles.length > 0) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen || !matchProfile) return null;

  const myAvatar = currentUser?.avatarUrl || 'https://via.placeholder.com/150';
  const theirAvatar =
    matchProfile.avatarUrl ||
    matchProfile.photos?.[0]?.url ||
    'https://via.placeholder.com/150';
  const name = matchProfile.displayName || matchProfile.username || 'Người ấy';

  const icebreakers = [
    'Chào bạn! Rất vui được tương hợp cùng bạn ✨',
    'Cuối tuần này bạn có kế hoạch gì thú vị không? ☕',
    'Gu nghe nhạc của bạn thế nào? 🎵',
  ];

  const handleStartChat = (customText) => {
    onClose();
    navigate('/messages', {
      state: {
        autoOpenUserId: matchProfile.userId || matchProfile.id,
        initialText: customText || '',
      },
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
        {/* Canvas particles */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-20 w-full max-w-md bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950 border border-white/10 rounded-[36px] p-8 text-center shadow-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-r from-pink-500/30 to-purple-600/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition"
          >
            <X size={18} />
          </button>

          {/* Sparkle Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Flame size={15} className="text-pink-400 animate-pulse" />
            Tương Hợp Mới!
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 mb-2 italic tracking-tight drop-shadow-md">
            It's a Match!
          </h2>
          <p className="text-white/80 text-sm font-medium mb-8">
            Bạn và <span className="text-pink-400 font-bold">{name}</span> đều có ấn tượng đặc biệt về nhau!
          </p>

          {/* Intertwined Avatars */}
          <div className="flex justify-center items-center gap-6 mb-8 relative py-4">
            <motion.div
              initial={{ x: -80, scale: 0.5, rotate: -20 }}
              animate={{ x: 0, scale: 1, rotate: -6 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-pink-500 shadow-2xl shadow-pink-500/40 overflow-hidden relative z-10 transform -rotate-6"
            >
              <img src={myAvatar} alt="You" className="w-full h-full object-cover" />
            </motion.div>

            {/* Glowing Pulsing Heart in Center */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="absolute z-20 w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-xl shadow-pink-500/60 border-2 border-white"
            >
              <Heart size={26} className="fill-current" />
            </motion.div>

            <motion.div
              initial={{ x: 80, scale: 0.5, rotate: 20 }}
              animate={{ x: 0, scale: 1, rotate: 6 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-purple-500 shadow-2xl shadow-purple-500/40 overflow-hidden relative z-10 transform rotate-6"
            >
              <img src={theirAvatar} alt={name} className="w-full h-full object-cover" />
            </motion.div>
          </div>

          {/* Icebreaker suggestions */}
          <div className="space-y-2 mb-6 text-left">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-1">
              Gợi ý mở lời bắt đầu:
            </p>
            {icebreakers.map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleStartChat(text)}
                className="w-full text-left p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 rounded-xl text-xs text-white/90 transition flex items-center justify-between group"
              >
                <span className="truncate">{text}</span>
                <ArrowRight size={14} className="text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleStartChat()}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/30 transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle size={18} />
              Nhắn tin ngay
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold text-xs transition active:scale-95"
            >
              Tiếp tục tìm kiếm
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
