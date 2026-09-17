import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendReset = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Đã gửi liên kết khôi phục mật khẩu đến email!');
      navigate('/reset-password');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4">
          <KeyRound className="w-6 h-6 stroke-[2]" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Quên mật khẩu?
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Đừng lo lắng! Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
        </p>

        <form onSubmit={handleSendReset} className="space-y-4 text-left">
          <Input
            label="Địa chỉ Email của bạn"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={Mail}
            placeholder="email@example.com"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-2"
            isLoading={isLoading}
            rightIcon={ArrowRight}
          >
            Gửi liên kết đặt lại
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
