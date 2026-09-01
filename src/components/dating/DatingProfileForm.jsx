import React from 'react';
import { motion } from 'framer-motion';
import LocationPicker from './LocationPicker';
import InterestSelector from './InterestSelector';

const DatingProfileForm = ({ formData, handleChange, latitude, longitude, setLatitude, setLongitude, hasLocation, selectedInterestIds, setSelectedInterestIds }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm"
        >
            <h2 className="text-xl font-bold mb-5 text-gray-800 border-b border-gray-200/50 pb-3">Hồ sơ của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tên hiển thị</label>
                    <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        required
                        maxLength={50}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                        placeholder="Nhập tên hiển thị"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Giới tính</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                    >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày sinh</label>
                    <input
                        type="date"
                        name="birthday"
                        value={formData.birthday || ''}
                        onChange={handleChange}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Chiều cao (cm)</label>
                    <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        min="100" max="250"
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                        placeholder="Ví dụ: 170"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nghề nghiệp</label>
                    <input
                        type="text"
                        name="occupation"
                        value={formData.occupation || ''}
                        onChange={handleChange}
                        maxLength={50}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                        placeholder="Ví dụ: Kỹ sư phần mềm"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Trường học / Học vấn</label>
                    <input
                        type="text"
                        name="education"
                        value={formData.education || ''}
                        onChange={handleChange}
                        maxLength={50}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                        placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quốc gia</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country || ''}
                        onChange={handleChange}
                        maxLength={50}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                        placeholder="Ví dụ: Vietnam"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh / Thành phố</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                        maxLength={50}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                        placeholder="Ví dụ: Hà Nội"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quận / Huyện</label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district || ''}
                        onChange={handleChange}
                        maxLength={50}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none"
                        placeholder="Ví dụ: Hoàn Kiếm"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tiểu sử (Bio)</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="3"
                        maxLength={500}
                        className="w-full p-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all outline-none resize-none"
                        placeholder="Giới thiệu về bản thân..."
                    ></textarea>
                </div>
                
                <div className="md:col-span-2">
                    <InterestSelector 
                        selectedInterestIds={selectedInterestIds}
                        setSelectedInterestIds={setSelectedInterestIds}
                    />
                </div>

                <div className="md:col-span-2">
                    <LocationPicker 
                        latitude={latitude}
                        longitude={longitude}
                        setLatitude={setLatitude}
                        setLongitude={setLongitude}
                        hasLocation={hasLocation}
                    />
                </div>
                
                <div className="md:col-span-2 mt-6 border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="block text-sm font-semibold text-gray-700">Trạng thái hồ sơ</h3>
                            <p className="text-xs text-gray-500">Khi tắt, bạn sẽ không xuất hiện trong tính năng tìm kiếm của người khác.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="active" 
                                checked={formData.active} 
                                onChange={(e) => handleChange({ target: { name: 'active', value: e.target.checked } })}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                        </label>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DatingProfileForm;
