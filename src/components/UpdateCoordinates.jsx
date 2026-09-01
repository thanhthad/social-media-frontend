import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

export default function UpdateCoordinates() {
  const { isAuthenticated } = useAuth();
  
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!latitude || !longitude) {
      setStatus({ type: 'error', message: 'Vui lòng nhập cả Vĩ độ và Kinh độ' });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ type: '', message: '' });

      await axiosClient.patch('/dating/profile/coordinates', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });

      setStatus({ 
        type: 'success', 
        message: 'Cập nhật toạ độ thành công!' 
      });
      
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <p className="text-red-700 font-medium">Bạn cần đăng nhập để sử dụng tính năng này</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-10 text-white text-center">
          <svg className="w-16 h-16 text-white/80 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Cập nhật Vị trí của bạn</h2>
          <p className="text-blue-100 max-w-md mx-auto">Giúp hệ thống tìm kiếm những người bạn phù hợp xung quanh khu vực của bạn.</p>
        </div>
        
        <div className="p-6 sm:p-10">
          {status.message && (
            <div className={`p-4 mb-8 rounded-lg text-sm flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {status.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              )}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ (Latitude)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">N/S</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="21.0285"
                    className="pl-12 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition shadow-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Giới hạn: -90.0 đến 90.0</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ (Longitude)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">E/W</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="105.8542"
                    className="pl-12 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition shadow-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Giới hạn: -180.0 đến 180.0</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl text-white font-medium text-lg transition duration-200 shadow-md flex items-center justify-center mx-auto ${
                  isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transform'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : 'Lưu Tọa Độ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
