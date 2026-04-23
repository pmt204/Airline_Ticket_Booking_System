import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const BookingDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const { data } = await axiosClient.get(`/api/bookings/${id}`);
        setBooking(data);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết vé:', err);
        alert('Không tìm thấy thông tin đơn hàng!');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [id, navigate]);

  const handleCancelBooking = async () => {
    if (window.confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn hủy chuyến bay này?\n\nHành động này không thể hoàn tác. Tiền sẽ được hoàn lại vào tài khoản trong 7-14 ngày làm việc.")) {
      try {
        const { data } = await axiosClient.put(`/api/bookings/${id}/cancel`);
        alert(data.message);
        window.location.reload(); 
      } catch (err) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy vé!');
      }
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-gray-500">Đang tải thông tin vé...</div>;
  if (!booking) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="bg-white border border-gray-300 p-2 rounded-lg hover:bg-gray-100 transition">
            ⬅️ Quay lại
          </button>
          <h2 className="text-2xl font-black text-gray-800">Chi Tiết Đơn Đặt Vé</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gray-800 p-6 flex flex-col md:flex-row justify-between items-center text-white">
            <div>
              <p className="text-sm text-gray-400 font-bold mb-1 uppercase tracking-widest">Mã Đặt Chỗ (PNR)</p>
              <p className="text-3xl font-black text-yellow-400 tracking-widest">{booking.bookingCode}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
              <span className={`px-4 py-1 rounded-full text-sm font-bold shadow-sm ${booking.paymentStatus === 'Paid' ? 'bg-green-500 text-white' : booking.paymentStatus === 'Refunded' ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'}`}>
                {booking.paymentStatus === 'Paid' ? 'Đã Thanh Toán' : booking.paymentStatus === 'Refunded' ? 'Đã Hoàn Tiền' : 'Chưa Thanh Toán'}
              </span>
              <span className={`px-4 py-1 rounded-full text-sm font-bold shadow-sm ${booking.bookingStatus === 'Confirmed' ? 'bg-blue-500 text-white' : booking.bookingStatus === 'Completed' ? 'bg-indigo-600 text-white' : booking.bookingStatus === 'Cancelled' ? 'bg-gray-500 text-white' : 'bg-orange-500 text-white'}`}>
                {booking.bookingStatus === 'Confirmed' ? 'Đã Xác Nhận' : booking.bookingStatus === 'Completed' ? 'Đã Bay' : booking.bookingStatus === 'Cancelled' ? 'Đã Hủy' : booking.bookingStatus}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Hành Khách</p>
              <p className="text-lg font-black text-gray-800 uppercase">{booking.passengers[0]?.lastName} {booking.passengers[0]?.firstName}</p>
              <p className="text-sm font-bold text-gray-600">{booking.passengers[0]?.email} • {booking.passengers[0]?.phone}</p>
            </div>
            <div className="md:text-right">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tổng Thanh Toán</p>
              <p className="text-2xl font-black text-red-600">{booking.totalAmount?.toLocaleString()} đ</p>
              <p className="text-xs text-gray-400 mt-1">Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-black text-gray-800 mb-4 border-l-4 border-red-600 pl-3">Hành Trình Bay</h3>
        
        <div className={`space-y-6 ${booking.bookingStatus === 'Cancelled' ? 'opacity-50 grayscale' : ''}`}>
          
          {booking.outboundFlight && (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
                <span className="font-black text-blue-800 uppercase tracking-widest text-sm">🛫 CHIỀU ĐI</span>
                <span className="font-bold text-blue-600 text-sm">{new Date(booking.outboundFlight.departureTime).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center w-full md:w-1/3">
                  <p className="text-3xl font-black text-gray-800">{new Date(booking.outboundFlight.departureTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="font-bold text-gray-500">{booking.outboundFlight.departureAirport?.code}</p>
                  <p className="text-xs text-gray-400 truncate">{booking.outboundFlight.departureAirport?.city}</p>
                </div>
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <img src={booking.outboundFlight.airline?.logoUrl} alt="Logo" className="h-6 mb-2 mix-blend-multiply" onError={e => e.target.style.display='none'}/>
                  <span className="text-xs font-bold text-gray-400 mb-1">{booking.outboundFlight.flightNumber}</span>
                  <div className="w-full h-[2px] bg-gray-300 relative">
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500">✈️</span>
                  </div>
                </div>
                <div className="text-center w-full md:w-1/3">
                  <p className="text-3xl font-black text-gray-800">{new Date(booking.outboundFlight.arrivalTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="font-bold text-gray-500">{booking.outboundFlight.arrivalAirport?.code}</p>
                  <p className="text-xs text-gray-400 truncate">{booking.outboundFlight.arrivalAirport?.city}</p>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="font-bold text-gray-500">Ghế ngồi: <span className="text-red-600 font-black text-lg">{booking.passengers[0]?.outboundSeat || '--'}</span></span>
              </div>
            </div>
          )}

          {booking.inboundFlight && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
              <div className="bg-green-50 px-6 py-3 border-b border-green-100 flex justify-between items-center">
                <span className="font-black text-green-800 uppercase tracking-widest text-sm">🛬 CHIỀU VỀ</span>
                <span className="font-bold text-green-600 text-sm">{new Date(booking.inboundFlight.departureTime).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center w-full md:w-1/3">
                  <p className="text-3xl font-black text-gray-800">{new Date(booking.inboundFlight.departureTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="font-bold text-gray-500">{booking.inboundFlight.departureAirport?.code}</p>
                  <p className="text-xs text-gray-400 truncate">{booking.inboundFlight.departureAirport?.city}</p>
                </div>
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <img src={booking.inboundFlight.airline?.logoUrl} alt="Logo" className="h-6 mb-2 mix-blend-multiply" onError={e => e.target.style.display='none'}/>
                  <span className="text-xs font-bold text-gray-400 mb-1">{booking.inboundFlight.flightNumber}</span>
                  <div className="w-full h-[2px] bg-gray-300 relative">
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500">✈️</span>
                  </div>
                </div>
                <div className="text-center w-full md:w-1/3">
                  <p className="text-3xl font-black text-gray-800">{new Date(booking.inboundFlight.arrivalTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="font-bold text-gray-500">{booking.inboundFlight.arrivalAirport?.code}</p>
                  <p className="text-xs text-gray-400 truncate">{booking.inboundFlight.arrivalAirport?.city}</p>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="font-bold text-gray-500">Ghế ngồi: <span className="text-red-600 font-black text-lg">{booking.passengers[0]?.inboundSeat || '--'}</span></span>
              </div>
            </div>
          )}

        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-end gap-4">
          {booking.bookingStatus === 'Confirmed' && !booking.isCheckedIn && (
            <button onClick={() => navigate('/checkin')} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 shadow-md">
              Làm thủ tục Online (Check-in)
            </button>
          )}

          {booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Completed' && !booking.isCheckedIn && (
            <button onClick={handleCancelBooking} className="bg-white border-2 border-red-500 text-red-600 font-bold px-8 py-3 rounded-xl hover:bg-red-50 shadow-sm">
              ❌ Hủy Chuyến Bay
            </button>
          )}

          {booking.isCheckedIn && booking.bookingStatus !== 'Cancelled' && (
             <div className="bg-green-100 text-green-700 px-8 py-3 rounded-xl font-black text-center shadow-sm">
               ✅ Đã Check-in thành công
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookingDetails;