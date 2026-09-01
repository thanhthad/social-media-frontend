import React, { useState, useEffect } from 'react';
import datingService from '../../services/datingService';

const InterestSelector = ({ selectedInterestIds, setSelectedInterestIds }) => {
    const [allInterests, setAllInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInterests = async () => {
            try {
                const data = await datingService.getAllInterests();
                setAllInterests(data || []);
            } catch (err) {
                console.error("Error fetching interests", err);
                setError('Không thể tải danh sách sở thích.');
            } finally {
                setLoading(false);
            }
        };
        fetchInterests();
    }, []);

    const toggleInterest = (id) => {
        setSelectedInterestIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            }
            return [...prev, id];
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-sm p-2">{error}</div>;
    }

    if (allInterests.length === 0) {
        return <div className="text-gray-500 text-sm">Không có sở thích nào.</div>;
    }

    return (
        <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="block text-sm font-semibold text-gray-700 mb-2">Sở thích của bạn</h3>
            <p className="text-xs text-gray-500 mb-4">Chọn các sở thích để hiển thị trên hồ sơ và tìm người có chung sở thích.</p>
            
            <div className="flex flex-wrap gap-2">
                {allInterests.map(interest => {
                    const isSelected = selectedInterestIds.includes(interest.id);
                    return (
                        <button
                            key={interest.id}
                            type="button"
                            onClick={() => toggleInterest(interest.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                isSelected 
                                ? 'bg-pink-100 text-pink-700 border-pink-300 shadow-sm' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                            }`}
                        >
                            {interest.icon && <span className="mr-1">{interest.icon}</span>}
                            {interest.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default InterestSelector;
