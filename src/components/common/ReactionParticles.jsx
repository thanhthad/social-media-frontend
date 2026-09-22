import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_EMOJIS = ['❤️', '✨', '🔥', '💖', '🎉', '🌟'];

export const ReactionParticles = ({
  triggerKey,
  emojis = DEFAULT_EMOJIS,
  particleCount = 10,
  className = '',
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!triggerKey) return;

    // Generate random particle trajectories
    const newParticles = Array.from({ length: particleCount }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 45 + Math.random() * 55;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      return {
        id: `${triggerKey}-${index}-${Date.now()}`,
        emoji,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 25, // Upward bias
        rotation: (Math.random() - 0.5) * 60,
        scale: 0.7 + Math.random() * 0.6,
      };
    });

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 950);

    return () => clearTimeout(timer);
  }, [triggerKey, particleCount, emojis]);

  if (particles.length === 0) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 flex items-center justify-center z-50 ${className}`}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0.2, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0.3, p.scale, p.scale * 0.8],
              x: p.x,
              y: p.y,
              rotate: p.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1], // snappy cubic bezier
            }}
            className="absolute select-none text-lg sm:text-xl drop-shadow-md"
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReactionParticles;
