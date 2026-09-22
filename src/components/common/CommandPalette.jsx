import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Compass,
  Film,
  MessageCircle,
  Users,
  Heart,
  Bookmark,
  User,
  Settings,
  PlusCircle,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Palette,
  Sparkles,
  CornerDownLeft,
  X,
} from 'lucide-react';
import soundFX from '../../utils/soundEffects';
import { THEME_ACCENTS } from '../../utils/themeAccents';
import { useSocial } from '../../contexts/MockSocialContext';

export const CommandPalette = ({
  isOpen,
  onClose,
  onOpenCreatePost,
  onOpenCreateStory,
  onToggleStardust,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme, accentTheme, setAccentTheme, soundEnabled, toggleSound } = useSocial();

  // Focus on mount
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allItems = [
    // --- Điều hướng ---
    {
      id: 'nav-home',
      group: 'Điều hướng nhanh',
      label: 'Trang chủ',
      subtitle: 'Xem bảng tin bài viết mới nhất',
      icon: Home,
      action: () => navigate('/'),
    },
    {
      id: 'nav-explore',
      group: 'Điều hướng nhanh',
      label: 'Khám phá bài viết & Mọi người',
      subtitle: 'Tìm kiếm nội dung và xu hướng',
      icon: Compass,
      action: () => navigate('/search'),
    },
    {
      id: 'nav-reels',
      group: 'Điều hướng nhanh',
      label: 'Reels Video ngắn',
      subtitle: 'Trải nghiệm video lướt phong cách TikTok',
      icon: Film,
      action: () => navigate('/reels'),
    },
    {
      id: 'nav-messages',
      group: 'Điều hướng nhanh',
      label: 'Tin nhắn & Trò chuyện',
      subtitle: 'Hộp thư trực tiếp thời gian thực',
      icon: MessageCircle,
      action: () => navigate('/messages'),
    },
    {
      id: 'nav-friends',
      group: 'Điều hướng nhanh',
      label: 'Danh sách bạn bè',
      subtitle: 'Xem lời mời và gợi ý kết bạn',
      icon: Users,
      action: () => navigate('/friends'),
    },
    {
      id: 'nav-dating',
      group: 'Điều hướng nhanh',
      label: 'SocialDB Dating',
      subtitle: 'Hẹn hò ghép đôi thông minh',
      icon: Heart,
      action: () => navigate('/dating'),
    },
    {
      id: 'nav-saved',
      group: 'Điều hướng nhanh',
      label: 'Bài viết đã lưu',
      subtitle: 'Bộ sưu tập bài viết yêu thích của bạn',
      icon: Bookmark,
      action: () => navigate('/saved'),
    },
    {
      id: 'nav-profile',
      group: 'Điều hướng nhanh',
      label: 'Trang cá nhân',
      subtitle: 'Xem trang cá nhân của bạn',
      icon: User,
      action: () => navigate('/profile'),
    },
    {
      id: 'nav-settings',
      group: 'Điều hướng nhanh',
      label: 'Cài đặt tài khoản',
      subtitle: 'Tùy chỉnh quyền riêng tư và giao diện',
      icon: Settings,
      action: () => navigate('/settings'),
    },

    // --- Tác vụ nhanh ---
    {
      id: 'act-create-post',
      group: 'Tác vụ sáng tạo',
      label: 'Tạo bài viết mới',
      subtitle: 'Chia sẻ hình ảnh, video và suy nghĩ',
      icon: PlusCircle,
      action: () => {
        if (onOpenCreatePost) onOpenCreatePost();
      },
    },
    {
      id: 'act-create-story',
      group: 'Hành động nổi bật',
      label: 'Đăng tin 24h (Story)',
      subtitle: 'Tạo khoảnh khắc biến mất sau 24 giờ',
      icon: Sparkles,
      action: () => {
        if (onOpenCreateStory) onOpenCreateStory();
      },
    },

    // --- Giao diện & Âm thanh ---
    {
      id: 'act-toggle-stardust',
      group: 'Tùy biến giao diện',
      label: 'Bật / Tắt Vũ trụ Hạt Tương Tác (Cosmic Galaxy)',
      subtitle: 'Hiệu ứng tinh vân bụi sao lấp lánh phản hồi theo chuyển động chuột',
      icon: Sparkles,
      colorHex: '#a855f7',
      action: () => {
        if (onToggleStardust) onToggleStardust();
      },
    },
    {
      id: 'theme-toggle',
      group: 'Tùy biến giao diện',
      label: theme === 'dark' ? 'Chuyển sang Chế độ sáng (Light Mode)' : 'Chuyển sang Chế độ tối (Dark Mode)',
      subtitle: 'Bảo vệ mắt và tối ưu tương phản',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme(),
    },
    {
      id: 'sound-toggle',
      group: 'Tùy biến giao diện',
      label: soundEnabled ? 'Tắt hiệu ứng âm thanh (Mute)' : 'Bật hiệu ứng âm thanh sống động (Unmute)',
      subtitle: 'Phản hồi âm thanh haptic khi tương tác',
      icon: soundEnabled ? VolumeX : Volume2,
      action: () => toggleSound(),
    },

    // --- Bảng màu Accent ---
    ...Object.values(THEME_ACCENTS).map((acc) => ({
      id: `theme-accent-${acc.id}`,
      group: 'Chủ đề màu sắc (Accent Themes)',
      label: `Chủ đề màu: ${acc.name}`,
      subtitle: `Đổi tông màu thương hiệu sang ${acc.name}`,
      icon: Palette,
      colorHex: acc.colorHex,
      action: () => setAccentTheme(acc.id),
    })),
  ];

  // Filter items
  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
    );
  });

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        soundFX.playTabClick();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        soundFX.playTabClick();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          soundFX.playPop();
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 select-none flex flex-col max-h-[75vh]"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
            <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 stroke-[2.2]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Gõ lệnh hoặc tìm kiếm (ví dụ: Reels, Theme, Tạo bài...)"
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      soundFX.playPop();
                      item.action();
                      onClose();
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          isSelected
                            ? 'bg-indigo-600 text-white scale-105 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                        style={item.colorHex ? { backgroundColor: item.colorHex, color: '#fff' } : {}}
                      >
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.id === `theme-accent-${accentTheme}` && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-200 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-bold">
                              Hiện tại
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
                          <span>Mở</span>
                          <CornerDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Không tìm thấy kết quả phù hợp</p>
                <p className="text-[11px] mt-1">Thử từ khóa khác như "Reels", "Chủ đề", "Bài viết"...</p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">
                  ↑↓
                </kbd>{' '}
                Di chuyển
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">
                  ↵
                </kbd>{' '}
                Chọn
              </span>
            </div>
            <span>SocialDB Command Hub</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
