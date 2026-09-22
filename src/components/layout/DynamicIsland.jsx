import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Radio,
  Plus,
  Compass,
  Image as ImageIcon,
  Activity,
  ChevronDown,
} from 'lucide-react';
import ambientSynth from '../../utils/ambientSynth';
import soundFX from '../../utils/soundEffects';

export const DynamicIsland = ({
  onOpenCreatePost,
  onOpenCreateStory,
  stardustEnabled,
  onToggleStardust,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const isRadioPlaying = ambientSynth.isPlaying;

  const handleToggle = () => {
    soundFX.playPop();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 select-none hidden md:block">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={handleToggle}
        className={`bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl border border-slate-700/60 shadow-xl text-white cursor-pointer overflow-hidden ${
          isExpanded
            ? 'w-[420px] rounded-3xl p-4'
            : 'h-8 px-3.5 rounded-full flex items-center gap-2 hover:border-indigo-500/50'
        }`}
      >
        {/* COMPACT PILL MODE */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs font-semibold w-full justify-between"
          >
            {isRadioPlaying ? (
              <div className="flex items-center gap-2 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Radio className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px] text-slate-200">
                  {ambientSynth.currentTrack?.toUpperCase() || 'LO-FI RADIO'}
                </span>
                <div className="flex items-end gap-0.5 h-2.5">
                  <span className="w-0.5 h-2 bg-indigo-400 animate-bounce" />
                  <span className="w-0.5 h-3 bg-indigo-400 animate-bounce delay-75" />
                  <span className="w-0.5 h-1.5 bg-indigo-400 animate-bounce delay-150" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] font-bold tracking-wide text-slate-300">
                  Kafka Mesh: <span className="text-emerald-400">1,420 ev/s</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
              <span>Island</span>
            </div>
          </motion.div>
        )}

        {/* EXPANDED SMART DASHBOARD */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="space-y-3.5"
          >
            {/* Top Island Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">
                    SocialDB Dynamic Island
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Kafka Cluster: 100% HEALTHY • 0ms LAG
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Social Actions */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  if (onOpenCreatePost) onOpenCreatePost();
                  setIsExpanded(false);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/50 transition cursor-pointer group"
              >
                <Plus className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-200">Đăng bài</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  if (onOpenCreateStory) onOpenCreateStory();
                  setIsExpanded(false);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-800/80 hover:bg-pink-600/30 border border-slate-700/60 hover:border-pink-500/50 transition cursor-pointer group"
              >
                <ImageIcon className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-200">Tạo tin 24h</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playTabClick();
                  navigate('/search');
                  setIsExpanded(false);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-800/80 hover:bg-cyan-600/30 border border-slate-700/60 hover:border-cyan-500/50 transition cursor-pointer group"
              >
                <Compass className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-200">Khám phá</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  if (onToggleStardust) onToggleStardust();
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition cursor-pointer group ${
                  stardustEnabled
                    ? 'bg-purple-600/30 border-purple-500/60'
                    : 'bg-slate-800/80 hover:bg-purple-600/20 border-slate-700/60'
                }`}
              >
                <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-200">
                  {stardustEnabled ? 'Vũ trụ: Bật' : 'Vũ trụ: Tắt'}
                </span>
              </button>
            </div>

            {/* Live Metrics Ticker */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-800/50 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Kafka Event Mesh: Real-Time
              </span>
              <span className="text-emerald-400 font-mono font-bold">● ACTIVE</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DynamicIsland;
