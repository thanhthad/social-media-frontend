import { motion } from 'framer-motion';

export const REACTION_ICONS = {
  LIKE: {
    emoji: '👍',
    label: 'Thích',
    color: 'text-blue-600 font-bold',
    bg: 'bg-blue-50',
    iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Thumbs%20Up.png',
  },
  LOVE: {
    emoji: '❤️',
    label: 'Yêu thích',
    color: 'text-rose-600 font-bold',
    bg: 'bg-rose-50',
    iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Red%20Heart.png',
  },
  HAHA: {
    emoji: '😆',
    label: 'Haha',
    color: 'text-amber-500 font-bold',
    bg: 'bg-amber-50',
    iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Squinting%20Face.png',
  },
  WOW: {
    emoji: '😮',
    label: 'Wow',
    color: 'text-amber-500 font-bold',
    bg: 'bg-amber-50',
    iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Open%20Mouth.png',
  },
  SAD: {
    emoji: '😢',
    label: 'Buồn',
    color: 'text-amber-500 font-bold',
    bg: 'bg-amber-50',
    iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Crying%20Face.png',
  },
  ANGRY: {
    emoji: '😡',
    label: 'Phẫn nộ',
    color: 'text-orange-600 font-bold',
    bg: 'bg-orange-50',
    iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Enraged%20Face.png',
  },
};

export const REACTION_TYPES = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'];

export default function ReactionPicker({ onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className="absolute bottom-full left-0 mb-3 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur-xl px-2 py-1.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.18)] border border-gray-100 ring-1 ring-black/5 select-none"
    >
      {REACTION_TYPES.map((type, idx) => {
        const item = REACTION_ICONS[type];
        return (
          <motion.button
            key={type}
            type="button"
            initial={{ opacity: 0, scale: 0.5, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.03, type: 'spring', stiffness: 500, damping: 20 }}
            whileHover={{ scale: 1.45, y: -6 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(type);
              if (onClose) onClose();
            }}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100/70 transition-colors cursor-pointer"
            title={item.label}
          >
            <img
              src={item.iconUrl}
              alt={item.label}
              className="w-7 h-7 object-contain transform transition-transform group-hover:scale-115 drop-shadow-sm pointer-events-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'inline';
                }
              }}
            />
            <span className="text-2xl select-none leading-none hidden">
              {item.emoji}
            </span>

            {/* Floating Tooltip */}
            <span className="absolute -top-8 px-2 py-0.5 bg-gray-900/90 text-white text-[11px] font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md backdrop-blur-xs">
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
