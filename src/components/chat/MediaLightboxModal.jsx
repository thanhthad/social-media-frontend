import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink } from 'lucide-react';

export default function MediaLightboxModal({ isOpen, onClose, mediaUrl, mediaType = 'IMAGE' }) {
  if (!isOpen || !mediaUrl) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Top Control Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-full backdrop-blur-md transition shadow-md"
            title="Mở trong tab mới"
          >
            <ExternalLink size={18} />
          </a>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-full backdrop-blur-md transition shadow-md"
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Media Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-4xl max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {mediaType === 'VIDEO' || mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Expanded preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain select-none shadow-2xl"
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
