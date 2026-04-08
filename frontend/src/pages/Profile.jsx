import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [reload, setReload] = useState(false); // Thêm biến trigger

  useEffect(() => {
    // Đưa hàm fetch vào trong useEffect
    const fetchMyBookings = async () => {
      try {
        const { data } = await axiosClient.get('/api/users/my-bookings');
        setBookings(data);
      } catch (err) {
        console.error('Lỗi khi lấy vé:', err);
      }
    };

    fetchMyBookings();
  }, [reload]); // Chạy lại khi reload thay đổi

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosClient.put('/api/users/profile', { fullName, password });
      setMessage(data.message);
      setUser({ ...user, fullName: data.fullName });
      setPassword('');
    } catch (err) {
      console.error(err);
      setMessage('Cập nhật thất bại!');
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy chuyến bay này?')) {
      try {
        await axiosClient.put(`/api/users/cancel-booking/${id}`);
        alert('Đã hủy vé thành công!');
        setReload(!reload); // Kích hoạt useEffect tải lại danh sách vé
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể hủy vé lúc này');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-xl font-bold text-primary mb-4">Hồ sơ cá nhân</h2>
        {message && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{message}</div>}
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Họ và Tên</label>
            <input type="text" className="w-full p-2 border rounded"
              value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mật khẩu mới (Để trống nếu không đổi)</label>
            <input type="password" className="w-full p-2 border rounded"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-blue-800">
            Cập nhật thông tin
          </button>
        </form>
      </div>

      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-primary mb-4">Chuyến bay của tôi</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">Bạn chưa đặt chuyến bay nào.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-secondary">Mã vé: {booking.bookingCode}</p>
                  <p>Mã chuyến bay: {booking.flight?.flightNumber || 'N/A'}</p>
                  <p>Trạng thái: <span className={`font-semibold ${booking.bookingStatus === 'Cancelled' ? 'text-red-500' : 'text-green-500'}`}>{booking.bookingStatus}</span></p>
                  <p>Tổng tiền: {booking.totalAmount.toLocaleString()} VND</p>
                </div>
                {booking.bookingStatus !== 'Cancelled' && (
                  <button 
                    onClick={() => handleCancelBooking(booking._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Hủy vé
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;