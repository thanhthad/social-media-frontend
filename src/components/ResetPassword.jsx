import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Mật khẩu phải có tối thiểu 8 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Đặt lại mật khẩu thành công! Hãy đăng nhập với mật khẩu mới.');
      navigate('/login');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4">
          <ShieldCheck className="w-6 h-6 stroke-[2]" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Đặt lại mật khẩu mới
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Vui lòng nhập mật khẩu mới để bảo vệ tài khoản của bạn.
        </p>

        <form onSubmit={handleReset} className="space-y-4 text-left">
          <Input
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={Lock}
            placeholder="Tối thiểu 8 ký tự"
            required
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={Lock}
            placeholder="Nhập lại mật khẩu mới"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-2"
            isLoading={isLoading}
            rightIcon={ArrowRight}
          >
            Lưu mật khẩu mới
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            Hủy và quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
