import { useState, useRef } from 'react';
import {
  X,
  Camera,
  User,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Globe,
  Lock,
  Calendar,
  Eye,
  Pencil,
  Plus,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import EditFieldModal from './EditFieldModal';

/**
 * EditProfileModal — Modal popup chỉnh sửa trang cá nhân phong cách Facebook.
 * Bấm vào nút "Chỉnh sửa trang cá nhân" sẽ mở modal này.
 * Trong modal có danh sách các mục (Ảnh đại diện, Ảnh bìa, Tiểu sử, Chi tiết thông tin...).
 * Mỗi mục có nút "Chỉnh sửa" / "Thêm" riêng biệt, chỉ chỉnh sửa và lưu 1 field duy nhất tại 1 thời điểm.
 */
export default function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  onProfileUpdated,
}) {
  const avatarFileRef = useRef(null);
  const coverFileRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  // Sub-modal state for editing 1 field
  const [fieldModalConfig, setFieldModalConfig] = useState({
    open: false,
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    fieldOptions: [],
    initialValue: '',
    maxLength: undefined,
    placeholder: '',
  });

  if (!isOpen || !profileData) return null;

  const {
    fullName,
    username,
    avatarUrl,
    coverUrl,
    bio,
    dateOfBirth,
    gender,
    phone,
    website,
    country,
    city,
    district,
    occupation,
    company,
    education,
    visibility,
  } = profileData;

  // Handle Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarLoading(true);
      const res = await userService.updateAvatar(file);
      const newAvatarUrl = res.data?.data?.avatarUrl || URL.createObjectURL(file);
      onProfileUpdated?.({ avatarUrl: newAvatarUrl });
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle Cover upload
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCoverLoading(true);
      const res = await userService.updateCover(file);
      const newCoverUrl = res.data?.data?.coverUrl || URL.createObjectURL(file);
      onProfileUpdated?.({ coverUrl: newCoverUrl });
      toast.success('Cập nhật ảnh bìa thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật ảnh bìa thất bại');
    } finally {
      setCoverLoading(false);
    }
  };

  // Open single-field edit modal
  const handleOpenFieldEdit = (config) => {
    setFieldModalConfig({
      ...config,
      open: true,
    });
  };

  // Save 1 single field
  const handleSaveField = async (fieldName, value) => {
    await userService.patchProfileField(fieldName, value);
    const fieldKeyMap = {
      FULL_NAME: 'fullName',
      BIO: 'bio',
      DATE_OF_BIRTH: 'dateOfBirth',
      GENDER: 'gender',
      PHONE: 'phone',
      WEBSITE: 'website',
      COUNTRY: 'country',
      CITY: 'city',
      DISTRICT: 'district',
      OCCUPATION: 'occupation',
      COMPANY: 'company',
      EDUCATION: 'education',
      VISIBILITY: 'visibility',
    };
    const key = fieldKeyMap[fieldName];
    if (key) {
      onProfileUpdated?.({ [key]: value });
    }
    toast.success('Đã cập nhật thành công!');
  };

  const genderLabels = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
  };

  const visibilityLabels = {
    PUBLIC: 'Công khai',
    FRIEND: 'Chỉ bạn bè',
    PRIVATE: 'Riêng tư',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 relative">
          <h2 className="text-lg font-black text-gray-900 text-center w-full">
            Chỉnh sửa trang cá nhân
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 dating-scrollbar">
          {/* 1. Ảnh đại diện */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Ảnh đại diện</h3>
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={avatarLoading}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition"
              >
                {avatarLoading ? 'Đang tải...' : 'Chỉnh sửa'}
              </button>
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex justify-center">
              <div className="relative group">
                <img
                  src={avatarUrl || 'https://via.placeholder.com/120'}
                  alt={fullName || username}
                  className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow-md bg-white"
                />
                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Camera size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* 2. Ảnh bìa */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Ảnh bìa</h3>
              <button
                type="button"
                onClick={() => coverFileRef.current?.click()}
                disabled={coverLoading}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition"
              >
                {coverLoading ? 'Đang tải...' : 'Chỉnh sửa'}
              </button>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
            <div className="relative h-36 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 shadow-inner group">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70 text-xs font-semibold">
                  Chưa có ảnh bìa
                </div>
              )}
              <button
                type="button"
                onClick={() => coverFileRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold gap-1.5"
              >
                <Camera size={18} />
                <span>Đổi ảnh bìa</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* 3. Tiểu sử (Bio) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Tiểu sử</h3>
              <button
                type="button"
                onClick={() =>
                  handleOpenFieldEdit({
                    fieldName: 'BIO',
                    fieldLabel: 'Tiểu sử',
                    fieldType: 'textarea',
                    initialValue: bio || '',
                    maxLength: 500,
                    placeholder: 'Mô tả bản thân với mọi người...',
                  })
                }
                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition flex items-center gap-1"
              >
                {bio ? <Pencil size={13} /> : <Plus size={13} />}
                <span>{bio ? 'Chỉnh sửa' : 'Thêm'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 italic bg-gray-50 p-3.5 rounded-2xl border border-gray-100 leading-relaxed">
              {bio || 'Chưa có tiểu sử. Hãy viết vài dòng để bạn bè hiểu rõ hơn về bạn.'}
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* 4. Chi tiết thông tin cá nhân (Từng field 1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Chỉnh sửa phần giới thiệu</h3>
                <p className="text-[11px] text-gray-400">
                  Nhấn "Chỉnh sửa" cạnh từng mục để thay đổi 1 thông tin duy nhất
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/40">
              {/* Họ và tên */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Họ và tên</p>
                    <p className="text-xs font-semibold text-gray-800">{fullName || 'Chưa thêm họ tên'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'FULL_NAME',
                      fieldLabel: 'Họ và tên',
                      fieldType: 'text',
                      initialValue: fullName || '',
                      maxLength: 100,
                      placeholder: 'Nhập họ và tên đầy đủ',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Ngày sinh */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ngày sinh</p>
                    <p className="text-xs font-semibold text-gray-800">{dateOfBirth || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'DATE_OF_BIRTH',
                      fieldLabel: 'Ngày sinh',
                      fieldType: 'date',
                      initialValue: dateOfBirth || '',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Giới tính */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Giới tính</p>
                    <p className="text-xs font-semibold text-gray-800">
                      {genderLabels[gender] || 'Chưa chọn'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'GENDER',
                      fieldLabel: 'Giới tính',
                      fieldType: 'select',
                      initialValue: gender || 'MALE',
                      fieldOptions: [
                        { value: 'MALE', label: 'Nam' },
                        { value: 'FEMALE', label: 'Nữ' },
                        { value: 'OTHER', label: 'Khác' },
                      ],
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Nghề nghiệp */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nghề nghiệp</p>
                    <p className="text-xs font-semibold text-gray-800">{occupation || 'Chưa thêm nghề nghiệp'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'OCCUPATION',
                      fieldLabel: 'Nghề nghiệp',
                      fieldType: 'text',
                      initialValue: occupation || '',
                      maxLength: 100,
                      placeholder: 'Lập trình viên, Giáo viên...',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Công ty */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Công ty / Nơi làm việc</p>
                    <p className="text-xs font-semibold text-gray-800">{company || 'Chưa thêm nơi làm việc'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'COMPANY',
                      fieldLabel: 'Công ty / Nơi làm việc',
                      fieldType: 'text',
                      initialValue: company || '',
                      maxLength: 100,
                      placeholder: 'Tên công ty, doanh nghiệp...',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Học vấn */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <GraduationCap size={16} className="text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Học vấn</p>
                    <p className="text-xs font-semibold text-gray-800">{education || 'Chưa thêm học vấn'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'EDUCATION',
                      fieldLabel: 'Học vấn',
                      fieldType: 'text',
                      initialValue: education || '',
                      maxLength: 150,
                      placeholder: 'Đại học Bách Khoa Hà Nội...',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Thành phố */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-rose-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tỉnh / Thành phố</p>
                    <p className="text-xs font-semibold text-gray-800">{city || 'Chưa thêm tỉnh/thành phố'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'CITY',
                      fieldLabel: 'Tỉnh / Thành phố',
                      fieldType: 'text',
                      initialValue: city || '',
                      maxLength: 100,
                      placeholder: 'Hà Nội, TP. Hồ Chí Minh...',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Quận / Huyện */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quận / Huyện</p>
                    <p className="text-xs font-semibold text-gray-800">{district || 'Chưa thêm quận/huyện'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'DISTRICT',
                      fieldLabel: 'Quận / Huyện',
                      fieldType: 'text',
                      initialValue: district || '',
                      maxLength: 100,
                      placeholder: 'Cầu Giấy, Hoàn Kiếm...',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Quốc gia */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quốc gia</p>
                    <p className="text-xs font-semibold text-gray-800">{country || 'Việt Nam'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'COUNTRY',
                      fieldLabel: 'Quốc gia',
                      fieldType: 'text',
                      initialValue: country || 'Việt Nam',
                      maxLength: 100,
                      placeholder: 'Việt Nam...',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Số điện thoại */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Số điện thoại</p>
                    <p className="text-xs font-semibold text-gray-800">{phone || 'Chưa thêm số điện thoại'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'PHONE',
                      fieldLabel: 'Số điện thoại',
                      fieldType: 'text',
                      initialValue: phone || '',
                      placeholder: '0912 345 678',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Website */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Website</p>
                    <p className="text-xs font-semibold text-gray-800">{website || 'Chưa thêm website'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'WEBSITE',
                      fieldLabel: 'Website',
                      fieldType: 'text',
                      initialValue: website || '',
                      maxLength: 255,
                      placeholder: 'https://...',
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Quyền riêng tư */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Eye size={16} className="text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quyền riêng tư</p>
                    <p className="text-xs font-semibold text-gray-800">
                      {visibilityLabels[visibility] || 'Công khai'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'VISIBILITY',
                      fieldLabel: 'Quyền riêng tư trang cá nhân',
                      fieldType: 'select',
                      initialValue: visibility || 'PUBLIC',
                      fieldOptions: [
                        { value: 'PUBLIC', label: 'Công khai (Mọi người đều xem được)' },
                        { value: 'FRIEND', label: 'Chỉ bạn bè' },
                        { value: 'PRIVATE', label: 'Riêng tư (Chỉ mình tôi)' },
                      ],
                    })
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Thay đổi từng mục được lưu ngay lập tức
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Xong
          </button>
        </div>
      </div>

      {/* Sub-modal popup cho từng field riêng lẻ */}
      <EditFieldModal
        open={fieldModalConfig.open}
        onClose={() => setFieldModalConfig((m) => ({ ...m, open: false }))}
        fieldLabel={fieldModalConfig.fieldLabel}
        fieldType={fieldModalConfig.fieldType}
        fieldOptions={fieldModalConfig.fieldOptions}
        initialValue={fieldModalConfig.initialValue}
        maxLength={fieldModalConfig.maxLength}
        placeholder={fieldModalConfig.placeholder}
        onSave={(val) => handleSaveField(fieldModalConfig.fieldName, val)}
      />
    </div>
  );
}
