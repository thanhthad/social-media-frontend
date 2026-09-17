import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MailCheck, ArrowRight, RotateCw } from 'lucide-react';
import Button from './ui/Button';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.some((digit) => !digit)) {
      toast.error('Vui lòng nhập đủ 6 chữ số mã xác thực');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Xác thực email thành công! Đang chuyển hướng...');
      navigate('/');
    }, 400);
  };

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
          Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email của bạn. Vui lòng nhập mã để kích hoạt tài khoản.
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5"
            isLoading={isLoading}
            rightIcon={ArrowRight}
          >
            Xác thực tài khoản
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Chưa nhận được mã?</span>
          <button
            type="button"
            onClick={() => toast.success('Đã gửi lại mã mới!')}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Gửi lại mã</span>
          </button>
        </div>
      </div>
    </div>
  );
}
