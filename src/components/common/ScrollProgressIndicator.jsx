import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import soundFX from '../../utils/soundEffects';

export const ScrollProgressIndicator = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        setScrollProgress(progress);
        setIsVisible(scrollTop > 250);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    soundFX.playPop();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          title={`Đã cuộn ${Math.round(scrollProgress)}% - Nhấn để lên đầu trang`}
          aria-label="Cuộn lên đầu trang"
          className="fixed bottom-20 md:bottom-8 right-5 z-40 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg shadow-black/10 dark:shadow-indigo-950/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group cursor-pointer"
        >
          {/* Circular SVG Meter */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-slate-200/70 dark:text-slate-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-indigo-600 dark:text-indigo-400 transition-all duration-150"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Icon or Percentage on hover */}
          <div className="relative z-10 flex items-center justify-center">
            {isHovered ? (
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                {Math.round(scrollProgress)}%
              </span>
            ) : (
              <ArrowUp className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors stroke-[2.4]" />
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollProgressIndicator;
