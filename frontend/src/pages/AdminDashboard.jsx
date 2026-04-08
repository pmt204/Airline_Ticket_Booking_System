import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalBookings: 0, totalFlights: 0, totalUsers: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          axiosClient.get('/api/bookings/stats'),
          axiosClient.get('/api/bookings')
        ]);
        setStats(statsRes.data); setBookings(bookingsRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [reload]);

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Confirmed' : 'Completed';
    try {
      await axiosClient.put(`/api/bookings/${id}/status`, { status: newStatus });
      setReload(!reload);
    } catch (err) { console.error(err); alert('Lỗi cập nhật!'); }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Bảng Điều Khiển (Trưởng Nhóm)</h2>
      
      {/* CHỨC NĂNG 5: DASHBOARD THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-bold">TỔNG DOANH THU</p>
          <p className="text-2xl font-black text-blue-600">{stats.revenue?.toLocaleString()} đ</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-bold">TỔNG ĐƠN VÉ</p>
          <p className="text-2xl font-black text-green-600">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm font-bold">CHUYẾN BAY</p>
          <p className="text-2xl font-black text-orange-600">{stats.totalFlights}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm font-bold">NGƯỜI DÙNG</p>
          <p className="text-2xl font-black text-purple-600">{stats.totalUsers}</p>
        </div>
      </div>

      {/* CHỨC NĂNG 3 & 4: QUẢN LÝ ĐƠN HÀNG */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 bg-gray-800 text-white font-bold">DANH SÁCH ĐƠN ĐẶT VÉ</div>
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr><th className="p-4">Mã Vé</th><th className="p-4">Chuyến bay</th><th className="p-4">Tổng tiền</th><th className="p-4">Thanh toán</th><th className="p-4">Trạng thái</th><th className="p-4">Duyệt</th></tr>
          </thead>
          <tbody>
            {bookings.length === 0 && <tr><td colSpan="6" className="p-4 text-center">Chưa có dữ liệu. Hãy chạy qua trang Checkout để tạo vé!</td></tr>}
            {bookings.map(b => (
              <tr key={b._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{b.bookingCode}</td>
                <td className="p-4">{b.flight?.flightNumber || 'N/A'}</td>
                <td className="p-4 text-secondary font-bold">{b.totalAmount?.toLocaleString()}đ</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs text-white ${b.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`}>{b.paymentStatus}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${b.bookingStatus === 'Confirmed' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'}`}>{b.bookingStatus}</span>
                </td>
                <td className="p-4">
                  {b.bookingStatus === 'Pending' && (
                     <button onClick={() => handleUpdateStatus(b._id, b.bookingStatus)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Duyệt vé</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminDashboard;