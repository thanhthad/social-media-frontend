import React from 'react';
import { motion } from 'framer-motion';

const DatingPreferenceForm = ({ formData, handleChange }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm"
        >
            <h2 className="text-xl font-bold mb-5 text-gray-800 border-b border-gray-200/50 pb-3">Tiêu chí tìm kiếm</h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Đang tìm kiếm</label>
                    <div className="flex gap-4">
                        {[
                            { key: 'FEMALE', label: 'Nữ' },
                            { key: 'MALE', label: 'Nam' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex-1 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="genderPreference" 
                                    value={key}
                                    checked={formData.genderPreference === key}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`text-center py-2 px-4 rounded-xl border transition-all ${formData.genderPreference === key ? 'bg-pink-500 text-white border-pink-500 shadow-md font-semibold' : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'}`}>
                                    {label}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-semibold text-gray-700">Độ tuổi tối thiểu</label>
                        <span className="text-sm font-medium text-pink-600">{formData.minAge} tuổi</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            name="minAge"
                            min="18"
                            max="100"
                            value={formData.minAge}
                            onChange={handleChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-semibold text-gray-700">Độ tuổi tối đa</label>
                        <span className="text-sm font-medium text-pink-600">{formData.maxAge} tuổi</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            name="maxAge"
                            min="18"
                            max="100"
                            value={formData.maxAge}
                            onChange={handleChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                    </div>
                </div>
                
                {formData.minAge > formData.maxAge && (
                    <div className="text-red-500 text-xs mt-1">Độ tuổi tối đa phải lớn hơn hoặc bằng độ tuổi tối thiểu.</div>
                )}
                
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-semibold text-gray-700">Khoảng cách tối đa</label>
                        <span className="text-sm font-medium text-pink-600">{formData.maxDistance} km</span>
                    </div>
                    <input
                        type="range"
                        name="maxDistance"
                        min="1"
                        max="500"
                        value={formData.maxDistance}
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default DatingPreferenceForm;
