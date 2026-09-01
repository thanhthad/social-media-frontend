import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  ChevronRight,
  ChevronLeft,
  Camera,
  User,
  Sparkles,
  SlidersHorizontal,
  Check,
  MapPin,
  Compass,
  Heart,
  Star,
  Upload,
  X,
  Plus,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';
import datingService from '../services/datingService';

const STEPS = [
  { id: 1, label: 'Thông tin cơ bản', icon: User, color: 'from-pink-500 to-rose-600' },
  { id: 2, label: 'Ảnh hồ sơ', icon: Camera, color: 'from-purple-500 to-pink-500' },
  { id: 3, label: 'Sở thích & Gu', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
  { id: 4, label: 'Tiêu chí & Vị trí', icon: SlidersHorizontal, color: 'from-sky-500 to-blue-600' },
];

const inputClass =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition';

export default function DatingSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    displayName: '',
    gender: 'MALE',
    birthday: '2000-01-01',
    height: 170,
    occupation: '',
    education: '',
    city: 'Hà Nội',
    district: '',
    bio: '',
  });

  // Step 2: Photos
  const [photos, setPhotos] = useState([]); // { file, previewUrl }
  const photoInputRef = useRef(null);

  // Step 3: Interests
  const [allInterests, setAllInterests] = useState([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState([]);

  // Step 4: Preferences & Location
  const [preferences, setPreferences] = useState({
    minAge: 18,
    maxAge: 35,
    maxDistance: 50,
    genderPreference: 'FEMALE',
  });
  const [coordinates, setCoordinates] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    locationName: 'Hà Nội',
  });
  const [gpsDetecting, setGpsDetecting] = useState(false);

  useEffect(() => {
    // Load interests for step 3
    datingService
      .getAllInterests()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setAllInterests(Array.isArray(list) ? list : []);
      })
      .catch(() => {});

    // Try detecting GPS silently in background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            locationName: 'Vị trí GPS hiện tại',
          });
        },
        () => {},
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, []);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  // STEP 1: Save basic info
  const handleSaveStep1 = async () => {
    if (!basicInfo.displayName.trim()) {
      toast.error('Vui lòng nhập tên hiển thị');
      return;
    }
    if (!basicInfo.birthday) {
      toast.error('Vui lòng chọn ngày sinh');
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        datingService.updateBasicInfo({
          displayName: basicInfo.displayName.trim(),
          gender: basicInfo.gender,
          birthday: basicInfo.birthday,
          height: Number(basicInfo.height) || 170,
        }),
        datingService.updateCareer({
          occupation: basicInfo.occupation.trim(),
          education: basicInfo.education.trim(),
        }),
        datingService.updateLocation({
          city: basicInfo.city.trim(),
          district: basicInfo.district.trim(),
        }),
        datingService.updateBio(basicInfo.bio.trim()),
      ]);
      toast.success('Đã lưu thông tin cơ bản!');
      goNext();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể lưu thông tin');
    } finally {
      setSaving(false);
    }
  };

  // STEP 2: Photo management
  const handleAddPhoto = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 6) {
      toast.error('Tối đa 6 ảnh');
      return;
    }
    const newPhotos = files
      .filter((f) => f.size <= 10 * 1024 * 1024)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadPhotos = async () => {
    if (photos.length === 0) {
      toast('Bạn có thể tải ảnh lên sau trong phần Cài đặt!', { icon: '📸' });
      goNext();
      return;
    }
    setSaving(true);
    const toastId = toast.loading(`Đang tải ${photos.length} ảnh lên...`);
    try {
      for (let i = 0; i < photos.length; i++) {
        const isPrimary = i === 0;
        await datingService.uploadPhoto(photos[i].file, isPrimary);
      }
      toast.success(`Đã tải lên ${photos.length} ảnh thành công!`, { id: toastId });
      goNext();
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // STEP 3: Save interests
  const handleSaveInterests = async () => {
    setSaving(true);
    try {
      if (selectedInterestIds.length > 0) {
        await datingService.updateMyInterests(selectedInterestIds);
      }
      toast.success('Đã lưu sở thích!');
      goNext();
    } catch (err) {
      toast.error('Không thể lưu sở thích');
      goNext();
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (id) => {
    const numId = Number(id);
    if (selectedInterestIds.includes(numId)) {
      setSelectedInterestIds((prev) => prev.filter((i) => i !== numId));
    } else {
      if (selectedInterestIds.length >= 8) {
        toast.error('Tối đa 8 sở thích');
        return;
      }
      setSelectedInterestIds((prev) => [...prev, numId]);
    }
  };

  // GPS Detect for Step 4
  const handleDetectGPS = (customLat = null, customLng = null, locName = null) => {
    if (customLat !== null && customLng !== null) {
      setCoordinates({
        latitude: customLat,
        longitude: customLng,
        locationName: locName || 'Thành phố đã chọn',
      });
      toast.success(`Đã chọn vị trí: ${locName}!`);
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ GPS');
      return;
    }

    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          locationName: 'Vị trí thiết bị chính xác',
        });
        toast.success('Đã nhận diện tọa độ GPS!');
        setGpsDetecting(false);
      },
      (err) => {
        toast.error('Không thể lấy vị trí từ thiết bị');
        setGpsDetecting(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  // STEP 4: Save preferences, coordinates & finish
  const handleFinish = async () => {
    setSaving(true);
    try {
      // 1. Save Coordinates first to guarantee discovery works immediately
      await datingService.updateCoordinates(coordinates.latitude, coordinates.longitude);

      // 2. Save Preferences (create or update)
      try {
        await datingService.createPreference(preferences);
      } catch (e) {
        await datingService.updatePreference(preferences);
      }

      toast.success('🎉 Hoàn thành thiết lập hồ sơ hẹn hò!');
      navigate('/dating');
    } catch (err) {
      console.error('Finish setup error:', err);
      toast.error('Có lỗi xảy ra, đang chuyển tới trang Hẹn Hò...');
      navigate('/dating');
    } finally {
      setSaving(false);
    }
  };

  const currentStepData = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Flame size={26} className="fill-current animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black text-gray-900">Thiết lập hồ sơ</h1>
              <p className="text-xs text-pink-600 font-semibold">Hẹn Hò & Kết Đôi</p>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-between max-w-sm mx-auto mt-4">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 flex-shrink-0 ${
                    step > s.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
                      : step === s.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/40 ring-4 ring-pink-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s.id ? <Check size={14} strokeWidth={3} /> : s.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1.5 rounded-full transition-all duration-500 ${
                      step > s.id ? 'bg-gradient-to-r from-pink-500 to-rose-400' : 'bg-gray-100'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3 font-medium">
            Bước {step}/{STEPS.length}: <span className="text-gray-700 font-bold">{currentStepData.label}</span>
          </p>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* ─── STEP 1: Basic Info ─── */}
            {step === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${currentStepData.color} text-white flex items-center justify-center`}>
                    <User size={18} />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-base">Thông tin cơ bản</h2>
                    <p className="text-xs text-gray-400">Hiển thị cho đối phương khi xem hồ sơ</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Tên hiển thị *
                    </label>
                    <input
                      type="text"
                      value={basicInfo.displayName}
                      onChange={(e) => setBasicInfo({ ...basicInfo, displayName: e.target.value })}
                      placeholder="Ví dụ: Alex, Tuấn Anh..."
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Giới tính *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'MALE', label: 'Nam', emoji: '👨' },
                        { value: 'FEMALE', label: 'Nữ', emoji: '👩' },
                        { value: 'OTHER', label: 'Khác', emoji: '✨' },
                      ].map(({ value, label, emoji }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setBasicInfo({ ...basicInfo, gender: value })}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold transition text-center ${
                            basicInfo.gender === value
                              ? 'border-pink-500 bg-pink-50 text-pink-700'
                              : 'border-gray-200 text-gray-600 hover:border-pink-200'
                          }`}
                        >
                          <div className="text-base mb-0.5">{emoji}</div>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Ngày sinh *
                    </label>
                    <input
                      type="date"
                      value={basicInfo.birthday}
                      onChange={(e) => setBasicInfo({ ...basicInfo, birthday: e.target.value })}
                      className={inputClass}
                      max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Chiều cao (cm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={100}
                        max={250}
                        value={basicInfo.height}
                        onChange={(e) => setBasicInfo({ ...basicInfo, height: e.target.value })}
                        className={inputClass}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">cm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      value={basicInfo.city}
                      onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                      placeholder="Hà Nội, TP.HCM..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Nghề nghiệp
                    </label>
                    <input
                      type="text"
                      value={basicInfo.occupation}
                      onChange={(e) => setBasicInfo({ ...basicInfo, occupation: e.target.value })}
                      placeholder="Kỹ sư, Designer..."
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Giới thiệu bản thân (Bio)
                    </label>
                    <textarea
                      rows={3}
                      value={basicInfo.bio}
                      onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                      placeholder="Viết vài dòng mô tả vui vẻ về bản thân bạn..."
                      className={`${inputClass} resize-none`}
                      maxLength={300}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">{basicInfo.bio.length}/300</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveStep1}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold shadow-md shadow-pink-500/30 hover:shadow-lg transition transform active:scale-95 text-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving ? 'Đang lưu...' : 'Tiếp tục'}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 2: Photos ─── */}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${currentStepData.color} text-white flex items-center justify-center`}>
                    <Camera size={18} />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-base">Ảnh hồ sơ</h2>
                    <p className="text-xs text-gray-400">Tối đa 6 ảnh. Ảnh đầu tiên là ảnh đại diện thẻ quẹt.</p>
                  </div>
                </div>

                {/* Tip */}
                <div className="bg-pink-50 rounded-2xl p-3.5 border border-pink-100 text-xs text-pink-700 flex items-start gap-2.5">
                  <Heart size={15} className="mt-0.5 flex-shrink-0 fill-pink-500 text-pink-500" />
                  <p>Hồ sơ có ảnh <strong>chân thực, rõ mặt, nụ cười rạng rỡ</strong> sẽ nhận được nhiều lượt thích hơn gấp 3 lần!</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 group shadow-sm border border-gray-200">
                      <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-pink-500 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow-md">
                          <Star size={9} className="fill-current" /> Chính
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {photos.length < 6 && (
                    <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-500 bg-pink-50/40 hover:bg-pink-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition p-3 text-center">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAddPhoto}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shadow-inner">
                        <Plus size={18} />
                      </div>
                      <p className="text-[11px] font-bold text-gray-700">Thêm ảnh</p>
                      <p className="text-[10px] text-gray-400">{photos.length}/6</p>
                    </label>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-2xl font-semibold text-sm transition flex items-center gap-1.5"
                  >
                    <ChevronLeft size={18} /> Quay lại
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadPhotos}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold shadow-md shadow-pink-500/30 hover:shadow-lg transition transform active:scale-95 text-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving ? 'Đang tải...' : photos.length === 0 ? 'Bỏ qua & Tiếp tục' : 'Tải ảnh & Tiếp tục'}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Interests ─── */}
            {step === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${currentStepData.color} text-white flex items-center justify-center`}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 text-base">Sở thích & Gu kết đôi</h2>
                      <p className="text-xs text-gray-400">Chọn tối đa 8 sở thích</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-black rounded-full">
                    {selectedInterestIds.length}/8
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 max-h-72 overflow-y-auto dating-scrollbar">
                  {allInterests.length > 0 ? (
                    allInterests.map((interest) => {
                      const isSelected = selectedInterestIds.includes(interest.id);
                      return (
                        <button
                          key={interest.id}
                          type="button"
                          onClick={() => toggleInterest(interest.id)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-500 shadow-md shadow-pink-500/20'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-white'
                          }`}
                        >
                          {interest.name}
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 py-4 text-center w-full">Đang tải danh sách sở thích...</p>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-2xl font-semibold text-sm transition flex items-center gap-1.5"
                  >
                    <ChevronLeft size={18} /> Quay lại
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveInterests}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-bold shadow-md shadow-pink-500/30 hover:shadow-lg transition transform active:scale-95 text-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving ? 'Đang lưu...' : 'Tiếp tục'}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 4: Preferences & Location ─── */}
            {step === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${currentStepData.color} text-white flex items-center justify-center`}>
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-base">Tiêu chí & Vị trí</h2>
                    <p className="text-xs text-gray-400">Hệ thống sẽ gợi ý dựa trên tiêu chí này</p>
                  </div>
                </div>

                {/* Gender Preference */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Tôi muốn tìm kiếm
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'FEMALE', label: 'Nữ (Female)', emoji: '👩' },
                      { key: 'MALE', label: 'Nam (Male)', emoji: '👨' },
                    ].map(({ key, label, emoji }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPreferences({ ...preferences, genderPreference: key })}
                        className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-between transition-all ${
                          preferences.genderPreference === key
                            ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm ring-2 ring-pink-500/20'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{emoji}</span>
                          <span>{label}</span>
                        </span>
                        {preferences.genderPreference === key && <Check size={18} className="text-pink-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Picker & GPS Detection */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-pink-50/60 border border-pink-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation size={14} className="text-pink-600" />
                      Vị trí quét đối tượng
                    </label>
                    <span className="text-xs font-bold text-pink-700 bg-white px-2.5 py-1 rounded-xl border border-pink-200">
                      {coordinates.locationName}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDetectGPS()}
                      disabled={gpsDetecting}
                      className="p-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition active:scale-95 col-span-3 sm:col-span-1"
                    >
                      {gpsDetecting ? 'Đang định vị...' : '📍 Lấy GPS thiết bị'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDetectGPS(21.0285, 105.8542, 'Hà Nội')}
                      className="p-2.5 bg-white hover:bg-pink-100/50 border border-pink-200 text-gray-800 rounded-xl text-xs font-bold transition text-center"
                    >
                      Hà Nội
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDetectGPS(10.8231, 106.6297, 'TP.HCM')}
                      className="p-2.5 bg-white hover:bg-pink-100/50 border border-pink-200 text-gray-800 rounded-xl text-xs font-bold transition text-center"
                    >
                      TP. Hồ Chí Minh
                    </button>
                  </div>
                </div>

                {/* Max Distance */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={13} className="text-pink-500" />
                      Khoảng cách tối đa
                    </label>
                    <span className="text-sm font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                      {preferences.maxDistance} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={500}
                    value={preferences.maxDistance}
                    onChange={(e) => setPreferences({ ...preferences, maxDistance: Number(e.target.value) })}
                    className="dating-slider"
                  />
                </div>

                {/* Age Range */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Độ tuổi mong muốn
                    </label>
                    <span className="text-sm font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                      {preferences.minAge} – {preferences.maxAge} tuổi
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tuổi tối thiểu</p>
                      <input
                        type="range"
                        min={18}
                        max={100}
                        value={preferences.minAge}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPreferences({ ...preferences, minAge: Math.min(val, preferences.maxAge - 1) });
                        }}
                        className="dating-slider"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tuổi tối đa</p>
                      <input
                        type="range"
                        min={18}
                        max={100}
                        value={preferences.maxAge}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPreferences({ ...preferences, maxAge: Math.max(val, preferences.minAge + 1) });
                        }}
                        className="dating-slider"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-2xl font-semibold text-sm transition flex items-center gap-1.5"
                  >
                    <ChevronLeft size={18} /> Quay lại
                  </button>

                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={saving}
                    className="px-8 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-xl transition transform active:scale-95 text-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving ? 'Đang hoàn tất...' : (
                      <>
                        <Flame size={16} className="fill-current" />
                        Bắt đầu khám phá!
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Skip Link */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Bạn có thể cập nhật thông tin này bất kỳ lúc nào trong{' '}
          <button
            type="button"
            onClick={() => navigate('/dating/settings')}
            className="text-pink-500 font-bold hover:underline"
          >
            Cài đặt hồ sơ
          </button>
        </p>
      </div>
    </div>
  );
}

