import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MailCheck, ArrowRight, RotateCw, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [email, setEmail] = useState(emailFromUrl);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const { verifyEmail, resendVerification, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (tokenFromUrl && !verifiedSuccess) {
      const autoVerify = async () => {
        setIsVerifying(true);
        const result = await verifyEmail(tokenFromUrl);
        setIsVerifying(false);
        if (result.success) {
          setVerifiedSuccess(true);
        }
      };
      autoVerify();
    }
  }, [tokenFromUrl]);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Vui lòng nhập mã token xác thực');
      return;
    }

    setIsVerifying(true);
    const result = await verifyEmail(token.trim());
    setIsVerifying(false);

    if (result.success) {
      setVerifiedSuccess(true);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error('Vui lòng nhập địa chỉ email để nhận lại mã xác thực');
      return;
    }

    setIsResending(true);
    await resendVerification(email.trim());
    setIsResending(false);
  };

  if (verifiedSuccess) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Xác thực email thành công!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Tài khoản của bạn đã được kích hoạt hoàn tất. Bây giờ bạn có thể đăng nhập và trải nghiệm toàn bộ tính năng của SocialDB.
          </p>
          <Link
            to="/login"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4">
          <MailCheck className="w-6 h-6 stroke-[2]" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Xác thực địa chỉ Email
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Nhập mã token xác thực bạn nhận được qua email hoặc dán mã vào ô bên dưới.
        </p>

        <form onSubmit={handleManualVerify} className="space-y-4 text-left">
          <Input
            label="Mã Token xác thực"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            leftIcon={KeyRound}
            placeholder="Dán mã token xác minh tại đây"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 font-semibold"
            isLoading={isVerifying}
            rightIcon={ArrowRight}
          >
            Xác thực tài khoản
          </Button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-left">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Chưa nhận được email xác thực?
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="flex-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Gửi lại</span>
            </button>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
          >
            ← Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
