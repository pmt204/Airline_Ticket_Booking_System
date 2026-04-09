import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [flight, setFlight] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState('');

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
        alert('Không thể tải chi tiết chuyến bay'); }
    };
    fetchDetails();
  }, [id]);

  if (!flight || !seatMap) return <div className="text-center mt-20 text-xl font-bold">Đang tải dữ liệu chuyến bay...</div>;

  const renderSeats = () => {
    const totalRows = Math.ceil(seatMap.seatCapacity / 6);
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    let grid = [];

    for (let row = 1; row <= totalRows; row++) {
      let rowSeats = columns.map(col => {
        const seatId = `${row}${col}`;
        const isBooked = seatMap.bookedSeats.includes(seatId);
        const isSelected = selectedSeat === seatId;

        let seatClass = "w-10 h-10 rounded-t-lg rounded-b-sm border-2 font-bold text-xs flex items-center justify-center cursor-pointer transition-all duration-200 ";
        if (isBooked) {
          seatClass += "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"; 
        } else if (isSelected) {
          seatClass += "bg-green-500 border-green-600 text-white shadow-md transform scale-110"; 
        } else {
          seatClass += "bg-white border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400"; 
        }

        return (
          <button key={seatId} disabled={isBooked} onClick={() => setSelectedSeat(seatId)} className={seatClass}>
            {seatId}
          </button>
        );
      });

      grid.push(
        <div key={`row-${row}`} className="flex justify-center gap-4 mb-3 items-center group">
          <div className="flex gap-2">{rowSeats.slice(0, 3)}</div>
          <div className="w-6 text-center text-gray-300 font-bold text-xs bg-gray-50 rounded-full h-6 flex items-center justify-center">{row}</div>
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
    navigate('/checkout', { state: { flightId: id, seat: selectedSeat } });
  };

  return (
    <div className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: SƠ ĐỒ CHỖ NGỒI (UI Tàu bay) */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-800 border-l-4 border-blue-600 pl-3">Chọn chỗ ngồi</h2>
            <div className="flex gap-4 text-xs font-bold text-gray-600">
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded border-2 border-blue-200 bg-white"></div> Trống</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded border-2 border-green-600 bg-green-500"></div> Đang chọn</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded border-2 border-gray-300 bg-gray-200"></div> Đã bán</div>
            </div>
          </div>

          {/* VẼ MÁY BAY */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 max-w-lg mx-auto overflow-hidden relative">
            {/* Mũi máy bay */}
            <div className="h-32 bg-gray-100 rounded-t-[100px] border-b-4 border-gray-200 flex items-center justify-center relative">
              <div className="w-16 h-8 bg-gray-300 rounded-full opacity-50 absolute top-8"></div>
              <span className="font-black text-gray-400 mt-10 tracking-widest">BUỒNG LÁI</span>
            </div>
            
            {/* Khoang hành khách */}
            <div className="p-8 bg-white relative">
              {/* Cửa sổ máy bay (Decor) */}
              <div className="absolute left-3 top-0 bottom-0 w-2 flex flex-col gap-10 py-10">
                {[...Array(10)].map((_, i) => <div key={`wL${i}`} className="w-2 h-4 bg-blue-50 rounded-full"></div>)}
              </div>
              <div className="absolute right-3 top-0 bottom-0 w-2 flex flex-col gap-10 py-10">
                {[...Array(10)].map((_, i) => <div key={`wR${i}`} className="w-2 h-4 bg-blue-50 rounded-full"></div>)}
              </div>

              {renderSeats()}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BILL THANH TOÁN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 sticky top-4">
            <h3 className="text-lg font-black text-gray-800 mb-6 pb-4 border-b-2 border-dashed border-gray-200 uppercase tracking-wider text-center">Thông tin chuyến bay</h3>
            
            <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
              <img src={flight.airline?.logoUrl} alt="Logo" className="h-8 mx-auto mb-2 mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
              <p className="font-black text-blue-900 text-lg">{flight.airline?.name}</p>
              <p className="text-sm font-bold text-gray-500 bg-white inline-block px-3 py-1 rounded-full mt-1 shadow-sm">Chuyến: {flight.flightNumber}</p>
            </div>
            
            <div className="mb-6 relative flex justify-between items-center px-2">
              <div className="text-center w-1/3">
                <p className="text-2xl font-black text-gray-800">{new Date(flight.departureTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                <p className="font-bold text-gray-500">{flight.departureAirport?.code}</p>
              </div>
              <div className="w-1/3 flex flex-col items-center">
                <p className="text-[10px] font-bold text-gray-400 mb-1">BAY THẲNG</p>
                <div className="w-full h-[2px] bg-gray-300 relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500">✈️</div>
                </div>
              </div>
              <div className="text-center w-1/3">
                <p className="text-2xl font-black text-gray-800">{new Date(flight.arrivalTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                <p className="font-bold text-gray-500">{flight.arrivalAirport?.code}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex justify-between items-center">
              <span className="font-bold text-gray-600">Ghế đã chọn:</span>
              <span className="text-3xl font-black text-blue-600">{selectedSeat || '--'}</span>
            </div>

            <div className="mb-6 flex justify-between items-end border-t border-gray-200 pt-6">
              <p className="text-gray-500 font-bold">Tổng tiền:</p>
              <p className="text-3xl font-black text-red-600">{flight.basePrice?.toLocaleString()} đ</p>
            </div>

            <button onClick={handleContinue} className="w-full bg-red-600 text-white font-black text-lg py-4 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 mb-3">
              XÁC NHẬN CHỖ NGỒI
            </button>
            <button onClick={() => navigate('/')} className="w-full bg-white text-gray-500 border border-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
              Quay lại tìm kiếm
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FlightDetails;