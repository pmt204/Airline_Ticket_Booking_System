import { useState } from 'react';
import axiosClient from '../api/axiosClient';

const Checkout = () => {
  // Vì làm độc lập, ta giả lập dữ liệu truyền từ trang Chọn ghế (TV2) sang đây
  const mockFlightId = "66123abc456def7890123456"; // Điền 1 ID chuyến bay thật trong DB của bạn vào đây
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: E-Ticket
  const [bookingId, setBookingId] = useState(null);
  const [ticketData, setTicketData] = useState(null);

  const [formData, setFormData] = useState({
    firstName: 'Thành', lastName: 'Phạm', email: 'thanh@gmail.com', seat: '12A'
  });

  // Chức năng 1: Tạo Đơn
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      // Gọi API nhưng bỏ qua lỗi báo đỏ nếu thiếu DB (để test UI)
      const res = await axiosClient.post('/api/bookings', {
        flightId: mockFlightId, seatNumber: formData.seat, totalAmount: 1500000,
        passengers: [{ firstName: formData.firstName, lastName: formData.lastName, passportNumber: '123456789' }]
      });
      setBookingId(res.data._id);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Lỗi tạo đơn (Kiểm tra lại ID chuyến bay). Tạm chuyển sang test giao diện Thanh toán!');
      setBookingId("mock-booking-id"); setStep(2); // Dành cho test UI
    }
  };

  // Chức năng 2 & 6 & 7: Thanh toán, Gửi Mail & Lấy Vé
  const handlePayment = async () => {
    try {
      if(bookingId !== "mock-booking-id") await axiosClient.post(`/api/bookings/${bookingId}/pay`);
      alert('Thanh toán thành công! Đã gửi Email xác nhận.');
      
      // Chức năng 7: Lấy E-Ticket
      if(bookingId !== "mock-booking-id") {
        const ticketRes = await axiosClient.get(`/api/bookings/${bookingId}/ticket`);
        setTicketData(ticketRes.data);
      } else {
        setTicketData({ bookingCode: 'VN-MOCK', totalAmount: 1500000, paymentStatus: 'Paid' });
      }
      setStep(3);
    } catch (err) { console.error(err); alert('Lỗi thanh toán'); }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10">
      {/* BƯỚC 1: ĐIỀN THÔNG TIN */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-primary">Bước 1: Thông tin hành khách</h2>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="flex gap-4">
              <input type="text" placeholder="Họ" className="border p-2 w-full rounded" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required/>
              <input type="text" placeholder="Tên" className="border p-2 w-full rounded" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required/>
            </div>
            <input type="email" placeholder="Email nhận vé" className="border p-2 w-full rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required/>
            <button type="submit" className="w-full bg-secondary text-white font-bold py-3 rounded hover:bg-orange-600">Tiếp tục thanh toán</button>
          </form>
        </div>
      )}

      {/* BƯỚC 2: THANH TOÁN */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-primary">Bước 2: Thanh toán an toàn</h2>
          <div className="bg-gray-100 p-6 rounded mb-6">
            <p className="text-xl">Tổng tiền cần thanh toán:</p>
            <p className="text-3xl font-bold text-secondary mt-2">1,500,000 VND</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={handlePayment} className="bg-blue-600 text-white font-bold px-8 py-3 rounded flex items-center gap-2 hover:bg-blue-800">
               💳 Thanh toán thẻ / VNPay
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 3: XUẤT VÉ ĐIỆN TỬ (E-TICKET) */}
      {step === 3 && ticketData && (
        <div className="bg-white p-8 rounded-lg shadow-md border-t-8 border-green-500">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-green-600">🎉 Đặt vé thành công!</h2>
            <p className="text-gray-500">Vé điện tử đã được gửi tới email của bạn.</p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 p-6 rounded bg-blue-50 relative">
            <div className="absolute top-2 right-4 font-bold text-xl text-gray-300">BOARDING PASS</div>
            <p className="text-sm text-gray-500 uppercase">Mã đặt chỗ</p>
            <p className="text-4xl font-black text-primary mb-4">{ticketData.bookingCode}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Hành khách</p><p className="font-bold text-lg">{formData.lastName} {formData.firstName}</p></div>
              <div><p className="text-xs text-gray-500">Ghế</p><p className="font-bold text-lg">{formData.seat}</p></div>
              <div><p className="text-xs text-gray-500">Trạng thái TT</p><p className="font-bold text-green-600">ĐÃ THANH TOÁN</p></div>
            </div>
          </div>
          
          <button onClick={() => window.print()} className="mt-6 w-full bg-gray-800 text-white font-bold py-3 rounded hover:bg-black">
            🖨️ In Vé Điện Tử (PDF)
          </button>
        </div>
      )}
    </div>
  );
};
export default Checkout;