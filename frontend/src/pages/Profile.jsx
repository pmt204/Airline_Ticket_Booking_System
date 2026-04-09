import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();

  // STATE CHO MODAL ĐÁNH GIÁ
  const [reviewModal, setReviewModal] = useState({ isOpen: false, bookingId: null, rating: 5, comment: '' });

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const { data } = await axiosClient.get('/api/bookings/my-bookings');
        setBookings(data);
      } catch (err) { console.error('Lỗi khi lấy vé:', err); }
    };
    fetchMyBookings();
  }, [reload]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosClient.put('/api/users/profile', { fullName, phone, password });
      setMessage('Cập nhật thông tin thành công!');
      setUser({ ...user, fullName: data.fullName, phone: data.phone });
      setPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { 
      console.error(err);
      setMessage('Cập nhật thất bại!'); }
  };

  // API Gửi Đánh Giá
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/api/bookings/${reviewModal.bookingId}/review`, { 
        rating: reviewModal.rating, 
        comment: reviewModal.comment 
      });
      alert('Cảm ơn bạn đã đánh giá chuyến bay!');
      setReviewModal({ isOpen: false, bookingId: null, rating: 5, comment: '' });
      setReload(!reload); // Load lại để hiện ngôi sao
    } catch (err) { alert(err.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] py-10 relative">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* SIDEBAR */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center pb-6">
            <div className="bg-gray-800 h-24 w-full"></div>
            <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto -mt-12 border-4 border-white shadow-lg">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-black text-gray-800 mt-4">{user?.fullName}</h2>
            <p className="text-sm font-bold text-gray-500 mb-1">{user?.email}</p>
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {user?.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên Vàng'}
            </span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="md:col-span-3 space-y-8">
          
          {/* Cập nhật thông tin */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-black text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">Thiết Lập Tài Khoản</h3>
            {message && <div className={`p-4 mb-6 rounded-lg font-bold text-center ${message.includes('thành công') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message}</div>}
            
            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Họ và Tên</label>
                <input type="text" className="w-full p-3 bg-gray-50 border rounded-xl focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                <input type="tel" className="w-full p-3 bg-gray-50 border rounded-xl focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới <span className="text-gray-400 font-normal">(Bỏ trống nếu không muốn đổi)</span></label>
                <input type="password" placeholder="••••••••" className="w-full p-3 bg-gray-50 border rounded-xl focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 shadow-md transition">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>

          {/* Lịch Sử Giao Dịch */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-black text-gray-800 mb-6 border-l-4 border-red-600 pl-3">Lịch Sử Giao Dịch</h3>
            
            {bookings.length === 0 ? (
              <p className="text-gray-500 italic text-center py-6">Bạn chưa có giao dịch nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-4 font-bold rounded-tl-lg">Mã PNR</th>
                      <th className="p-4 font-bold">Chuyến bay</th>
                      <th className="p-4 font-bold">Tổng tiền</th>
                      <th className="p-4 font-bold">Trạng thái</th>
                      <th className="p-4 font-bold text-center rounded-tr-lg">Đánh giá / Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-4 font-black text-blue-600">{b.bookingCode}</td>
                        <td className="p-4 font-bold text-gray-800">
                          {b.outboundFlight?.flightNumber || 'N/A'}
                          {b.inboundFlight && <span className="block text-[10px] text-green-600 uppercase tracking-widest mt-1">+ Khứ hồi</span>}
                        </td>
                        <td className="p-4 font-bold text-red-600">{b.totalAmount.toLocaleString()} đ</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${b.bookingStatus === 'Cancelled' ? 'bg-gray-500' : b.bookingStatus === 'Completed' ? 'bg-indigo-600' : 'bg-green-500'}`}>
                            {b.bookingStatus === 'Completed' ? 'Đã Bay' : b.bookingStatus}
                          </span>
                        </td>
                        
                        {/* CỘT HÀNH ĐỘNG / ĐÁNH GIÁ */}
                        <td className="p-4 text-center">
                          {b.bookingStatus === 'Completed' ? (
                            // NẾU ĐÃ BAY: KIỂM TRA XEM ĐÃ ĐÁNH GIÁ CHƯA
                            b.rating ? (
                              <div className="text-yellow-400 text-lg tracking-widest" title={b.reviewComment}>
                                {'★'.repeat(b.rating)}{'☆'.repeat(5 - b.rating)}
                              </div>
                            ) : (
                              <button onClick={() => setReviewModal({ isOpen: true, bookingId: b._id, rating: 5, comment: '' })} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                                ⭐ Viết Đánh Giá
                              </button>
                            )
                          ) : (
                            // CÁC TRẠNG THÁI KHÁC
                            <button onClick={() => navigate(`/booking/${b._id}`)} className="text-blue-600 font-bold hover:text-blue-800 hover:underline text-xs bg-blue-50 px-3 py-1 rounded transition">
                              Chi tiết ➔
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ĐÁNH GIÁ TRẢI NGHIỆM */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in relative">
            <button onClick={() => setReviewModal({...reviewModal, isOpen: false})} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
            <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">Đánh giá chuyến bay</h2>
            <p className="text-center text-gray-500 text-sm mb-6">Chia sẻ trải nghiệm của bạn với VietTicket</p>

            <form onSubmit={handleSubmitReview}>
              <div className="flex justify-center gap-2 mb-6 cursor-pointer">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    onClick={() => setReviewModal({...reviewModal, rating: star})}
                    className={`text-4xl transition transform hover:scale-110 ${reviewModal.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              
              <textarea 
                required
                rows="4" 
                placeholder="Chuyến bay có êm ái không? Tiếp viên có nhiệt tình không?" 
                className="w-full border-2 border-gray-200 rounded-xl p-4 outline-none focus:border-yellow-400 mb-6 font-medium text-gray-700 resize-none"
                value={reviewModal.comment}
                onChange={(e) => setReviewModal({...reviewModal, comment: e.target.value})}
              ></textarea>

              <button type="submit" className="w-full bg-yellow-400 text-yellow-900 font-black text-lg py-3 rounded-xl hover:bg-yellow-500 shadow-md transition">
                GỬI ĐÁNH GIÁ
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;