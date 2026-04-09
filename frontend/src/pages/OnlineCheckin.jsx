import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';

const OnlineCheckin = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [boardingPass, setBoardingPass] = useState(null);

  const handleCheckin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await axiosClient.post('/api/bookings/checkin', { bookingCode, lastName });
      setBoardingPass(data.boardingPass);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print(); // Gọi lệnh in của trình duyệt
  };

  return (
    <div className="bg-gray-50 min-h-[85vh] py-12 flex justify-center items-center font-sans">
      
      {/* MÀN HÌNH 1: FORM NHẬP THÔNG TIN */}
      {!boardingPass ? (
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2">Làm Thủ Tục Trực Tuyến</h2>
            <p className="text-gray-500 text-sm">Tiết kiệm thời gian chờ đợi tại sân bay</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 font-bold p-4 mb-6 rounded-xl border border-red-100 text-center">{error}</div>}

          <form onSubmit={handleCheckin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mã Đặt Chỗ (PNR)</label>
              <input type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg uppercase tracking-widest text-blue-700" 
                value={bookingCode} onChange={(e) => setBookingCode(e.target.value.toUpperCase())} required placeholder="VD: VN-8A9X" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Họ Hành Khách</label>
              <input type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg uppercase" 
                value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="VD: NGUYEN" />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-black text-lg p-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform hover:-translate-y-1 mt-4 disabled:opacity-50">
              {isLoading ? 'ĐANG KIỂM TRA...' : 'LẤY THẺ LÊN MÁY BAY'}
            </button>
          </form>

          <div className="mt-8 bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
            <p className="font-bold mb-1">💡 Lưu ý:</p>
            <ul className="list-disc pl-5 space-y-1 text-blue-700">
              <li>Check-in trực tuyến mở từ 24h đến 2h trước chuyến bay.</li>
              <li>Vui lòng mang theo giấy tờ tùy thân hợp lệ.</li>
            </ul>
          </div>
        </div>
      ) : (
        
        /* MÀN HÌNH 2: BOARDING PASS (THẺ LÊN TÀU BAY) */
        <div className="w-full max-w-4xl px-4 animate-fade-in">
          <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-2xl font-black text-gray-800">Thẻ Lên Máy Bay Điện Tử</h2>
            <div className="flex gap-3">
              <button onClick={() => setBoardingPass(null)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">Quay lại</button>
              <button onClick={handlePrint} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-md">🖨️ In Thẻ (PDF)</button>
            </div>
          </div>

          {/* Giao diện Thẻ (Được thiết kế giống vé thật) */}
          <div id="boarding-pass" className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
            
            {/* Phần thân vé (Bên trái) */}
            <div className="flex-1 p-8 relative">
              {/* Header của vé */}
              <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-blue-900 italic tracking-tighter">VietTicket</h1>
                  <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Boarding Pass</p>
                </div>
                <img src={boardingPass.flight?.airline?.logoUrl} alt="Airline" className="h-10 mix-blend-multiply" onError={e => e.target.style.display='none'}/>
              </div>

              {/* Thông tin khách hàng */}
              <div className="flex justify-between mb-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Tên Hành Khách / Passenger Name</p>
                  <p className="text-xl font-black text-gray-800 uppercase">{boardingPass.passengers[0]?.lastName} {boardingPass.passengers[0]?.firstName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Mã Đặt Chỗ / PNR</p>
                  <p className="text-2xl font-black text-red-600 tracking-widest">{boardingPass.bookingCode}</p>
                </div>
              </div>

              {/* Hành trình */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
                <div className="w-1/3">
                  <p className="text-xs text-gray-500 uppercase font-bold">Từ / From</p>
                  <p className="text-4xl font-black text-gray-800">{boardingPass.flight?.departureAirport?.code}</p>
                  <p className="text-sm font-bold text-gray-500 truncate">{boardingPass.flight?.departureAirport?.city}</p>
                </div>
                <div className="w-1/3 flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-400 mb-2">Chuyến / Flight: <span className="text-gray-800">{boardingPass.flight?.flightNumber}</span></span>
                  <div className="w-full h-1 bg-gray-300 relative">
                     <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">✈️</span>
                  </div>
                </div>
                <div className="w-1/3 text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Đến / To</p>
                  <p className="text-4xl font-black text-gray-800">{boardingPass.flight?.arrivalAirport?.code}</p>
                  <p className="text-sm font-bold text-gray-500 truncate">{boardingPass.flight?.arrivalAirport?.city}</p>
                </div>
              </div>

              {/* Chi tiết Giờ bay & Ghế */}
              <div className="flex justify-between gap-4">
                <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Ngày / Date</p>
                  <p className="text-lg font-black text-gray-800">{new Date(boardingPass.flight?.departureTime).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Giờ lên máy bay / Boarding</p>
                  <p className="text-lg font-black text-red-600">
                     {new Date(new Date(boardingPass.flight?.departureTime).getTime() - 40*60000).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Ghế / Seat</p>
                  <p className="text-lg font-black text-gray-800">{boardingPass.passengers[0]?.seatNumber || '--'}</p>
                </div>
              </div>
            </div>

            {/* Phần xé vé (Bên phải) */}
            <div className="md:w-64 bg-gray-50 p-8 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative">
              {/* Nét cắt mô phỏng */}
              <div className="hidden md:block absolute -left-3 top-[-10px] w-6 h-6 bg-gray-50 rounded-full border-b border-gray-200"></div>
              <div className="hidden md:block absolute -left-3 bottom-[-10px] w-6 h-6 bg-gray-50 rounded-full border-t border-gray-200"></div>

              <p className="text-xs text-gray-500 uppercase font-bold mb-4 text-center">Quét mã để qua cổng</p>
              
              {/* API tạo mã QR miễn phí */}
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${boardingPass.bookingCode}_${boardingPass.flight?.flightNumber}`} alt="QR Code" className="w-32 h-32" />
              </div>
              
              <p className="mt-4 font-black text-xl text-gray-800 tracking-widest">{boardingPass.flight?.flightNumber}</p>
              <p className="text-xs text-gray-500 font-bold mt-1">Cổng / Gate: <span className="text-red-600 font-black text-lg">TBA</span></p>
            </div>
          </div>

          <style>{`@media print { .no-print { display: none !important; } body { background-color: white; } }`}</style>
        </div>
      )}
    </div>
  );
};

export default OnlineCheckin;