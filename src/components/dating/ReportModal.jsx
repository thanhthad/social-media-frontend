import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import datingService from '../../services/datingService';
import toast from 'react-hot-toast';

const ReportModal = ({ isOpen, onClose, targetUserId, targetUserName }) => {
  const [reasonId, setReasonId] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const REPORT_REASONS = [
    { id: 1, label: 'Hình ảnh không phù hợp / Nhạy cảm' },
    { id: 2, label: 'Quấy rối hoặc đe dọa' },
    { id: 3, label: 'Tài khoản giả mạo / Spam' },
    { id: 4, label: 'Chưa đủ tuổi (Dưới 18 tuổi)' },
    { id: 5, label: 'Lý do khác' },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reasonId) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }

    setIsSubmitting(true);
    try {
      await datingService.reportUser(targetUserId, parseInt(reasonId, 10), description);
      toast.success('Đã gửi báo cáo thành công. Đội ngũ kiểm duyệt sẽ xử lý trong thời gian sớm nhất.');
      onClose();
      setReasonId('');
      setDescription('');
    } catch (error) {
      toast.error('Không thể gửi báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-rose-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Flag size={18} />
              </div>
              <h2 className="text-base font-black text-gray-900">Báo cáo {targetUserName || 'người dùng'}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition shadow-sm"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-amber-600" />
              <p>Chúng tôi cam kết bảo vệ an toàn cho bạn. Báo cáo này hoàn toàn ẩn danh và người bị báo cáo sẽ không nhận được thông báo.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Lý do báo cáo *
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition cursor-pointer"
                value={reasonId}
                onChange={(e) => setReasonId(e.target.value)}
                required
              >
                <option value="" disabled>Chọn một lý do...</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Chi tiết bổ sung (tùy chọn)
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition resize-none"
                rows={3}
                placeholder="Mô tả cụ thể hơn về hành vi vi phạm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 font-bold text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-500/30 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportModal;

