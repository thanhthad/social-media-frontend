import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [username, setUsername]           = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [error, setError]                 = useState('');

  const { register } = useAuth();
  const navigate     = useNavigate();

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = password && confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const result = await register(username.trim(), email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Tài khoản đã được tạo! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      setError(result.message || 'Không thể tạo tài khoản. Vui lòng thử lại.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Brand */}
          <div className="auth-header">
            <div className="auth-brand justify-center mb-6">
              <div className="auth-brand-icon">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="auth-brand-name">VibeSocial</span>
            </div>
            <h1 className="auth-title">Tạo tài khoản mới</h1>
            <p className="auth-subtitle">Tham gia cộng đồng và kết nối ngay hôm nay</p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-3.5 py-3"
            >
              <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="input-group">
              <label className="input-label" htmlFor="username">Tên người dùng</label>
              <input
                id="username"
                type="text"
                className="input-field"
                placeholder="ten_nguoi_dung"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="ban@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label" htmlFor="password">Mật khẩu</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Ít nhất 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label className="input-label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className={`input-field pr-11 ${
                    passwordMismatch
                      ? 'border-red-400 focus:border-red-500'
                      : passwordsMatch
                      ? 'border-emerald-400 focus:border-emerald-500'
                      : ''
                  }`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="error-message">
                  <AlertCircle size={13} /> Mật khẩu không khớp
                </p>
              )}
              {passwordsMatch && (
                <p className="flex items-center gap-1 text-emerald-600 text-xs font-medium mt-0.5">
                  <CheckCircle size={13} /> Mật khẩu khớp
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full mt-1"
              disabled={isSubmitting || !username.trim() || !email.trim() || !password || !!passwordMismatch}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Đang tạo tài khoản…
                </span>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Đăng nhập
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
