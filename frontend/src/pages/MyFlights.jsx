import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const MyFlights = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchMyBookings = async () => {
      try {
        const { data } = await axiosClient.get('/api/bookings/my-bookings');
        setBookings(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, [user, navigate]);

  const handleCancelBooking = async (bookingId) => {
    const isConfirm = window.confirm(
      "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn hủy chuyến bay này?\n\nHành động này không thể hoàn tác. Tiền sẽ được hoàn lại vào tài khoản trong 7-14 ngày làm việc theo chính sách."
    );
    if (!isConfirm) return;

    try {
      const { data } = await axiosClient.put(`/api/bookings/${bookingId}/cancel`);
      alert(data.message);
      
      setBookings(bookings.map(b => b._id === bookingId ? data.booking : b));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy vé!');
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold">Đang tải dữ liệu chuyến bay...</div>;

  return (
    <div className="bg-gray-50 min-h-[80vh] py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-black text-gray-800 mb-8 border-l-4 border-red-600 pl-4">✈️ Chuyến Bay Của Tôi</h2>

        {bookings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center border-t-4 border-yellow-400">
            <span className="text-6xl block mb-4">🧳</span>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Bạn chưa có chuyến bay nào!</h3>
            <p className="text-gray-500 mb-6">Hãy bắt đầu hành trình mới ngay hôm nay cùng FlightAir.</p>
            <Link to="/" className="bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-700 transition shadow-md">
              Đặt Vé Ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                
                <div className={`px-6 py-3 flex flex-col md:flex-row justify-between items-center ${booking.bookingStatus === 'Cancelled' ? 'bg-gray-300' : 'bg-gray-800 text-white'}`}>
                  <div className="mb-2 md:mb-0">
                    <span className={`text-sm ${booking.bookingStatus === 'Cancelled' ? 'text-gray-600' : 'text-gray-400'}`}>Mã đặt chỗ (PNR): </span>
                    <span className={`font-black text-lg tracking-widest ${booking.bookingStatus === 'Cancelled' ? 'text-gray-800 line-through' : 'text-yellow-400'}`}>
                      {booking.bookingCode}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${booking.paymentStatus === 'Paid' ? 'bg-green-500' : booking.paymentStatus === 'Refunded' ? 'bg-purple-500' : 'bg-red-500'}`}>
                      {booking.paymentStatus === 'Paid' ? 'Đã Thanh Toán' : booking.paymentStatus === 'Refunded' ? 'Đã Hoàn Tiền' : 'Chưa Thanh Toán'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${booking.bookingStatus === 'Confirmed' ? 'bg-blue-500' : booking.bookingStatus === 'Cancelled' ? 'bg-gray-600' : 'bg-orange-500'}`}>
                      {booking.bookingStatus === 'Confirmed' ? 'Đã Xác Nhận' : booking.bookingStatus === 'Cancelled' ? 'Đã Hủy' : booking.bookingStatus}
                    </span>
                  </div>
                </div>

                <div className={`p-6 flex flex-col md:flex-row gap-6 ${booking.bookingStatus === 'Cancelled' ? 'opacity-50 grayscale' : ''}`}>
                  
                  <div className="flex-1 space-y-4">
                    
                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <div className="w-full">
                        <p className="text-[10px] font-black text-blue-600 tracking-widest uppercase mb-2">🛫 Chiều Đi</p>
                        <div className="flex justify-between items-center">
                          <div className="text-center w-1/3">
                            <p className="text-2xl font-black text-gray-800">{new Date(booking.outboundFlight?.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="font-bold text-gray-500">{booking.outboundFlight?.departureAirport?.code}</p>
                          </div>
                          <div className="w-1/3 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 mb-1">{booking.outboundFlight?.flightNumber}</span>
                            <div className="w-full border-b-2 border-dashed border-gray-300 relative">
                              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-blue-400">✈️</span>
                            </div>
                          </div>
                          <div className="text-center w-1/3">
                            <p className="text-2xl font-black text-gray-800">{new Date(booking.outboundFlight?.arrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="font-bold text-gray-500">{booking.outboundFlight?.arrivalAirport?.code}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-center text-xs font-bold text-gray-500">
                          {new Date(booking.outboundFlight?.departureTime).toLocaleDateString('vi-VN')} • Ghế: <span className="text-red-600">{booking.passengers[0]?.outboundSeat || '--'}</span>
                        </div>
                      </div>
                    </div>

                    {booking.inboundFlight && (
                      <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="w-full">
                          <p className="text-[10px] font-black text-green-600 tracking-widest uppercase mb-2">🛬 Chiều Về</p>
                          <div className="flex justify-between items-center">
                            <div className="text-center w-1/3">
                              <p className="text-2xl font-black text-gray-800">{new Date(booking.inboundFlight?.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                              <p className="font-bold text-gray-500">{booking.inboundFlight?.departureAirport?.code}</p>
                            </div>
                            <div className="w-1/3 flex flex-col items-center">
                              <span className="text-[10px] font-bold text-gray-400 mb-1">{booking.inboundFlight?.flightNumber}</span>
                              <div className="w-full border-b-2 border-dashed border-gray-300 relative">
                                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-green-400">✈️</span>
                              </div>
                            </div>
                            <div className="text-center w-1/3">
                              <p className="text-2xl font-black text-gray-800">{new Date(booking.inboundFlight?.arrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                              <p className="font-bold text-gray-500">{booking.inboundFlight?.arrivalAirport?.code}</p>
                            </div>
                          </div>
                          <div className="mt-2 text-center text-xs font-bold text-gray-500">
                            {new Date(booking.inboundFlight?.departureTime).toLocaleDateString('vi-VN')} • Ghế: <span className="text-red-600">{booking.passengers[0]?.inboundSeat || '--'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="md:w-64 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-bold uppercase">Hành khách:</p>
                      <p className="font-black text-gray-800 mb-4">{booking.passengers[0]?.lastName} {booking.passengers[0]?.firstName}</p>
                      
                      <p className="text-sm text-gray-500 font-bold uppercase">Tổng tiền:</p>
                      <p className="text-2xl font-black text-red-600 mb-6">{booking.totalAmount?.toLocaleString()} đ</p>
                    </div>

                    {booking.bookingStatus !== 'Cancelled' && !booking.isCheckedIn && (
                      <button 
                        onClick={() => handleCancelBooking(booking._id)}
                        className="w-full bg-white border-2 border-red-500 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition shadow-sm"
                      >
                        ❌ HỦY CHUYẾN BAY
                      </button>
                    )}
                    
                    {booking.isCheckedIn && (
                       <div className="bg-green-100 text-green-700 text-center py-2 rounded-xl font-bold text-sm">
                         ✅ Đã Check-in
                       </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFlights;