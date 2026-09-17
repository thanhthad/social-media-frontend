import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Database, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('alex.vance@socialdb.dev');
  const [password, setPassword] = useState('password123');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-sm mb-3">
            <Database className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Chào mừng đến với Social<span className="text-indigo-600">DB</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mạng xã hội tối giản, hiện đại và cấu trúc tinh tế
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Địa chỉ Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={Mail}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4 stroke-[1.8]" />
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-10 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-2"
            isLoading={isLoading}
            rightIcon={ArrowRight}
          >
            Đăng nhập
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Đăng ký tài khoản mới
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
