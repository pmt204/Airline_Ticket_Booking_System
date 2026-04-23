import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const {
    isRoundTrip,
    flightId, seat, 
    outboundFlightId, inboundFlightId, outboundSeat, inboundSeat, 
    outboundFlight: passedOutFlight, inboundFlight: passedInFlight, 
    totalAmount: passedTotalAmount
  } = location.state || {};

  const [flight, setFlight] = useState(null); 
  const [passenger, setPassenger] = useState({ 
    firstName: '', 
    lastName: '', 
    email: user?.email || '', 
    phone: user?.phone || '' 
  });

  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isRoundTrip && !flightId) {
      alert('Vui lòng chọn chuyến bay trước!');
      navigate('/');
      return;
    }
    if (isRoundTrip && (!outboundFlightId || !inboundFlightId)) {
      alert('Lỗi dữ liệu khứ hồi, vui lòng đặt lại!');
      navigate('/');
      return;
    }

    if (!isRoundTrip && flightId) {
      const fetchFlight = async () => {
        try {
          const { data } = await axiosClient.get(`/api/flights/${flightId}`);
          setFlight(data);
        } catch (err) { console.error(err); }
      };
      fetchFlight();
    }
  }, [flightId, isRoundTrip, outboundFlightId, inboundFlightId, navigate]);

  const baseTotal = isRoundTrip ? passedTotalAmount : (flight?.basePrice || 0);
  const finalAmount = Math.max(0, baseTotal - discountAmount);

  const handleApplyVoucher = () => {
    if(voucherCode === 'SUMMER26') {
      setDiscountAmount(baseTotal * 0.2);
      alert('Áp dụng mã thành công! Bạn được giảm 20%');
    } else if(voucherCode === 'NEWBIE500') {
      setDiscountAmount(500000);
      alert('Áp dụng mã thành công! Bạn được giảm 500.000đ');
    } else {
      alert('Mã không hợp lệ hoặc đã hết hạn!');
      setDiscountAmount(0);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const bookingPayload = {
        userId: user?._id || null,
        outboundFlightId: isRoundTrip ? outboundFlightId : flightId, 
        inboundFlightId: isRoundTrip ? inboundFlightId : null,       
        passengers: [{
          ...passenger,
          outboundSeat: isRoundTrip ? outboundSeat : seat,
          inboundSeat: isRoundTrip ? inboundSeat : ''
        }],
        totalAmount: finalAmount
      };

      const bookingRes = await axiosClient.post('/api/bookings', bookingPayload);
      const savedBookingCode = bookingRes.data.bookingCode;

      const { data } = await axiosClient.post('/api/payment/create_payment_url', {
        amount: finalAmount,
        bookingCode: savedBookingCode
      });

      window.location.href = data.paymentUrl;

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Lỗi khởi tạo thanh toán. Ghế có thể đã bị người khác đặt!');
      setIsProcessing(false);
    }
  };

  if (!isRoundTrip && !flight) return <div className="text-center mt-20 text-xl font-bold">Đang tải dữ liệu thanh toán...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-red-600">
          <h2 className="text-2xl font-black mb-6 text-gray-800">👤 Thông tin hành khách</h2>
          <form className="grid grid-cols-2 gap-4" id="checkout-form" onSubmit={handlePayment}>
            <div>
              <label className="text-xs font-bold text-gray-500">Họ</label>
              <input type="text" required className="w-full border-b-2 p-2 outline-none focus:border-red-600 font-bold" placeholder="VD: NGUYEN" value={passenger.lastName} onChange={e=>setPassenger({...passenger, lastName:e.target.value.toUpperCase()})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Tên Đệm & Tên</label>
              <input type="text" required className="w-full border-b-2 p-2 outline-none focus:border-red-600 font-bold" placeholder="VD: VAN A" value={passenger.firstName} onChange={e=>setPassenger({...passenger, firstName:e.target.value.toUpperCase()})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Email nhận E-Ticket</label>
              <input type="email" required className="w-full border-b-2 p-2 outline-none focus:border-red-600 font-bold" value={passenger.email} onChange={e=>setPassenger({...passenger, email:e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Số điện thoại</label>
              <input type="tel" required className="w-full border-b-2 p-2 outline-none focus:border-red-600 font-bold" value={passenger.phone} onChange={e=>setPassenger({...passenger, phone:e.target.value})} />
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md h-fit border border-gray-100 sticky top-4">
        <h3 className="text-xl font-black text-gray-800 mb-4 border-b pb-2 uppercase text-center">Tóm tắt đơn hàng</h3>

        {isRoundTrip ? (
          <>
            <div className="mb-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 tracking-widest uppercase mb-1">🛫 Chuyến Đi</p>
              <p className="font-bold text-gray-800">{passedOutFlight?.departureAirport?.code} ➔ {passedOutFlight?.arrivalAirport?.code}</p>
              <p className="text-sm font-bold text-gray-600 mt-1">Ghế: <span className="text-red-600">{outboundSeat}</span></p>
            </div>
            <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 tracking-widest uppercase mb-1">🛬 Chuyến Về</p>
              <p className="font-bold text-gray-800">{passedInFlight?.departureAirport?.code} ➔ {passedInFlight?.arrivalAirport?.code}</p>
              <p className="text-sm font-bold text-gray-600 mt-1">Ghế: <span className="text-red-600">{inboundSeat}</span></p>
            </div>
          </>
        ) : (
          <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-1">✈️ Chuyến Bay</p>
            <p className="font-bold text-gray-800">{flight?.departureAirport?.code} ➔ {flight?.arrivalAirport?.code}</p>
            <p className="text-sm font-bold text-gray-600 mt-1">Ghế: <span className="text-red-600">{seat}</span></p>
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <input type="text" placeholder="Mã khuyến mãi..." className="w-full border p-2 rounded-lg text-sm uppercase font-bold focus:ring-2 focus:ring-red-500 outline-none" value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} />
          <button type="button" onClick={handleApplyVoucher} className="bg-gray-800 text-white px-4 rounded-lg text-sm font-bold hover:bg-black">ÁP DỤNG</button>
        </div>

        <div className="space-y-2 mb-4 text-sm font-bold text-gray-500">
          <div className="flex justify-between"><p>Giá vé cơ bản:</p><p>{baseTotal.toLocaleString()} đ</p></div>
          <div className="flex justify-between text-green-600"><p>Giảm giá:</p><p>- {discountAmount.toLocaleString()} đ</p></div>
        </div>

        <div className="mb-6 flex justify-between items-end border-t pt-4">
          <p className="text-gray-800 font-bold uppercase text-sm">Tổng thanh toán</p>
          <p className="text-3xl font-black text-red-600">{finalAmount.toLocaleString()} đ</p>
        </div>

        <button form="checkout-form" type="submit" disabled={isProcessing} className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-xl hover:bg-blue-800 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
          {isProcessing ? 'ĐANG CHUYỂN HƯỚNG...' : '💳 THANH TOÁN VNPAY'}
        </button>
      </div>

    </div>
  );
};

export default Checkout;