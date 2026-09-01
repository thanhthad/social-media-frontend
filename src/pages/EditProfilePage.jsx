import { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../services/userService';
import {
  ArrowLeft,
  Camera,
  User,
  Phone,
  Briefcase,
  Link as LinkIcon,
  AtSign,
  Lock,
  Eye,
  Globe,
  Users,
  Check,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const inputClass =
  'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition text-sm';

const Alert = ({ type, message }) => {
  if (!message) return null;
  const styles =
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-700'
      : 'bg-red-50 border-red-200 text-red-700';
  return (
    <div className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${styles}`}>
      {type === 'success' ? <Check size={15} /> : '⚠️'}
      {message}
    </div>
  );
};

const SaveButton = ({ loading, label = 'Lưu thay đổi' }) => (
  <button
    type="submit"
    disabled={loading}
    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading ? (
      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    ) : (
      <Save size={15} />
    )}
    {label}
  </button>
);

// Section card with collapsible
const SectionCard = ({ title, icon: Icon, iconColor = 'text-blue-600', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={18} className={iconColor} />}
          <span className="font-bold text-gray-800 text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
  </div>
);

// ─── Avatar & Cover Section ───────────────────────────────────────────────────
function AvatarCoverSection({ user, refreshUser }) {
  const avatarRef = useRef(null);
  const coverRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarLoading(true);
      setFeedback({ type: '', message: '' });
      await userService.updateAvatar(file);
      await refreshUser();
      setFeedback({ type: 'success', message: 'Cập nhật ảnh đại diện thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cập nhật ảnh đại diện thất bại.' });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCoverLoading(true);
      setFeedback({ type: '', message: '' });
      await userService.updateCover(file);
      await refreshUser();
      setFeedback({ type: 'success', message: 'Cập nhật ảnh bìa thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cập nhật ảnh bìa thất bại.' });
    } finally {
      setCoverLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cover photo */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
        {user?.coverUrl && (
          <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        <button
          type="button"
          onClick={() => coverRef.current?.click()}
          disabled={coverLoading}
          className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition backdrop-blur-sm"
        >
          <Camera size={14} />
          {coverLoading ? 'Đang tải...' : 'Đổi ảnh bìa'}
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* Avatar */}
      <div className="px-5 pb-4">
        <div className="flex items-end gap-4 -mt-10 mb-3">
          <div className="relative">
            <img
              src={user?.avatarUrl || 'https://via.placeholder.com/96'}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
            />
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              disabled={avatarLoading}
              className="absolute bottom-1 right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition"
              title="Đổi ảnh đại diện"
            >
              <Camera size={14} />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="pb-1">
            <p className="font-bold text-gray-900 text-lg">{user?.fullName || user?.username}</p>
            <p className="text-xs text-gray-400">@{user?.username}</p>
          </div>
        </div>
        <Alert type={feedback.type} message={feedback.message} />
      </div>
    </div>
  );
}

// ─── Basic Profile ────────────────────────────────────────────────────────────
function BasicProfileSection({ user, refreshUser }) {
  const [form, setForm] = useState({ fullName: '', bio: '', dateOfBirth: '', gender: 'MALE' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || 'MALE',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      await userService.updateBasicProfile(form);
      await refreshUser();
      setFeedback({ type: 'success', message: 'Cập nhật thông tin cơ bản thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cập nhật thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Thông tin cơ bản" icon={User} defaultOpen>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type={feedback.type} message={feedback.message} />
        <Field label="Họ và tên">
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
            placeholder="Nhập họ và tên đầy đủ"
          />
        </Field>
        <Field label="Giới thiệu bản thân" hint="Viết vài dòng mô tả về bạn — sẽ hiển thị trên trang cá nhân.">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className={`${inputClass} resize-none h-24`}
            placeholder="Ví dụ: Tôi là lập trình viên yêu thích cà phê và nhạc jazz..."
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ngày sinh">
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Giới tính">
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className={inputClass}
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function ContactSection({ user, refreshUser }) {
  const [form, setForm] = useState({ phone: '', website: '', country: '', city: '', district: '' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || '',
        website: user.website || '',
        country: user.country || '',
        city: user.city || '',
        district: user.district || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      await userService.updateContact(form);
      await refreshUser();
      setFeedback({ type: 'success', message: 'Cập nhật liên hệ thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cập nhật thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Liên hệ & Địa chỉ" icon={Phone} iconColor="text-green-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type={feedback.type} message={feedback.message} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Số điện thoại">
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="0912 345 678" />
          </Field>
          <Field label="Website">
            <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} placeholder="https://..." />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Quốc gia">
            <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} placeholder="Việt Nam" />
          </Field>
          <Field label="Thành phố">
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="Hà Nội" />
          </Field>
          <Field label="Quận/Huyện">
            <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={inputClass} placeholder="Cầu Giấy" />
          </Field>
        </div>
        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Career ───────────────────────────────────────────────────────────────────
function CareerSection({ user, refreshUser }) {
  const [form, setForm] = useState({ occupation: '', company: '', education: '' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setForm({
        occupation: user.occupation || '',
        company: user.company || '',
        education: user.education || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      await userService.updateCareer(form);
      await refreshUser();
      setFeedback({ type: 'success', message: 'Cập nhật nghề nghiệp thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cập nhật thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Nghề nghiệp & Học vấn" icon={Briefcase} iconColor="text-amber-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type={feedback.type} message={feedback.message} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nghề nghiệp">
            <input type="text" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className={inputClass} placeholder="Lập trình viên" />
          </Field>
          <Field label="Công ty / Nơi làm việc">
            <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} placeholder="Công ty ABC" />
          </Field>
        </div>
        <Field label="Học vấn">
          <input type="text" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className={inputClass} placeholder="Đại học Bách Khoa Hà Nội" />
        </Field>
        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Social Links ─────────────────────────────────────────────────────────────
function SocialLinksSection({ user, refreshUser }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user?.socialLinks && typeof user.socialLinks === 'object') {
      const parsed = Object.entries(user.socialLinks).map(([key, value]) => ({ key, value }));
      setEntries(parsed.length > 0 ? parsed : [{ key: '', value: '' }]);
    } else {
      setEntries([{ key: '', value: '' }]);
    }
  }, [user]);

  const updateEntry = (index, field, val) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: val } : e)));
  };

  const addEntry = () => setEntries((prev) => [...prev, { key: '', value: '' }]);
  const removeEntry = (index) => setEntries((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      const socialLinks = {};
      entries.forEach(({ key, value }) => {
        if (key.trim()) socialLinks[key.trim()] = value.trim();
      });
      await userService.updateSocialLinks({ socialLinks });
      await refreshUser();
      setFeedback({ type: 'success', message: 'Cập nhật liên kết mạng xã hội thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cập nhật thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Liên kết mạng xã hội" icon={LinkIcon} iconColor="text-purple-600">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Alert type={feedback.type} message={feedback.message} />
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={entry.key}
              onChange={(e) => updateEntry(i, 'key', e.target.value)}
              className={`${inputClass} w-32 flex-shrink-0`}
              placeholder="facebook"
            />
            <input
              type="text"
              value={entry.value}
              onChange={(e) => updateEntry(i, 'value', e.target.value)}
              className={`${inputClass} flex-1`}
              placeholder="https://facebook.com/..."
            />
            <button
              type="button"
              onClick={() => removeEntry(i)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex-shrink-0"
              title="Xóa"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addEntry}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-blue-50"
        >
          + Thêm liên kết
        </button>
        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Username ─────────────────────────────────────────────────────────────────
function UsernameSection({ user, refreshUser }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) setUsername(user.username || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      await userService.updateUsername({ username });
      await refreshUser();
      setFeedback({ type: 'success', message: 'Đổi tên người dùng thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Đổi tên thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Tên người dùng" icon={AtSign} iconColor="text-teal-600" defaultOpen={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type={feedback.type} message={feedback.message} />
        <Field label="Username" hint="Tên người dùng phải là duy nhất và không chứa khoảng trắng.">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`${inputClass} pl-7`}
              placeholder="username"
            />
          </div>
        </Field>
        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────
function ChangePasswordSection() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      setFeedback({ type: 'error', message: 'Mật khẩu mới không khớp!' });
      return;
    }
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      await userService.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      setForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      setFeedback({ type: 'success', message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Đổi mật khẩu thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Đổi mật khẩu" icon={Lock} iconColor="text-red-500" defaultOpen={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type={feedback.type} message={feedback.message} />
        <Field label="Mật khẩu hiện tại">
          <input
            type="password"
            value={form.oldPassword}
            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mật khẩu mới">
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Xác nhận mật khẩu mới">
            <input
              type="password"
              value={form.confirmNewPassword}
              onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>
        </div>
        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Visibility ───────────────────────────────────────────────────────────────
function VisibilitySection({ user, refreshUser }) {
  const [profileVisibility, setProfileVisibility] = useState('PUBLIC');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) setProfileVisibility(user.visibility || user.profileVisibility || 'PUBLIC');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      await userService.updateVisibility({ visibility: profileVisibility });
      await refreshUser();
      setFeedback({ type: 'success', message: 'Cập nhật quyền riêng tư thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cập nhật thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  const options = [
    {
      value: 'PUBLIC',
      icon: Globe,
      label: 'Công khai',
      desc: 'Tất cả mọi người đều có thể xem trang cá nhân của bạn',
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
    },
    {
      value: 'FRIEND',
      icon: Users,
      label: 'Chỉ bạn bè',
      desc: 'Chỉ bạn bè mới thấy đầy đủ thông tin trang cá nhân',
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      value: 'PRIVATE',
      icon: Lock,
      label: 'Riêng tư',
      desc: 'Chỉ bạn mới xem được trang cá nhân của mình',
      color: 'text-gray-600',
      bg: 'bg-gray-50 border-gray-200',
    },
  ];

  return (
    <SectionCard title="Quyền riêng tư" icon={Eye} iconColor="text-indigo-600" defaultOpen={false}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Alert type={feedback.type} message={feedback.message} />
        <p className="text-xs text-gray-500">Chọn mức độ hiển thị trang cá nhân của bạn với người khác.</p>
        <div className="space-y-2">
          {options.map(({ value, icon: Icon, label, desc, color, bg }) => (
            <label
              key={value}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                profileVisibility === value ? bg : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={value}
                checked={profileVisibility === value}
                onChange={() => setProfileVisibility(value)}
                className="mt-0.5 accent-blue-600"
              />
              <Icon size={16} className={`mt-0.5 flex-shrink-0 ${profileVisibility === value ? color : 'text-gray-400'}`} />
              <div>
                <p className={`text-sm font-bold ${profileVisibility === value ? color : 'text-gray-700'}`}>{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <SaveButton loading={loading} label="Lưu cài đặt" />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50/60 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">Chỉnh sửa trang cá nhân</h1>
            <p className="text-xs text-gray-400 mt-0.5">Cập nhật thông tin hiển thị trên trang cá nhân của bạn</p>
          </div>
        </div>

        {/* Sections */}
        <AvatarCoverSection user={user} refreshUser={refreshUser} />
        <BasicProfileSection user={user} refreshUser={refreshUser} />
        <ContactSection user={user} refreshUser={refreshUser} />
        <CareerSection user={user} refreshUser={refreshUser} />
        <SocialLinksSection user={user} refreshUser={refreshUser} />
        <UsernameSection user={user} refreshUser={refreshUser} />
        <ChangePasswordSection />
        <VisibilitySection user={user} refreshUser={refreshUser} />

        {/* Footer link */}
        <div className="text-center pb-8">
          <Link
            to="/profile"
            className="text-xs text-gray-400 hover:text-blue-600 hover:underline transition"
          >
            ← Quay về trang cá nhân
          </Link>
        </div>
      </div>
    </div>
  );
}
