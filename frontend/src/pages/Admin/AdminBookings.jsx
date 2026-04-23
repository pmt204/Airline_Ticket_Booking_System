import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axiosClient.get('/api/bookings/all');
        setBookings(res.data);
      } catch (err) { console.error(err); }
    };
    fetchBookings();
  }, [reload]);

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Confirmed' : 'Completed';
    try {
      await axiosClient.put(`/api/bookings/${id}/status`, { status: newStatus });
      alert('Cập nhật trạng thái thành công!');
      setReload(!reload);
    } catch (err) { console.error(err); alert('Lỗi cập nhật!'); }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-black text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">🎫 Quản lý Đơn đặt vé (Bookings)</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4 font-bold rounded-tl-lg">Mã PNR</th>
              <th className="p-4 font-bold">Khách hàng</th>
              <th className="p-4 font-bold">Chuyến bay</th>
              <th className="p-4 font-bold">Tổng tiền</th>
              <th className="p-4 font-bold">Thanh toán</th>
              <th className="p-4 font-bold">Trạng thái</th>
              <th className="p-4 font-bold text-center rounded-tr-lg">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500 italic">Chưa có đơn đặt vé nào.</td></tr>}
            
            {bookings.map(b => (
              <tr key={b._id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${b.bookingStatus === 'Cancelled' ? 'bg-gray-50 opacity-70' : ''}`}>
                <td className="p-4 font-black text-blue-600 tracking-wider">{b.bookingCode}</td>
                
                <td className="p-4">
                  <div className="font-bold text-gray-800">{b.user?.fullName || 'Khách vãng lai'}</div>
                  <div className="text-xs text-gray-500">{b.user?.phone || '--'}</div>
                </td>
                
                <td className="p-4">
                  <div className="font-bold text-gray-800">{b.outboundFlight?.flightNumber || 'N/A'}</div>
                  {b.inboundFlight && <span className="block text-[10px] text-green-600 font-black uppercase tracking-widest mt-1">+ Khứ hồi</span>}
                </td>
                
                <td className="p-4 font-black text-red-600 text-base">{b.totalAmount?.toLocaleString()} đ</td>
                
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${b.paymentStatus === 'Paid' ? 'bg-green-500' : b.paymentStatus === 'Refunded' ? 'bg-purple-500' : 'bg-red-500'}`}>
                    {b.paymentStatus === 'Paid' ? 'Đã Thanh Toán' : b.paymentStatus === 'Refunded' ? 'Đã Hoàn Tiền' : 'Chưa Thanh Toán'}
                  </span>
                </td>
                
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${b.bookingStatus === 'Confirmed' ? 'bg-blue-500' : b.bookingStatus === 'Completed' ? 'bg-indigo-600' : b.bookingStatus === 'Cancelled' ? 'bg-gray-500' : 'bg-orange-500'}`}>
                    {b.bookingStatus === 'Confirmed' ? 'Đã Xác Nhận' : b.bookingStatus === 'Cancelled' ? 'Đã Hủy' : b.bookingStatus}
                  </span>
                </td>
                
                <td className="p-4 text-center">
                  {b.bookingStatus === 'Pending' && (
                     <button onClick={() => handleUpdateStatus(b._id, b.bookingStatus)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition">
                       Duyệt vé
                     </button>
                  )}
                  {b.bookingStatus === 'Confirmed' && (
                     <button onClick={() => handleUpdateStatus(b._id, b.bookingStatus)} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black shadow-sm transition">
                       Hoàn tất
                     </button>
                  )}
                  {b.bookingStatus === 'Cancelled' && (
                     <span className="text-xs text-gray-400 font-bold italic">Không khả dụng</span>
                  )}
                  {b.bookingStatus === 'Completed' && (
                     <span className="text-xs text-green-600 font-black">✅ Đã bay</span>
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