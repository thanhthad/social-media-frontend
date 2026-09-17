import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { useSocial } from '../../contexts/MockSocialContext';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useSocial();
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [website, setWebsite] = useState(currentUser.website);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [cover, setCover] = useState(currentUser.cover);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      updateProfile({
        name,
        bio,
        location,
        website,
        avatar,
        cover,
      });
      setIsSubmitting(false);
      toast.success('Đã cập nhật trang cá nhân thành công!');
      onClose();
    }, 400);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa trang cá nhân" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Avatar chooser */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Ảnh đại diện:
          </label>
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt="Current avatar"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-600"
            />
            <div className="flex gap-2">
              {sampleAvatars.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(src)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                    avatar === src ? 'border-indigo-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="sample" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <Input
          label="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tiểu sử (Bio)
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-600"
          />
        </div>

        <Input
          label="Địa điểm"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Input
          label="Trang web / Portfolio"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
