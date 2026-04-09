import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext'; 


const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dữ liệu truyền từ trang FlightDetails sang (gồm ID chuyến và ghế đã chọn)
  const { flightId, seat } = location.state || {};
  
  const [flight, setFlight] = useState(null);
  const [passenger, setPassenger] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  
  // States cho Voucher và Tiền
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!flightId) {
      alert('Vui lòng chọn chuyến bay trước!');
      navigate('/');
      return;
    }
    const fetchFlight = async () => {
      try {
        const { data } = await axiosClient.get(`/api/flights/${flightId}`);
        setFlight(data);
      } catch (err) { console.error(err); }
    };
    fetchFlight();
  }, [flightId, navigate]);

  // HÀM ÁP DỤNG VOUCHER
  const handleApplyVoucher = async () => {
    // Để đơn giản (trong đồ án), ta giả lập check mã. Nếu thực tế, bạn gọi API `/api/vouchers/check`
    if(voucherCode === 'SUMMER26') {
      setDiscountAmount(flight.basePrice * 0.2); // Giảm 20%
      alert('Áp dụng mã thành công! Bạn được giảm 20%');
    } else if(voucherCode === 'NEWBIE500') {
      setDiscountAmount(500000); // Giảm cứng 500k
      alert('Áp dụng mã thành công! Bạn được giảm 500.000đ');
    } else {
      alert('Mã không hợp lệ hoặc đã hết hạn!');
      setDiscountAmount(0);
    }
  };

  // Tính tổng tiền sau khi giảm
  const totalAmount = flight ? Math.max(0, flight.basePrice - discountAmount) : 0;

  // HÀM GỌI THANH TOÁN VNPAY
  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // 1. TẠO BOOKING VÀO DATABASE (Trạng thái Pending)
      const bookingRes = await axiosClient.post('/api/bookings', {
        flightId: flight._id,
        userId: user?._id,
        seatNumber: seat,
        passengers: [{ ...passenger, seatNumber: seat }],
        totalAmount: totalAmount
      });
      
      const savedBookingCode = bookingRes.data.bookingCode;

      // 2. XIN LINK VNPAY CHO BOOKING ĐÓ
      const { data } = await axiosClient.post('/api/payment/create_payment_url', {
        amount: totalAmount,
        bookingCode: savedBookingCode // Truyền đúng mã vừa tạo ở DB sang
      });

      // 3. ĐÁ VĂNG SANG VNPAY
      window.location.href = data.paymentUrl;

    } catch (error) {
      console.error(error);
      alert('Lỗi khởi tạo thanh toán. Ghế có thể đã bị đặt!');
      setIsProcessing(false);
    }
  };

  if (!flight) return <div className="text-center mt-20 text-xl font-bold">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* KHỐI 1: FORM HÀNH KHÁCH */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-red-600">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">👤 Thông tin hành khách</h2>
          <form className="grid grid-cols-2 gap-4" id="checkout-form" onSubmit={handlePayment}>
            <div>
              <label className="text-xs font-bold text-gray-500">Họ</label>
              <input type="text" required className="w-full border-b-2 p-2 outline-none focus:border-red-600 font-semibold" value={passenger.lastName} onChange={e=>setPassenger({...passenger, lastName:e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Tên Đệm & Tên</label>
              <input type="text" required className="w-full border-b-2 p-2 outline-none focus:border-red-600 font-semibold" value={passenger.firstName} onChange={e=>setPassenger({...passenger, firstName:e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Email nhận vé</label>
              <input type="email" required className="w-full border-b-2 p-2 outline-none focus:border-red-600 font-semibold" value={passenger.email} onChange={e=>setPassenger({...passenger, email:e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Số điện thoại</label>
              <input type="tel" required className="w-full border-b-2 p-2 outline-none focus:border-red-600 font-semibold" value={passenger.phone} onChange={e=>setPassenger({...passenger, phone:e.target.value})} />
            </div>
          </form>
        </div>
      </div>

      {/* KHỐI 2: TÓM TẮT & THANH TOÁN */}
      <div className="bg-white p-6 rounded-xl shadow-md h-fit border border-gray-100 sticky top-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Tóm tắt chuyến bay</h3>
        
        <div className="mb-4">
          <p className="font-bold">{flight.airline?.name} - {flight.flightNumber}</p>
          <p className="text-sm text-gray-500">{flight.departureAirport?.city} ➔ {flight.arrivalAirport?.city}</p>
        </div>
        
        <div className="mb-4 bg-gray-50 p-3 rounded border border-dashed border-gray-300">
          <p className="text-sm text-gray-600">Ghế của bạn:</p>
          <p className="text-2xl font-black text-blue-600">{seat}</p>
        </div>

        {/* NHẬP VOUCHER */}
        <div className="mb-6 flex gap-2">
          <input 
            type="text" 
            placeholder="Nhập mã khuyến mãi..." 
            className="w-full border p-2 rounded text-sm uppercase font-bold text-red-600" 
            value={voucherCode} 
            onChange={e => setVoucherCode(e.target.value.toUpperCase())}
          />
          <button type="button" onClick={handleApplyVoucher} className="bg-gray-800 text-white px-4 rounded text-sm font-bold hover:bg-black">ÁP DỤNG</button>
        </div>

        <div className="space-y-2 mb-4 text-sm font-semibold text-gray-600">
          <div className="flex justify-between"><p>Giá vé cơ bản:</p><p>{flight.basePrice.toLocaleString()} đ</p></div>
          <div className="flex justify-between text-green-600"><p>Giảm giá:</p><p>- {discountAmount.toLocaleString()} đ</p></div>
        </div>

        <div className="mb-6 flex justify-between items-end border-t pt-4">
          <p className="text-gray-800 font-bold">TỔNG CỘNG:</p>
          <p className="text-3xl font-black text-red-600">{totalAmount.toLocaleString()} đ</p>
        </div>

        <button 
          form="checkout-form"
          type="submit" 
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-xl hover:bg-blue-800 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isProcessing ? 'ĐANG CHUYỂN HƯỚNG...' : '💳 THANH TOÁN VNPAY'}
        </button>
        
        <div className="mt-4 text-center">
          <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="VNPay Logo" className="h-6 mx-auto opacity-70" />
        </div>
      </div>

    </div>
  );
};

export default Checkout;