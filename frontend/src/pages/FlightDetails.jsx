import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const FlightDetails = () => {
  const { id } = useParams(); // Lấy ID chuyến bay từ URL
  const navigate = useNavigate();
  
  const [flight, setFlight] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(''); // Ghế đang chọn

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [flightRes, seatsRes] = await Promise.all([
          axiosClient.get(`/api/flights/${id}`),
          axiosClient.get(`/api/flights/${id}/seats`)
        ]);
        setFlight(flightRes.data);
        setSeatMap(seatsRes.data);
      } catch (err) {
        console.error(err);
        alert('Không thể tải chi tiết chuyến bay');
      }
    };
    fetchDetails();
  }, [id]);

  if (!flight || !seatMap) return <div className="text-center mt-20 text-xl font-bold">Đang tải dữ liệu...</div>;

  // Thuật toán vẽ Sơ đồ ghế (Giả sử máy bay có 6 ghế/hàng: A B C - D E F)
  const renderSeats = () => {
    const totalRows = Math.ceil(seatMap.seatCapacity / 6);
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    let grid = [];

    for (let row = 1; row <= totalRows; row++) {
      let rowSeats = columns.map(col => {
        const seatId = `${row}${col}`;
        const isBooked = seatMap.bookedSeats.includes(seatId);
        const isSelected = selectedSeat === seatId;

        // Xác định màu sắc của ghế
        let seatClass = "w-10 h-10 rounded border-2 font-bold text-xs flex items-center justify-center cursor-pointer transition ";
        if (isBooked) {
          seatClass += "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"; // Đã đặt
        } else if (isSelected) {
          seatClass += "bg-secondary border-orange-600 text-white"; // Đang chọn
        } else {
          seatClass += "bg-white border-primary text-primary hover:bg-blue-100"; // Trống
        }

        return (
          <button 
            key={seatId} 
            disabled={isBooked} 
            onClick={() => setSelectedSeat(seatId)}
            className={seatClass}
          >
            {seatId}
          </button>
        );
      });

      // Tạo đường đi ở giữa (Giữa ghế C và D)
      grid.push(
        <div key={`row-${row}`} className="flex justify-center gap-2 mb-2">
          <div className="flex gap-2">{rowSeats.slice(0, 3)}</div>
          <div className="w-8 text-center text-gray-400 flex items-center justify-center font-bold text-sm">{row}</div>
          <div className="flex gap-2">{rowSeats.slice(3, 6)}</div>
        </div>
      );
    }
    return grid;
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      alert('Vui lòng chọn 1 chỗ ngồi trên sơ đồ!');
      return;
    }
    // Sau này Nhóm trưởng làm trang Checkout, sẽ truyền Data này đi
    alert(`Bạn đã chọn ghế ${selectedSeat}. Chuyển sang bước Thanh Toán (Sắp ra mắt)...`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* CỘT TRÁI: SƠ ĐỒ CHỖ NGỒI */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-primary mb-2">Chọn chỗ ngồi</h2>
        <div className="flex gap-4 mb-6 text-sm">
          <div className="flex items-center gap-1"><div className="w-4 h-4 border-2 border-primary bg-white"></div> Trống</div>
          <div className="flex items-center gap-1"><div className="w-4 h-4 border-2 border-orange-600 bg-secondary"></div> Đang chọn</div>
          <div className="flex items-center gap-1"><div className="w-4 h-4 border-2 border-gray-400 bg-gray-300"></div> Đã bán</div>
        </div>

        {/* Khung máy bay */}
        <div className="bg-gray-100 p-8 rounded-t-full border-4 border-gray-300 max-w-md mx-auto">
          <div className="text-center text-gray-400 mb-8 font-bold text-xl">Buồng lái</div>
          {renderSeats()}
        </div>
      </div>

      {/* CỘT PHẢI: THÔNG TIN VÉ */}
      <div className="bg-white p-6 rounded-lg shadow-md h-fit">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Thông tin chuyến bay</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500">Chuyến bay</p>
          <p className="font-bold text-lg">{flight.airline?.name} - {flight.flightNumber}</p>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <div>
            <p className="font-bold text-xl">{new Date(flight.departureTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
            <p className="text-sm text-gray-500">{flight.departureAirport?.city}</p>
          </div>
          <div>✈️</div>
          <div className="text-right">
            <p className="font-bold text-xl">{new Date(flight.arrivalTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
            <p className="text-sm text-gray-500">{flight.arrivalAirport?.city}</p>
          </div>
        </div>

        <div className="mb-6 bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600 mb-1">Ghế đã chọn:</p>
          <p className="text-2xl font-bold text-primary">{selectedSeat || 'Chưa chọn'}</p>
        </div>

        <div className="mb-6 flex justify-between items-end border-t pt-4">
          <p className="text-gray-600 font-bold">Tổng tiền:</p>
          <p className="text-2xl font-bold text-secondary">{flight.basePrice?.toLocaleString()} VND</p>
        </div>

        <button 
          onClick={handleContinue}
          className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
        >
          Tiếp tục thanh toán
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full mt-2 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Quay lại tìm kiếm
        </button>
      </div>

    </div>
  );
};

export default FlightDetails;