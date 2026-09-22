import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export const HeartBurst = ({ show, onComplete }) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-40">
          {/* Outer glow ring */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute w-28 h-28 rounded-full bg-rose-500/30 blur-xl"
          />

          {/* Core Heart */}
          <motion.div
            initial={{ scale: 0, rotate: -25, opacity: 0 }}
            animate={{
              scale: [0, 1.35, 1],
              rotate: [-25, 10, 0],
              opacity: [0, 1, 0.95],
            }}
            exit={{
              scale: 1.6,
              opacity: 0,
              y: -40,
              transition: { duration: 0.45, ease: 'easeIn' },
            }}
            transition={{
              duration: 0.55,
              times: [0, 0.6, 1],
              ease: [0.175, 0.885, 0.32, 1.275], // Bouncy spring
            }}
            className="relative"
          >
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_10px_25px_rgba(244,63,94,0.6)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-wider uppercase opacity-90">
                ❤️
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HeartBurst;
