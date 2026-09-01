import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User,
  Image as ImageIcon,
  Heart,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  ArrowLeft,
  Camera,
  Star,
  Trash2,
  Check,
  Briefcase,
  GraduationCap,
  Flame,
  ShieldCheck,
  Compass,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import datingService from '../services/datingService';

export default function DatingSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form
  const [profile, setProfile] = useState({
    displayName: '',
    gender: 'MALE',
    birthday: '',
    height: 172,
    occupation: '',
    education: '',
    country: 'Việt Nam',
    city: 'Hà Nội',
    district: '',
    bio: '',
    visibility: 'PUBLIC',
  });

  // Photos
  const [photos, setPhotos] = useState([]);

  // Interests
  const [allInterests, setAllInterests] = useState([]);
  const [myInterests, setMyInterests] = useState([]);

  // Preferences
  const [preferences, setPreferences] = useState({
    minAge: 18,
    maxAge: 35,
    maxDistance: 50,
    genderPreference: 'FEMALE',
  });

  // GPS Location Status
  const [gpsStatus, setGpsStatus] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, prefRes, allInterestsRes, myInterestsRes] = await Promise.all([
        datingService.getMe().catch(() => null),
        datingService.getMyPreference().catch(() => null),
        datingService.getAllInterests().catch(() => null),
        datingService.getMyInterests().catch(() => null),
      ]);

      if (profileRes?.data) {
        const pData = profileRes.data?.data || profileRes.data || {};
        setProfile({
          displayName: pData.displayName || pData.username || '',
          gender: pData.gender || 'MALE',
          birthday: pData.birthday ? String(pData.birthday).substring(0, 10) : '',
          height: pData.height || 170,
          occupation: pData.occupation || '',
          education: pData.education || '',
          country: pData.country || 'Việt Nam',
          city: pData.city || 'Hà Nội',
          district: pData.district || '',
          bio: pData.bio || '',
          visibility: pData.visibility || 'PUBLIC',
        });
        setPhotos(pData.photos || (pData.avatarUrl ? [{ id: 1, url: pData.avatarUrl, isPrimary: true }] : []));
      }

      if (prefRes?.data) {
        const p = prefRes.data?.data || prefRes.data || {};
        setPreferences({
          minAge: p.minAge || 18,
          maxAge: p.maxAge || 35,
          maxDistance: p.maxDistance || 50,
          genderPreference: p.genderPreference || 'FEMALE',
        });
      }

      if (allInterestsRes?.data) {
        const iRaw = allInterestsRes.data?.data || allInterestsRes.data || [];
        const iList = Array.isArray(iRaw) ? iRaw : [];
        setAllInterests(iList);
      }

      if (myInterestsRes?.data) {
        const mRaw = myInterestsRes.data?.data || myInterestsRes.data || [];
        const mList = Array.isArray(mRaw) ? mRaw : [];
        setMyInterests(mList.map((i) => (typeof i === 'object' && i !== null ? i.id : Number(i))));
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu hồ sơ hẹn hò');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Profile Info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        datingService.updateBasicInfo({
          displayName: profile.displayName.trim(),
          gender: profile.gender,
          birthday: profile.birthday ? profile.birthday : undefined,
          height: Number(profile.height) || undefined,
        }),
        datingService.updateCareer({
          occupation: profile.occupation.trim(),
          education: profile.education.trim(),
        }),
        datingService.updateLocation({
          country: profile.country.trim(),
          city: profile.city.trim(),
          district: profile.district.trim(),
        }),
        datingService.updateBio(profile.bio.trim()),
        datingService.updateVisibility(profile.visibility),
      ]);

      toast.success('Đã lưu thông tin hồ sơ hẹn hò thành công!');
    } catch (err) {
      console.error('Save profile error:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  // Save Preferences
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await datingService.updatePreference(preferences);
      toast.success('Đã cập nhật tiêu chí tìm kiếm!');
    } catch (err) {
      toast.error('Không thể lưu tiêu chí tìm kiếm');
    } finally {
      setSaving(false);
    }
  };

  // Save Interests
  const handleSaveInterests = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await datingService.updateMyInterests(myInterests);
      toast.success('Đã lưu danh sách sở thích!');
    } catch (err) {
      toast.error('Không thể lưu sở thích');
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (id) => {
    const numId = Number(id);
    if (myInterests.includes(numId)) {
      setMyInterests(myInterests.filter((i) => i !== numId));
    } else {
      if (myInterests.length >= 8) {
        toast.error('Bạn chỉ có thể chọn tối đa 8 sở thích');
        return;
      }
      setMyInterests([...myInterests, numId]);
    }
  };

  // Upload Photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 10MB');
      return;
    }

    const toastId = toast.loading('Đang tải ảnh lên...');
    try {
      await datingService.uploadPhoto(file, photos.length === 0);
      toast.success('Tải ảnh thành công!', { id: toastId });
      fetchData();
    } catch (err) {
      toast.error('Không thể tải ảnh lên', { id: toastId });
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
      try {
        await datingService.deletePhoto(photoId);
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        toast.success('Đã xóa ảnh');
      } catch (err) {
        toast.error('Không thể xóa ảnh');
      }
    }
  };

  const handleSetPrimaryPhoto = async (photoId) => {
    try {
      await datingService.setPrimaryPhoto(photoId);
      toast.success('Đã đặt làm ảnh đại diện chính');
      fetchData();
    } catch (err) {
      toast.error('Không thể đổi ảnh đại diện chính');
    }
  };

  // GPS Auto Detect / Set Location
  const handleDetectGPS = (customLat = null, customLng = null, locationName = null) => {
    setGpsLoading(true);

    if (customLat !== null && customLng !== null) {
      datingService
        .updateCoordinates(customLat, customLng)
        .then(() => {
          setGpsStatus(`Đã đặt vị trí ${locationName || ''} (${customLat}, ${customLng}) thành công!`);
          toast.success(`Đã cập nhật vị trí ${locationName || ''}!`);
        })
        .catch((e) => {
          setGpsStatus('Lỗi khi lưu tọa độ lên máy chủ.');
          toast.error('Không thể cập nhật vị trí');
        })
        .finally(() => setGpsLoading(false));
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị GPS');
      setGpsLoading(false);
      return;
    }

    setGpsStatus('Đang lấy tọa độ GPS từ thiết bị...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await datingService.updateCoordinates(latitude, longitude);
          setGpsStatus(`Đã cập nhật tọa độ (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) thành công!`);
          toast.success('Đã cập nhật vị trí GPS chính xác!');
        } catch (e) {
          setGpsStatus('Lỗi khi lưu tọa độ lên máy chủ.');
          toast.error('Không thể cập nhật GPS');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsStatus(`Không thể lấy vị trí từ thiết bị: ${err.message}. Bạn có thể chọn nhanh một thành phố bên dưới.`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center gap-3">
        <div className="w-9 h-9 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-semibold">Đang tải cài đặt hồ sơ...</p>
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: 'Hồ sơ bản thân', icon: User },
    { key: 'photos', label: 'Bộ sưu tập ảnh', icon: ImageIcon },
    { key: 'interests', label: 'Sở thích & Gu', icon: Sparkles },
    { key: 'preferences', label: 'Tiêu chí tìm kiếm', icon: SlidersHorizontal },
    { key: 'location', label: 'Vị trí & GPS', icon: MapPin },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dating"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 mb-2 transition group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang quẹt thẻ</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black gradient-dating-text flex items-center gap-2">
            <Flame className="w-7 h-7 text-pink-500 fill-pink-500" />
            Cài Đặt Hồ Sơ Hẹn Hò
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Chăm chút cho hồ sơ của bạn nổi bật và thu hút nhiều đối tượng tương hợp nhất.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto dating-scrollbar gap-1.5">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === key
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Profile Info */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-black text-gray-900">Thông tin cơ bản</h3>
            <p className="text-xs text-gray-400">Hiển thị cho đối phương khi xem hồ sơ của bạn</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Tên hiển thị *
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Ví dụ: Alex, Tuấn Anh..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Giới tính *
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition cursor-pointer font-medium"
              >
                <option value="MALE">Nam (Male)</option>
                <option value="FEMALE">Nữ (Female)</option>
                <option value="OTHER">Khác (Other)</option>
              </select>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Ngày sinh (tự tính tuổi & cung hoàng đạo)
              </label>
              <input
                type="date"
                value={profile.birthday}
                onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition font-medium"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Chiều cao (cm)
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                placeholder="Ví dụ: 175"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Nghề nghiệp
              </label>
              <input
                type="text"
                value={profile.occupation}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                placeholder="Ví dụ: Kỹ sư phần mềm, Thiết kế..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Trường học / Học vấn
              </label>
              <input
                type="text"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                placeholder="Ví dụ: Đại học Bách Khoa, FTU..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Tỉnh / Thành phố
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Quận / Huyện
              </label>
              <input
                type="text"
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                placeholder="Ví dụ: Hoàn Kiếm, Cầu Giấy..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Giới thiệu về bản thân (Bio)
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Chia sẻ một chút về tính cách, sở thích, câu nói yêu thích của bạn..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition resize-none"
                maxLength={500}
              />
            </div>

            {/* Visibility Mode */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-pink-50/60 border border-pink-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Hiển thị trên danh sách tìm kiếm</h4>
                <p className="text-xs text-gray-500">
                  Khi bật, hồ sơ của bạn sẽ xuất hiện để người khác quẹt thẻ.
                </p>
              </div>
              <select
                value={profile.visibility}
                onChange={(e) => setProfile({ ...profile, visibility: e.target.value })}
                className="px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs font-bold text-pink-700 outline-none cursor-pointer"
              >
                <option value="PUBLIC">Đang bật (Công khai)</option>
                <option value="PRIVATE">Tạm ẩn (Riêng tư)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-xl transition transform active:scale-95 text-sm disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Photo Studio */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Bộ sưu tập ảnh hẹn hò</h3>
            <p className="text-xs text-gray-400">
              Tải lên tối đa 6 ảnh. Ảnh có huy hiệu "Chính" sẽ là ảnh đại diện thẻ quẹt đầu tiên của bạn.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.id || idx}
                className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-900 group shadow-sm border border-gray-200"
              >
                <img src={photo.url} alt="Profile" className="w-full h-full object-cover" />

                {photo.isPrimary ? (
                  <span className="absolute top-2 left-2 px-2.5 py-1 bg-pink-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Star size={10} className="fill-current" />
                    Chính
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryPhoto(photo.id)}
                    className="absolute top-2 left-2 px-2 py-1 bg-black/60 hover:bg-pink-600 text-white rounded-xl text-[10px] font-bold backdrop-blur-md opacity-0 group-hover:opacity-100 transition"
                  >
                    Đặt làm chính
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition"
                  title="Xóa ảnh"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {photos.length < 6 && (
              <label className="rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-500 bg-pink-50/40 hover:bg-pink-50/70 aspect-[3/4] flex flex-col items-center justify-center gap-2 cursor-pointer transition p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shadow-inner">
                  <Camera size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Thêm ảnh mới</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP (tối đa 10MB)</p>
                </div>
              </label>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Interests */}
      {activeTab === 'interests' && (
        <form onSubmit={handleSaveInterests} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-gray-900">Sở thích & Đam mê</h3>
              <p className="text-xs text-gray-400">
                Chọn tối đa 8 sở thích để hệ thống tìm kiếm những người có gu tương tự bạn ({myInterests.length}/8).
              </p>
            </div>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-black">
              {myInterests.length}/8 Đã chọn
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {allInterests.map((interest) => {
              const isSelected = myInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-500 shadow-md shadow-pink-500/20'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-white'
                  }`}
                >
                  <span>{interest.name}</span>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-xl transition transform active:scale-95 text-sm disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu Sở Thích'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-7">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-black text-gray-900">Tiêu chí đối tượng</h3>
            <p className="text-xs text-gray-400">Thiết lập bộ lọc tìm kiếm bạn bè và đối tượng hẹn hò</p>
          </div>

          {/* Gender Preference */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Tôi muốn tìm kiếm
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'FEMALE', label: 'Nữ (Female)', icon: '👩' },
                { key: 'MALE', label: 'Nam (Male)', icon: '👨' },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPreferences({ ...preferences, genderPreference: key })}
                  className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all ${
                    preferences.genderPreference === key
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm ring-2 ring-pink-500/20'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-xl">{icon}</span>
                    <span>{label}</span>
                  </span>
                  {preferences.genderPreference === key && (
                    <Check size={18} className="text-pink-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Max Distance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Khoảng cách tối đa
              </label>
              <span className="text-sm font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                {preferences.maxDistance} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="500"
              value={preferences.maxDistance}
              onChange={(e) => setPreferences({ ...preferences, maxDistance: Number(e.target.value) })}
              className="dating-slider"
            />
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>1 km</span>
              <span>500 km</span>
            </div>
          </div>

          {/* Age Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Độ tuổi mong muốn
              </label>
              <span className="text-sm font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                {preferences.minAge} - {preferences.maxAge} tuổi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 mb-1 block">Tuổi tối thiểu</span>
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={preferences.minAge}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPreferences({
                      ...preferences,
                      minAge: Math.min(val, preferences.maxAge - 1),
                    });
                  }}
                  className="dating-slider"
                />
              </div>

              <div>
                <span className="text-xs text-gray-500 mb-1 block">Tuổi tối đa</span>
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={preferences.maxAge}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPreferences({
                      ...preferences,
                      maxAge: Math.max(val, preferences.minAge + 1),
                    });
                  }}
                  className="dating-slider"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-xl transition transform active:scale-95 text-sm disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu Tiêu Chí'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: Location & GPS */}
      {activeTab === 'location' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Vị trí & Định vị GPS</h3>
            <p className="text-xs text-gray-400">
              Cập nhật tọa độ chính xác để tìm thấy những người ở gần bạn nhất.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white text-pink-600 flex items-center justify-center shadow-md">
                <Compass size={28} className={gpsLoading ? 'animate-spin' : ''} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Tự động lấy vị trí hiện tại</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sử dụng cảm biến định vị GPS trên thiết bị của bạn
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDetectGPS()}
              disabled={gpsLoading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition transform active:scale-95 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {gpsLoading && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{gpsLoading ? 'Đang định vị...' : 'Cập nhật GPS thiết bị'}</span>
            </button>
          </div>

          {/* Preset Locations */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Hoặc chọn nhanh vị trí thành phố:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
                { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297 },
                { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
                { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
              ].map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => handleDetectGPS(loc.lat, loc.lng, loc.name)}
                  className="p-3 bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 rounded-2xl text-xs font-bold text-gray-700 hover:text-pink-700 transition text-center flex items-center justify-center gap-1.5"
                >
                  <MapPin size={13} className="text-pink-500" />
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {gpsStatus && (
            <p className="text-xs font-semibold text-pink-700 bg-pink-50 p-3.5 rounded-2xl border border-pink-100">
              {gpsStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

