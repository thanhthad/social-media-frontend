import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, MapPin, Users, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import datingService from '../../services/datingService';

export default function DatingFilterDrawer({
  isOpen,
  onClose,
  initialPreferences,
  onPreferencesUpdated,
}) {
  const [preferences, setPreferences] = useState({
    minAge: initialPreferences?.minAge || 18,
    maxAge: initialPreferences?.maxAge || 35,
    maxDistance: initialPreferences?.maxDistance || 50,
    genderPreference: initialPreferences?.genderPreference || 'FEMALE',
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await datingService.updatePreference(preferences);
      toast.success('Đã lưu bộ lọc tìm kiếm!');
      if (onPreferencesUpdated) onPreferencesUpdated(preferences);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Không thể lưu bộ lọc');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-gray-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Bộ lọc tìm kiếm</h3>
                <p className="text-xs text-gray-400">Tùy chỉnh đối tượng bạn muốn gặp gỡ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-7 dating-scrollbar">
            {/* Gender Preference */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Users size={14} className="text-pink-500" />
                Đối tượng tìm kiếm
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'FEMALE', label: 'Nữ', icon: '👩' },
                  { key: 'MALE', label: 'Nam', icon: '👨' },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, genderPreference: key })}
                    className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all ${
                      preferences.genderPreference === key
                        ? 'border-pink-500 bg-pink-50/80 text-pink-700 shadow-sm ring-2 ring-pink-500/20'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span>{label}</span>
                    </span>
                    {preferences.genderPreference === key && (
                      <Check size={16} className="text-pink-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <MapPin size={14} className="text-pink-500" />
                  Khoảng cách tối đa
                </label>
                <span className="text-sm font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                  {preferences.maxDistance} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={preferences.maxDistance}
                onChange={(e) =>
                  setPreferences({ ...preferences, maxDistance: Number(e.target.value) })
                }
                className="dating-slider"
              />
              <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
                <span>Gần tôi (1 km)</span>
                <span>Toàn quốc (500 km)</span>
              </div>
            </div>

            {/* Age Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-pink-500" />
                  Độ tuổi mong muốn
                </label>
                <span className="text-sm font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                  {preferences.minAge} - {preferences.maxAge} tuổi
                </span>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Tuổi tối thiểu:</span>
                    <strong>{preferences.minAge} tuổi</strong>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={preferences.minAge}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPreferences({
                        ...preferences,
                        minAge: Math.min(val, preferences.maxAge - 1),
                      });
                    }}
                    className="dating-slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Tuổi tối đa:</span>
                    <strong>{preferences.maxAge} tuổi</strong>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={preferences.maxAge}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPreferences({
                        ...preferences,
                        maxAge: Math.max(val, preferences.minAge + 1),
                      });
                    }}
                    className="dating-slider"
                  />
                </div>
              </div>
            </div>

            {/* Footer Apply Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/30 transition transform active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{saving ? 'Đang lưu...' : 'Áp dụng bộ lọc'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
