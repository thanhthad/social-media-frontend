import React, { useState } from 'react';

const LocationPicker = ({ latitude, longitude, setLatitude, setLongitude, hasLocation }) => {
    const [status, setStatus] = useState(hasLocation ? 'Đã lấy vị trí thành công' : 'Chưa có vị trí');
    const [loading, setLoading] = useState(false);

    const getLocation = () => {
        setLoading(true);
        setStatus('Đang định vị...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                    setStatus('Đã lấy vị trí thành công!');
                    setLoading(false);
                },
                (error) => {
                    let errorMessage = "Lỗi khi lấy vị trí.";
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = "Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt của bạn.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = "Thông tin vị trí không khả dụng.";
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = "Yêu cầu vị trí quá thời gian. Vui lòng thử lại.";
                    }
                    setStatus(errorMessage);
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        } else {
            setStatus("Trình duyệt của bạn không hỗ trợ Geolocation.");
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="block text-sm font-semibold text-gray-700 mb-2">Vị trí của bạn</h3>
            <p className="text-xs text-gray-500 mb-4">Vị trí được sử dụng để tìm kiếm những người xung quanh bạn một cách chính xác nhất.</p>
            
            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    onClick={getLocation}
                    disabled={loading}
                    className="self-start flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors font-medium text-sm border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none disabled:opacity-50"
                >
                    {loading ? (
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    )}
                    {loading ? 'Đang định vị...' : 'Sử dụng vị trí hiện tại'}
                </button>
                
                {status && (
                    <span className={`text-sm font-medium flex items-start gap-1.5 ${status.includes('thành công') || hasLocation ? 'text-emerald-600' : status.includes('Đang') ? 'text-gray-500' : 'text-amber-600'}`}>
                        {status.includes('thành công') || hasLocation ? (
                            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        ) : status.includes('Đang') ? (
                            null
                        ) : (
                            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        )}
                        {status}
                    </span>
                )}
            </div>
        </div>
    );
};

export default LocationPicker;
