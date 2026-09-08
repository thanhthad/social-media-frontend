import { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';

/**
 * EditFieldModal — Popup nhỏ chỉnh sửa 1 field (Facebook-style inline edit).
 *
 * Props:
 * - open (bool): hiển thị hay không
 * - onClose (fn): đóng modal
 * - fieldLabel (string): nhãn hiển thị, ví dụ "Bio"
 * - fieldType (string): loại input — 'text' | 'textarea' | 'date' | 'select' | 'number'
 * - fieldOptions (array): [{ value, label }] — dùng khi fieldType === 'select'
 * - initialValue (string): giá trị hiện tại của field
 * - maxLength (number): giới hạn ký tự (tùy chọn)
 * - placeholder (string): placeholder cho input
 * - onSave (async fn(value)): callback khi user bấm Lưu — nhận value dạng string
 */
export default function EditFieldModal({
  open,
  onClose,
  fieldLabel,
  fieldType = 'text',
  fieldOptions = [],
  initialValue = '',
  maxLength,
  placeholder = '',
  onSave,
}) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Reset khi modal mở
  useEffect(() => {
    if (open) {
      setValue(initialValue ?? '');
      setError('');
      setLoading(false);
      // Focus input sau khi mount
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialValue]);

  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(value === '' ? null : value);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition text-sm';

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">Chỉnh sửa — {fieldLabel}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 space-y-4">
          {/* Input theo fieldType */}
          {fieldType === 'textarea' ? (
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={maxLength}
              placeholder={placeholder}
              rows={4}
              className={`${inputClass} resize-none`}
            />
          ) : fieldType === 'select' ? (
            <select
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass}
            >
              <option value="">-- Chọn --</option>
              {fieldOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={inputRef}
              type={fieldType}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={maxLength}
              placeholder={placeholder}
              className={inputClass}
            />
          )}

          {/* Counter ký tự */}
          {maxLength && fieldType !== 'select' && (
            <p className="text-[11px] text-gray-400 text-right -mt-2">
              {value.length}/{maxLength}
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <Save size={13} />
              )}
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
