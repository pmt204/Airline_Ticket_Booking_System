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
    // Nếu chưa đăng nhập, đuổi về trang login
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
                
                {/* Header Card (Mã đặt chỗ & Trạng thái) */}
                <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-400">Mã đặt chỗ (PNR): </span>
                    <span className="font-black text-yellow-400 text-lg tracking-widest">{booking.bookingCode}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {booking.paymentStatus === 'Paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.bookingStatus === 'Confirmed' ? 'bg-blue-500' : booking.bookingStatus === 'Pending' ? 'bg-orange-500' : 'bg-gray-500'}`}>
                      {booking.bookingStatus === 'Confirmed' ? 'Đã Xác Nhận' : booking.bookingStatus}
                    </span>
                  </div>
                </div>

                {/* Body Card (Thông tin bay) */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  
                  {/* Cột trái: Giờ & Sân bay */}
                  <div className="flex-1 flex items-center justify-between w-full">
                    <div className="text-center">
                      <p className="text-3xl font-black text-gray-800">
                        {new Date(booking.flight?.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-sm font-bold text-gray-500">{booking.flight?.departureAirport?.code}</p>
                      <p className="text-xs text-gray-400">{new Date(booking.flight?.departureTime).toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-4">
                      <span className="text-xs font-bold text-gray-400 mb-1">{booking.flight?.airline?.name} ({booking.flight?.flightNumber})</span>
                      <div className="w-full border-b-2 border-dashed border-gray-300 relative">
                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-red-500">✈️</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">Bay thẳng</span>
                    </div>

                    <div className="text-center">
                      <p className="text-3xl font-black text-gray-800">
                        {new Date(booking.flight?.arrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-sm font-bold text-gray-500">{booking.flight?.arrivalAirport?.code}</p>
                      <p className="text-xs text-gray-400">{new Date(booking.flight?.arrivalTime).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  {/* Cột phải: Tiền & Hành khách */}
                  <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 text-center md:text-right w-full md:w-auto">
                    <p className="text-sm text-gray-500">Hành khách:</p>
                    <p className="font-bold text-gray-800 mb-2">{booking.passengers[0]?.lastName} {booking.passengers[0]?.firstName}</p>
                    <p className="text-sm text-gray-500">Tổng tiền:</p>
                    <p className="text-2xl font-black text-red-600">{booking.totalAmount?.toLocaleString()} VND</p>
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