import { useState } from 'react';
import {
  X,
  User,
  Calendar,
  Briefcase,
  GraduationCap,
  MapPin,
  Flame,
  Globe,
  Eye,
  Pencil,
  Plus,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import datingService from '../../services/datingService';
import EditFieldModal from '../profile/EditFieldModal';

/**
 * EditDatingProfileModal — Modal popup chỉnh sửa hồ sơ hẹn hò phong cách Facebook.
 * Cho phép người dùng chỉnh sửa từng field riêng lẻ trên hồ sơ hẹn hò (1 field 1 lần).
 */
export default function EditDatingProfileModal({
  isOpen,
  onClose,
  datingProfile,
  onProfileUpdated,
}) {
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

  if (!isOpen || !datingProfile) return null;

  const {
    displayName,
    bio,
    gender,
    birthday,
    height,
    occupation,
    education,
    city,
    district,
    country,
    visibility,
    active,
  } = datingProfile;

  const handleOpenFieldEdit = (config) => {
    setFieldModalConfig({
      ...config,
      open: true,
    });
  };

  const handleSaveField = async (fieldName, value) => {
    await datingService.patchDatingProfileField(fieldName, value);
    const fieldKeyMap = {
      DISPLAY_NAME: 'displayName',
      BIO: 'bio',
      GENDER: 'gender',
      BIRTHDAY: 'birthday',
      HEIGHT: 'height',
      OCCUPATION: 'occupation',
      EDUCATION: 'education',
      CITY: 'city',
      DISTRICT: 'district',
      COUNTRY: 'country',
      VISIBILITY: 'visibility',
      ACTIVE: 'active',
    };
    const key = fieldKeyMap[fieldName];
    if (key) {
      onProfileUpdated?.({ [key]: value });
    }
    toast.success('Đã cập nhật hồ sơ hẹn hò!');
  };

  const genderLabels = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
  };

  const visibilityLabels = {
    PUBLIC: 'Đang bật (Công khai)',
    PRIVATE: 'Tạm ẩn (Riêng tư)',
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 relative bg-gradient-to-r from-pink-500/5 to-rose-500/5">
          <div className="flex items-center justify-center gap-2 w-full">
            <Flame className="w-5 h-5 text-pink-500 fill-pink-500" />
            <h2 className="text-lg font-black text-gray-900">
              Chỉnh sửa hồ sơ hẹn hò
            </h2>
          </div>
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
          {/* Bio Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Giới thiệu bản thân (Bio)</h3>
              <button
                type="button"
                onClick={() =>
                  handleOpenFieldEdit({
                    fieldName: 'BIO',
                    fieldLabel: 'Tiểu sử hẹn hò',
                    fieldType: 'textarea',
                    initialValue: bio || '',
                    maxLength: 500,
                    placeholder: 'Chia sẻ về tính cách, gu của bạn...',
                  })
                }
                className="text-xs font-bold text-pink-600 hover:text-pink-700 px-3 py-1.5 rounded-xl hover:bg-pink-50 transition flex items-center gap-1"
              >
                {bio ? <Pencil size={13} /> : <Plus size={13} />}
                <span>{bio ? 'Chỉnh sửa' : 'Thêm'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 italic bg-pink-50/40 p-3.5 rounded-2xl border border-pink-100 leading-relaxed">
              {bio || 'Chưa có lời giới thiệu. Hãy thêm một vài câu dí dỏm để thu hút đối phương!'}
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* Details list */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Chi tiết thông tin cá nhân</h3>
              <p className="text-[11px] text-gray-400">
                Nhấn "Chỉnh sửa" cạnh từng mục để thay đổi 1 thông tin duy nhất
              </p>
            </div>

            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/40">
              {/* Tên hiển thị */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-pink-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tên hiển thị</p>
                    <p className="text-xs font-semibold text-gray-800">{displayName || 'Chưa nhập'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'DISPLAY_NAME',
                      fieldLabel: 'Tên hiển thị hẹn hò',
                      fieldType: 'text',
                      initialValue: displayName || '',
                      maxLength: 100,
                      placeholder: 'Ví dụ: Alex, Quỳnh Như...',
                    })
                  }
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
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
                    <p className="text-xs font-semibold text-gray-800">{genderLabels[gender] || 'Chưa chọn'}</p>
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
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
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
                    <p className="text-xs font-semibold text-gray-800">{birthday ? String(birthday).substring(0, 10) : 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'BIRTHDAY',
                      fieldLabel: 'Ngày sinh',
                      fieldType: 'date',
                      initialValue: birthday ? String(birthday).substring(0, 10) : '',
                    })
                  }
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Chiều cao */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Chiều cao</p>
                    <p className="text-xs font-semibold text-gray-800">{height ? `${height} cm` : 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'HEIGHT',
                      fieldLabel: 'Chiều cao (cm)',
                      fieldType: 'number',
                      initialValue: height ? String(height) : '170',
                      placeholder: 'Ví dụ: 172',
                    })
                  }
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
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
                      placeholder: 'Kỹ sư phần mềm, Designer...',
                    })
                  }
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Học vấn */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <GraduationCap size={16} className="text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trường học / Học vấn</p>
                    <p className="text-xs font-semibold text-gray-800">{education || 'Chưa thêm học vấn'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenFieldEdit({
                      fieldName: 'EDUCATION',
                      fieldLabel: 'Học vấn / Trường học',
                      fieldType: 'text',
                      initialValue: education || '',
                      maxLength: 150,
                      placeholder: 'Đại học Bách Khoa...',
                    })
                  }
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Tỉnh / Thành phố */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-rose-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tỉnh / Thành phố</p>
                    <p className="text-xs font-semibold text-gray-800">{city || 'Chưa cập nhật'}</p>
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
                      placeholder: 'Hà Nội, TP. HCM...',
                    })
                  }
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
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
                    <p className="text-xs font-semibold text-gray-800">{district || 'Chưa cập nhật'}</p>
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
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
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
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
                >
                  Chỉnh sửa
                </button>
              </div>

              {/* Hiển thị tìm kiếm (Visibility) */}
              <div className="flex items-center justify-between p-3.5 hover:bg-white transition">
                <div className="flex items-center gap-3">
                  <Eye size={16} className="text-pink-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hiển thị tìm kiếm</p>
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
                      fieldLabel: 'Hiển thị tìm kiếm hồ sơ hẹn hò',
                      fieldType: 'select',
                      initialValue: visibility || 'PUBLIC',
                      fieldOptions: [
                        { value: 'PUBLIC', label: 'Công khai (Hiển thị để người khác quẹt thẻ)' },
                        { value: 'PRIVATE', label: 'Tạm ẩn (Không xuất hiện trong tìm kiếm)' },
                      ],
                    })
                  }
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2.5 py-1 rounded-lg hover:bg-pink-50 transition"
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
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
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
