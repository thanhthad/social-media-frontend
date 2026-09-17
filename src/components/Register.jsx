import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Database, User, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Đăng ký thành công! Vui lòng xác thực email.');
      navigate('/verify-email');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-sm mb-3">
            <Database className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tạo tài khoản Social<span className="text-indigo-600">DB</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gia nhập cộng đồng chia sẻ tri thức và sáng tạo
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          <Input
            label="Họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={User}
            placeholder="Ví dụ: Nguyễn Văn A"
            required
          />

          <Input
            label="Tên người dùng (Username)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nguyenvana"
            required
          />

          <Input
            label="Địa chỉ Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={Mail}
            placeholder="email@example.com"
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={Lock}
            placeholder="Tối thiểu 8 ký tự"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-2"
            isLoading={isLoading}
            rightIcon={ArrowRight}
          >
            Tiếp tục đăng ký
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
