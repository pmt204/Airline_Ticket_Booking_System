import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axiosClient.get('/api/bookings');
        setBookings(res.data);
      } catch (err) { console.error(err); }
    };
    fetchBookings();
  }, [reload]);

  const handleUpdateStatus = async (id, currentStatus) => {
    // Nếu đang Pending thì duyệt thành Confirmed, nếu Confirmed thì thành Completed
    const newStatus = currentStatus === 'Pending' ? 'Confirmed' : 'Completed';
    try {
      await axiosClient.put(`/api/bookings/${id}/status`, { status: newStatus });
      alert('Cập nhật trạng thái thành công!');
      setReload(!reload);
    } catch (err) { console.error(err); alert('Lỗi cập nhật!'); }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎫 Quản lý Đơn đặt vé (Bookings)</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4">Mã Vé</th><th className="p-4">Khách hàng</th><th className="p-4">Chuyến bay</th><th className="p-4">Tổng tiền</th><th className="p-4">Thanh toán</th><th className="p-4">Trạng thái</th><th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && <tr><td colSpan="7" className="p-4 text-center text-gray-500">Chưa có đơn đặt vé nào.</td></tr>}
            {bookings.map(b => (
              <tr key={b._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold text-blue-600">{b.bookingCode}</td>
                <td className="p-4">{b.user?.fullName || 'Khách vãng lai'}</td>
                <td className="p-4">{b.flight?.flightNumber || 'N/A'}</td>
                <td className="p-4 font-bold text-red-600">{b.totalAmount?.toLocaleString()} đ</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${b.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {b.paymentStatus}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${b.bookingStatus === 'Confirmed' ? 'text-green-700 bg-green-100' : b.bookingStatus === 'Completed' ? 'text-blue-700 bg-blue-100' : 'text-orange-700 bg-orange-100'}`}>
                    {b.bookingStatus}
                  </span>
                </td>
                <td className="p-4">
                  {b.bookingStatus === 'Pending' && (
                     <button onClick={() => handleUpdateStatus(b._id, b.bookingStatus)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Duyệt vé</button>
                  )}
                  {b.bookingStatus === 'Confirmed' && (
                     <button onClick={() => handleUpdateStatus(b._id, b.bookingStatus)} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">Hoàn tất</button>
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
export default AdminBookings;