import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalBookings: 0, totalFlights: 0, totalUsers: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [flights, setFlights] = useState([]); 
  const [reload, setReload] = useState(false);
  
  const [activeTab, setActiveTab] = useState('transactions'); 
  const [editingFlight, setEditingFlight] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes, flightsRes] = await Promise.all([
          axiosClient.get('/api/bookings/dashboard'),
          axiosClient.get('/api/bookings/all'),
          axiosClient.get('/api/flights/search') 
        ]);
        setStats(statsRes.data); 
        setBookings(bookingsRes.data);
        setFlights(flightsRes.data);
      } catch (err) { console.error('Lỗi khi tải dữ liệu:', err); }
    };
    fetchData();
  }, [reload]);

  // Duyệt vé
  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Confirmed' : 'Completed';
    try {
      await axiosClient.put(`/api/bookings/${id}/status`, { status: newStatus });
      setReload(!reload);
    } catch (err) { 
      console.error(err);
      alert('Lỗi cập nhật!'); }
  };

  // Lưu Giá & Hệ số hạng vé
  const handleSavePricing = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        basePrice: editingFlight.basePrice,
        businessMultiplier: editingFlight.classMultipliers?.business || 2,
        premiumMultiplier: editingFlight.classMultipliers?.premium || 1.3
      };
      await axiosClient.put(`/api/flights/${editingFlight._id}/price`, payload);
      alert('Cập nhật Giá & Hạng vé thành công!');
      setEditingFlight(null);
      setReload(!reload);
    } catch (err) {
      console.error(err);
      alert('Lỗi cập nhật giá!');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-black text-gray-800 mb-8 border-l-4 border-blue-600 pl-4">Bảng Điều Khiển (Quản Trị)</h2>
        
        {/* DASHBOARD THỐNG KÊ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">Doanh thu thực tế</p>
            <p className="text-3xl font-black text-blue-600">{stats.revenue?.toLocaleString()} <span className="text-lg">đ</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">Tổng Đơn Đặt Vé</p>
            <p className="text-3xl font-black text-green-600">{stats.totalBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">Tổng Chuyến Bay</p>
            <p className="text-3xl font-black text-orange-600">{stats.totalFlights}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">Khách hàng</p>
            <p className="text-3xl font-black text-purple-600">{stats.totalUsers}</p>
          </div>
        </div>

        {/* ĐIỀU HƯỚNG TABS */}
        <div className="flex bg-white rounded-2xl shadow-sm mb-6 p-2 border border-gray-200 w-fit">
          <button onClick={() => setActiveTab('transactions')} className={`px-8 py-3 rounded-xl font-black transition ${activeTab === 'transactions' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            🧾 QUẢN LÝ GIAO DỊCH
          </button>
          <button onClick={() => setActiveTab('pricing')} className={`px-8 py-3 rounded-xl font-black transition ${activeTab === 'pricing' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
            ✈️ QUẢN LÝ GIÁ & HẠNG VÉ
          </button>
        </div>

        {/* TAB 1: QUẢN LÝ GIAO DỊCH (Giữ nguyên như cũ) */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
            <div className="p-6 bg-gray-800 text-white flex justify-between items-center">
              <span className="font-black text-lg uppercase tracking-wide">Danh sách Giao dịch</span>
              <span className="bg-gray-700 text-xs font-bold px-3 py-1 rounded-full">{bookings.length} giao dịch</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr><th className="p-4">Mã PNR</th><th className="p-4">Chuyến bay</th><th className="p-4">Khách hàng</th><th className="p-4">Tổng tiền</th><th className="p-4">Thanh toán</th><th className="p-4">Trạng thái</th><th className="p-4 text-center">Hành động</th></tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-black text-blue-600">{b.bookingCode}</td>
                      <td className="p-4 font-bold">{b.outboundFlight?.flightNumber || 'N/A'} {b.inboundFlight && <span className="text-[10px] text-green-600">+ Khứ hồi</span>}</td>
                      <td className="p-4 font-bold">{b.user?.fullName || 'Khách vãng lai'}</td>
                      <td className="p-4 font-black text-red-600">{b.totalAmount?.toLocaleString()} đ</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${b.paymentStatus === 'Paid' ? 'bg-green-500' : b.paymentStatus === 'Refunded' ? 'bg-purple-500' : 'bg-red-500'}`}>
                          {b.paymentStatus === 'Paid' ? 'Đã Thanh Toán' : b.paymentStatus === 'Refunded' ? 'Đã Hoàn Tiền' : 'Chưa Thanh Toán'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${b.bookingStatus === 'Confirmed' ? 'bg-blue-500' : b.bookingStatus === 'Cancelled' ? 'bg-gray-500' : 'bg-orange-500'}`}>
                          {b.bookingStatus === 'Confirmed' ? 'Đã Xác Nhận' : b.bookingStatus === 'Cancelled' ? 'Đã Hủy' : b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {b.bookingStatus === 'Pending' && <button onClick={() => handleUpdateStatus(b._id, b.bookingStatus)} className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition">Duyệt vé</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ GIÁ VÀ HẠNG VÉ */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
             <div className="p-6 bg-red-700 text-white flex justify-between items-center">
              <span className="font-black text-lg uppercase tracking-wide">Điều chỉnh Giá Cơ Bản & Hệ Số Hạng Vé</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="p-4">Chuyến bay</th>
                    <th className="p-4">Lịch trình</th>
                    <th className="p-4">Giá cơ bản (Phổ thông)</th>
                    <th className="p-4">Hệ số Đặc biệt</th>
                    <th className="p-4">Hệ số Thương gia</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map(f => (
                    <tr key={f._id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-black text-lg text-blue-900">{f.flightNumber}</div>
                        <div className="text-xs font-bold text-gray-500">{f.airline?.name}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-700">
                        {f.departureAirport?.code} ➔ {f.arrivalAirport?.code} <br/>
                        <span className="text-xs text-gray-400">{new Date(f.departureTime).toLocaleDateString('vi-VN')}</span>
                      </td>
                      
                      {/* NẾU ĐANG BẤM SỬA CHUYẾN NÀY, HIỆN FORM NHẬP LIỆU */}
                      {editingFlight?._id === f._id ? (
                        <td colSpan="4" className="p-4 bg-red-50">
                          <form onSubmit={handleSavePricing} className="flex items-center gap-4">
                            <div>
                              <label className="text-xs font-bold text-red-600 block mb-1">Giá cơ bản (VND)</label>
                              <input type="number" required className="border border-red-300 p-2 rounded-lg font-bold outline-none focus:ring-2 focus:ring-red-500 w-32" 
                                value={editingFlight.basePrice} onChange={e => setEditingFlight({...editingFlight, basePrice: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-red-600 block mb-1">Hệ số Đặc biệt (VD: 1.3)</label>
                              <input type="number" step="0.1" required className="border border-red-300 p-2 rounded-lg font-bold outline-none focus:ring-2 focus:ring-red-500 w-24" 
                                value={editingFlight.classMultipliers?.premium || 1.3} onChange={e => setEditingFlight({...editingFlight, classMultipliers: {...editingFlight.classMultipliers, premium: parseFloat(e.target.value)}})} />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-red-600 block mb-1">Hệ số Thương gia (VD: 2)</label>
                              <input type="number" step="0.1" required className="border border-red-300 p-2 rounded-lg font-bold outline-none focus:ring-2 focus:ring-red-500 w-24" 
                                value={editingFlight.classMultipliers?.business || 2.0} onChange={e => setEditingFlight({...editingFlight, classMultipliers: {...editingFlight.classMultipliers, business: parseFloat(e.target.value)}})} />
                            </div>
                            <div className="flex gap-2 mt-5">
                              <button type="submit" className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 shadow-md">LƯU LẠI</button>
                              <button type="button" onClick={() => setEditingFlight(null)} className="bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-lg hover:bg-gray-400">HỦY</button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        /* CHẾ ĐỘ XEM BÌNH THƯỜNG */
                        <>
                          <td className="p-4 font-black text-red-600 text-lg">{f.basePrice?.toLocaleString()} đ</td>
                          <td className="p-4 font-bold text-green-600">x {f.classMultipliers?.premium || 1.3}</td>
                          <td className="p-4 font-bold text-purple-600">x {f.classMultipliers?.business || 2.0}</td>
                          <td className="p-4 text-center">
                            <button onClick={() => setEditingFlight(f)} className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-white hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm">
                              ✏️ Điều chỉnh
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;