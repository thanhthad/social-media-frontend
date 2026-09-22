import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  Disc,
  CloudRain,
  Rocket,
  Coffee,
  Flame,
  ChevronDown,
} from 'lucide-react';
import ambientSynth from '../../utils/ambientSynth';
import soundFX from '../../utils/soundEffects';

const TRACKS = [
  { id: 'rain', name: 'Mưa đêm Cyber', icon: CloudRain, color: 'text-cyan-400' },
  { id: 'space', name: 'Vũ trụ sâu thẳm', icon: Rocket, color: 'text-purple-400' },
  { id: 'cafe', name: 'Góc Cafe Lo-Fi', icon: Coffee, color: 'text-amber-400' },
  { id: 'campfire', name: 'Lửa trại ấm cúng', icon: Flame, color: 'text-rose-400' },
];

export const AmbientRadio = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('cafe');
  const [volume, setVolume] = useState(0.5);

  const togglePlay = () => {
    soundFX.playPop();
    if (isPlaying) {
      ambientSynth.stop();
      setIsPlaying(false);
    } else {
      ambientSynth.playTrack(currentTrack);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (trackId) => {
    soundFX.playTabClick();
    setCurrentTrack(trackId);
    ambientSynth.playTrack(trackId);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientSynth.setVolume(val);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => ambientSynth.stop();
  }, []);

  const activeTrackObj = TRACKS.find((t) => t.id === currentTrack) || TRACKS[0];

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-40 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            className="mb-3 w-64 sm:w-72 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-4 shadow-2xl text-white overflow-hidden relative"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Ambient Lo-Fi Radio
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Now Playing Info */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/40 mb-3">
              <motion.div
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30"
              >
                <Disc className="w-5 h-5" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {activeTrackObj.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isPlaying ? 'Đang phát sóng...' : 'Tạm dừng'}
                  </span>
                </div>
              </div>

              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-sm active:scale-95 shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>

            {/* Track Selector Grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {TRACKS.map((track) => {
                const isCurrent = currentTrack === track.id;
                const Icon = track.icon;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(track.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                        : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${track.color}`} />
                    <span className="text-[11px] font-semibold truncate">{track.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 px-1 text-slate-400">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mini Vinyl Launcher */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          soundFX.playPop();
          setIsOpen(!isOpen);
        }}
        className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg text-white group cursor-pointer"
        title="Bật Trạm Radio Lo-Fi Không Gian"
      >
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0"
        >
          <Disc className="w-3.5 h-3.5" />
          {isPlaying && (
            <span className="absolute inset-0 rounded-full ring-2 ring-indigo-400 animate-ping opacity-50" />
          )}
        </motion.div>

        {/* Dynamic Animated Equalizer Bars */}
        <div className="flex items-end gap-0.5 h-3.5 px-0.5">
          {[0.6, 1.2, 0.4, 0.9].map((height, idx) => (
            <motion.span
              key={idx}
              animate={
                isPlaying
                  ? { height: ['3px', '14px', '4px', '12px'] }
                  : { height: '3px' }
              }
              transition={
                isPlaying
                  ? {
                      duration: 0.7 + idx * 0.15,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : {}
              }
              className="w-0.5 rounded-full bg-indigo-400"
            />
          ))}
        </div>

        <span className="text-[11px] font-bold hidden sm:inline text-slate-200">
          Lo-Fi Radio
        </span>
      </motion.button>
    </div>
  );
};

export default AmbientRadio;
