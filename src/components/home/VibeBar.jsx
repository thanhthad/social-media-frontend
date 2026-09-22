import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Coffee, Code2, Music, Rocket, Zap, Smile } from 'lucide-react';
import soundFX from '../../utils/soundEffects';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const VIBES = [
  { id: 'trending', label: 'Tất cả', icon: Sparkles, color: 'from-indigo-500 to-purple-500' },
  { id: 'fire', label: 'Bùng nổ', icon: Flame, color: 'from-rose-500 to-orange-500', emoji: '🔥' },
  { id: 'chill', label: 'Thư giãn', icon: Coffee, color: 'from-amber-500 to-yellow-500', emoji: '☕' },
  { id: 'dev', label: 'Đang code', icon: Code2, color: 'from-cyan-500 to-blue-500', emoji: '💻' },
  { id: 'music', label: 'Nghe nhạc', icon: Music, color: 'from-fuchsia-500 to-pink-500', emoji: '🎵' },
  { id: 'ship', label: 'Sáng tạo', icon: Rocket, color: 'from-emerald-500 to-teal-500', emoji: '🚀' },
];

export const VibeBar = ({ activeVibe, onSelectVibe }) => {
  const [selected, setSelected] = useState(activeVibe || 'trending');
  const { isAuthenticated } = useAuth();

  const handleSelect = (vibe) => {
    soundFX.playTabClick();
    setSelected(vibe.id);
    if (onSelectVibe) onSelectVibe(vibe.id);

    if (vibe.emoji) {
      toast(`Tâm trạng hôm nay: ${vibe.emoji} ${vibe.label}`, {
        icon: vibe.emoji,
        duration: 2000,
      });
    }
  };

  return (
    <div className="relative mb-5 select-none">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 px-1 shrink-0 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Vibe</span>
        </div>

        {VIBES.map((vibe) => {
          const isSelected = selected === vibe.id;
          const Icon = vibe.icon;

          return (
            <motion.button
              key={vibe.id}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(vibe)}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                isSelected
                  ? 'text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="vibe-active-pill"
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${vibe.color}`}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{vibe.label}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VibeBar;
