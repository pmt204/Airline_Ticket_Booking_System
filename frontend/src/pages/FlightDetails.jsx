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
        alert('Không thể tải chi tiết chuyến bay'); 
      }
    };
    fetchDetails();
  }, [id]);

  if (!flight || !seatMap) return <div className="text-center mt-20 text-xl font-bold">Đang tải thiết kế tàu bay...</div>;

  const getSeatInfo = (seatId) => {
    if (!seatId) return { name: '', price: 0, color: '' };
    const row = parseInt(seatId);
    const basePrice = flight.basePrice;
    
    const bizMulti = flight.classMultipliers?.business || 2.0;
    const premMulti = flight.classMultipliers?.premium || 1.3;

    if (row <= 2) {
      return { name: 'Thương gia', price: basePrice * bizMulti, color: 'border-purple-500 text-purple-700 bg-purple-50' };
    } else if (row <= 5) {
      return { name: 'Phổ thông Đặc biệt', price: basePrice * premMulti, color: 'border-green-500 text-green-700 bg-green-50' };
    } else {
      return { name: 'Phổ thông', price: basePrice, color: 'border-blue-300 text-blue-700 bg-white' };
    }
  };

  const renderSeats = () => {
    const totalRows = Math.ceil(seatMap.seatCapacity / 6);
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    let grid = [];

    for (let row = 1; row <= totalRows; row++) {
      let rowSeats = columns.map(col => {
        const seatId = `${row}${col}`;
        const isBooked = seatMap.bookedSeats.includes(seatId);
        const isSelected = selectedSeat === seatId;
        const seatInfo = getSeatInfo(seatId);

        let seatClass = "w-10 h-10 rounded-t-lg rounded-b-sm border-2 font-bold text-xs flex items-center justify-center cursor-pointer transition-all duration-200 ";
        
        if (isBooked) {
          seatClass += "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"; 
        } else if (isSelected) {
          seatClass += "bg-red-600 border-red-700 text-white shadow-lg transform scale-110"; 
        } else {
          seatClass += `${seatInfo.color} hover:shadow-md hover:scale-105`; 
        }

        return (
          <button key={seatId} disabled={isBooked} onClick={() => setSelectedSeat(seatId)} className={seatClass} title={`${seatInfo.name} - ${seatInfo.price.toLocaleString()}đ`}>
            {seatId}
          </button>
        );
      });

      if (row === 3 || row === 6) {
        grid.push(
          <div key={`divider-${row}`} className="flex items-center justify-center my-4 w-full">
            <div className="w-1/3 border-t-2 border-dashed border-gray-300"></div>
            <span className="mx-4 text-xs font-bold text-gray-400 tracking-widest uppercase">
              {row === 3 ? 'Phổ thông Đặc biệt' : 'Phổ thông'}
            </span>
            <div className="w-1/3 border-t-2 border-dashed border-gray-300"></div>
          </div>
        );
      }

      grid.push(
        <div key={`row-${row}`} className="flex justify-center gap-4 mb-3 items-center group">
          <div className="flex gap-2">{rowSeats.slice(0, 3)}</div>
          <div className="w-6 text-center text-gray-400 font-bold text-xs bg-gray-100 rounded-full h-6 flex items-center justify-center">{row}</div>
          <div className="flex gap-2">{rowSeats.slice(3, 6)}</div>
        </div>
      );
    }
    return grid;
  };

  const handleContinue = () => {
    if (!selectedSeat) return alert('Vui lòng chọn 1 chỗ ngồi trên sơ đồ!');
    const finalPrice = getSeatInfo(selectedSeat).price;
    
    navigate('/checkout', { 
      state: { 
        flightId: id, 
        seat: selectedSeat,
        totalAmount: finalPrice 
      } 
    });
  };

  const currentSeatInfo = getSeatInfo(selectedSeat);

  return (
    <div className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-black text-gray-800 border-l-4 border-blue-600 pl-3">Sơ đồ máy bay</h2>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-600">
              <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-50"></div> Thương gia</div>
              <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50"></div> Đặc biệt</div>
              <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-blue-300 bg-white"></div> Phổ thông</div>
              <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-gray-300 bg-gray-200"></div> Đã bán</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 max-w-lg mx-auto overflow-hidden relative">
            <div className="h-24 bg-gray-100 rounded-t-[100px] border-b-4 border-gray-200 flex items-center justify-center">
              <span className="font-black text-gray-400 mt-6 tracking-widest uppercase">Khoang Thương Gia</span>
            </div>
            <div className="p-8 bg-white">
              {renderSeats()}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 sticky top-4">
            <h3 className="text-lg font-black text-gray-800 mb-6 pb-4 border-b-2 border-dashed uppercase text-center">Tóm tắt chuyến bay</h3>
            
            <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
              <img src={flight.airline?.logoUrl} alt="Logo" className="h-8 mx-auto mb-2 mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
              <p className="font-black text-blue-900 text-lg">{flight.airline?.name}</p>
              <p className="text-sm font-bold text-gray-500 bg-white inline-block px-3 py-1 rounded-full mt-1">Chuyến: {flight.flightNumber}</p>
            </div>
            
            <div className="mb-6 flex justify-between items-center px-2">
              <div className="text-center w-1/3">
                <p className="text-2xl font-black text-gray-800">{new Date(flight.departureTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                <p className="font-bold text-gray-500">{flight.departureAirport?.code}</p>
              </div>
              <div className="w-1/3 flex flex-col items-center">
                <div className="w-full h-[2px] bg-gray-300 relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500">✈️</div>
                </div>
              </div>
              <div className="text-center w-1/3">
                <p className="text-2xl font-black text-gray-800">{new Date(flight.arrivalTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</p>
                <p className="font-bold text-gray-500">{flight.arrivalAirport?.code}</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border mb-6 transition-colors ${selectedSeat ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-600">Vị trí ghế:</span>
                <span className="text-2xl font-black text-red-600">{selectedSeat || '--'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-600">Hạng vé:</span>
                <span className={`font-black ${selectedSeat ? 'text-blue-700' : 'text-gray-400'}`}>
                  {currentSeatInfo.name || 'Chưa chọn'}
                </span>
              </div>
            </div>

            <div className="mb-6 flex justify-between items-end border-t border-gray-200 pt-6">
              <p className="text-gray-500 font-bold">Tổng tiền:</p>
              <p className="text-3xl font-black text-red-600">
                {selectedSeat ? currentSeatInfo.price.toLocaleString() : flight.basePrice.toLocaleString()} đ
              </p>
            </div>

            <button onClick={handleContinue} className="w-full bg-red-600 text-white font-black text-lg py-4 rounded-xl hover:bg-red-700 transition shadow-lg mb-3">
              XÁC NHẬN & THANH TOÁN
            </button>
            <button onClick={() => navigate(-1)} className="w-full bg-white text-gray-500 border border-gray-300 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
              Quay lại
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FlightDetails;