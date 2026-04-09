import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [reload, setReload] = useState(false);

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

  const handleCancelBooking = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy chuyến bay này? Thao tác này không thể hoàn tác.')) {
      try {
        await axiosClient.put(`/api/bookings/${id}/status`, { status: 'Cancelled' });
        alert('Đã hủy vé thành công!');
        setReload(!reload);
      } catch (err) { alert(err.response?.data?.message || 'Không thể hủy vé lúc này'); }
    }
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* SIDEBAR: THÔNG TIN USER */}
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
          
          {/* Form Cập nhật */}
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
                <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 shadow-md transition">
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>

          {/* Quản lý Vé Nhanh */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-black text-gray-800 mb-6 border-l-4 border-red-600 pl-3">Lịch Sử Giao Dịch</h3>
            {bookings.length === 0 ? (
              <p className="text-gray-500 italic text-center py-6">Bạn chưa có giao dịch nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr><th className="p-4 font-bold">Mã PNR</th><th className="p-4 font-bold">Chuyến bay</th><th className="p-4 font-bold">Ngày mua</th><th className="p-4 font-bold">Tổng tiền</th><th className="p-4 font-bold">Trạng thái</th><th className="p-4 font-bold">Hành động</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-black text-blue-600">{b.bookingCode}</td>
                        <td className="p-4 font-bold text-gray-800">{b.flight?.flightNumber || 'N/A'}</td>
                        <td className="p-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4 font-bold text-red-600">{b.totalAmount.toLocaleString()} đ</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${b.bookingStatus === 'Cancelled' ? 'bg-red-500' : b.bookingStatus === 'Confirmed' ? 'bg-green-500' : 'bg-orange-500'}`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          {b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Completed' && (
                            <button onClick={() => handleCancelBooking(b._id)} className="text-red-500 font-bold hover:text-red-700 underline text-xs">
                              Hủy vé
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
    </div>
  );
};

export default Profile;