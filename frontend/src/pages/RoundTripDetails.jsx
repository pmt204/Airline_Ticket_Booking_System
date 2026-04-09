import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const RoundTripDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const outboundId = searchParams.get('outbound');
  const inboundId = searchParams.get('inbound');

  const [outboundFlight, setOutboundFlight] = useState(null);
  const [outboundSeatMap, setOutboundSeatMap] = useState(null);
  const [selectedOutboundSeat, setSelectedOutboundSeat] = useState('');

  const [inboundFlight, setInboundFlight] = useState(null);
  const [inboundSeatMap, setInboundSeatMap] = useState(null);
  const [selectedInboundSeat, setSelectedInboundSeat] = useState('');

  const [activeTab, setActiveTab] = useState('outbound'); 

  useEffect(() => {
    if (!outboundId || !inboundId) {
      alert("Dữ liệu chuyến bay không hợp lệ!");
      navigate('/');
      return;
    }

    const fetchBothFlights = async () => {
      try {
        const [outF, outS, inF, inS] = await Promise.all([
          axiosClient.get(`/api/flights/${outboundId}`),
          axiosClient.get(`/api/flights/${outboundId}/seats`),
          axiosClient.get(`/api/flights/${inboundId}`),
          axiosClient.get(`/api/flights/${inboundId}/seats`)
        ]);
        setOutboundFlight(outF.data);
        setOutboundSeatMap(outS.data);
        setInboundFlight(inF.data);
        setInboundSeatMap(inS.data);
      } catch (err) {
        console.error(err);
        alert('Lỗi tải dữ liệu chuyến bay!');
      }
    };
    fetchBothFlights();
  }, [outboundId, inboundId, navigate]);

  if (!outboundFlight || !inboundFlight) return <div className="text-center mt-20 font-bold text-xl">Đang thiết lập sơ đồ ghế...</div>;

  // LOGIC TÍNH GIÁ ĐỘNG TỪ DATABASE 
  const getSeatInfo = (seatId, flightObj) => {
    if (!seatId || !flightObj) return { name: '', price: flightObj?.basePrice || 0, color: '' };
    const row = parseInt(seatId);
    const basePrice = flightObj.basePrice;
    
    const bizMulti = flightObj.classMultipliers?.business || 2.0;
    const premMulti = flightObj.classMultipliers?.premium || 1.3;

    if (row <= 2) {
      return { name: 'Thương gia', price: basePrice * bizMulti, color: 'border-purple-500 text-purple-700 bg-purple-50' };
    } else if (row <= 5) {
      return { name: 'Đặc biệt', price: basePrice * premMulti, color: 'border-green-500 text-green-700 bg-green-50' };
    } else {
      return { name: 'Phổ thông', price: basePrice, color: 'border-blue-300 text-blue-700 bg-white' };
    }
  };

  const outSeatInfo = getSeatInfo(selectedOutboundSeat, outboundFlight);
  const inSeatInfo = getSeatInfo(selectedInboundSeat, inboundFlight);
  const totalAmount = outSeatInfo.price + inSeatInfo.price;

  const renderSeats = (seatMap, selectedSeat, setSelectedSeat, flightObj) => {
    const totalRows = Math.ceil(seatMap.seatCapacity / 6);
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    let grid = [];

    for (let row = 1; row <= totalRows; row++) {
      let rowSeats = columns.map(col => {
        const seatId = `${row}${col}`;
        const isBooked = seatMap.bookedSeats.includes(seatId);
        const isSelected = selectedSeat === seatId;
        const seatInfo = getSeatInfo(seatId, flightObj);

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
            <div className="w-1/4 border-t-2 border-dashed border-gray-300"></div>
            <span className="mx-4 text-[10px] font-bold text-gray-400 tracking-widest uppercase text-center w-1/2">
              {row === 3 ? 'Phổ thông Đặc biệt' : 'Phổ thông'}
            </span>
            <div className="w-1/4 border-t-2 border-dashed border-gray-300"></div>
          </div>
        );
      }

      grid.push(
        <div key={`row-${row}`} className="flex justify-center gap-4 mb-3 items-center">
          <div className="flex gap-2">{rowSeats.slice(0, 3)}</div>
          <div className="w-6 text-center text-gray-400 font-bold text-xs bg-gray-100 rounded-full h-6 flex items-center justify-center">{row}</div>
          <div className="flex gap-2">{rowSeats.slice(3, 6)}</div>
        </div>
      );
    }
    return grid;
  };

  const handleContinue = () => {
    if (!selectedOutboundSeat || !selectedInboundSeat) {
      alert('Vui lòng chọn ghế cho cả chiều đi và chiều về!');
      return;
    }
    navigate('/checkout', { 
      state: { 
        isRoundTrip: true,
        outboundFlightId: outboundId,
        inboundFlightId: inboundId,
        outboundSeat: selectedOutboundSeat,
        inboundSeat: selectedInboundSeat,
        totalAmount: totalAmount, 
        outboundFlight, 
        inboundFlight 
      } 
    });
  };

  return (
    <div className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2">
          
          <div className="flex bg-white rounded-2xl shadow-sm mb-4 p-2 border border-gray-200">
            <button onClick={() => setActiveTab('outbound')} className={`flex-1 py-4 font-black text-lg rounded-xl transition ${activeTab === 'outbound' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              🛫 GHẾ CHIỀU ĐI {selectedOutboundSeat && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Đã chọn: {selectedOutboundSeat}</span>}
            </button>
            <button onClick={() => setActiveTab('inbound')} className={`flex-1 py-4 font-black text-lg rounded-xl transition ${activeTab === 'inbound' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              🛬 GHẾ CHIỀU VỀ {selectedInboundSeat && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Đã chọn: {selectedInboundSeat}</span>}
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-wrap justify-center gap-4 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-50"></div> Thương gia</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50"></div> Đặc biệt</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-blue-300 bg-white"></div> Phổ thông</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded border-2 border-gray-300 bg-gray-200"></div> Đã bán</div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 max-w-lg mx-auto overflow-hidden relative">
            <div className="h-24 bg-gray-100 rounded-t-[100px] border-b-4 border-gray-200 flex items-center justify-center">
              <span className="font-black text-gray-400 mt-6 tracking-widest uppercase">Khoang Thương Gia</span>
            </div>
            <div className="p-8 bg-white">
              {activeTab === 'outbound' 
                ? renderSeats(outboundSeatMap, selectedOutboundSeat, setSelectedOutboundSeat, outboundFlight)
                : renderSeats(inboundSeatMap, selectedInboundSeat, setSelectedInboundSeat, inboundFlight)
              }
            </div>
          </div>

        </div>

        {/* CỘT PHẢI */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 sticky top-4">
            <h3 className="text-lg font-black text-gray-800 mb-6 pb-4 border-b-2 border-dashed uppercase text-center">Tóm tắt Khứ Hồi</h3>
            
            {/* Tóm tắt chiều đi */}
            <div className={`mb-4 p-4 rounded-xl border transition-colors ${selectedOutboundSeat ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
              <p className="text-xs font-black text-blue-600 mb-2 tracking-widest uppercase">🛫 CHIỀU ĐI • {new Date(outboundFlight.departureTime).toLocaleDateString('vi-VN')}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">{outboundFlight.departureAirport?.code} ➔ {outboundFlight.arrivalAirport?.code}</span>
                <span className="text-red-600 font-bold">{outSeatInfo.price.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-600">Ghế: <span className="text-blue-700">{selectedOutboundSeat || '--'}</span></span>
                <span className={selectedOutboundSeat ? 'text-blue-700' : 'text-gray-400'}>{outSeatInfo.name || 'Chưa chọn'}</span>
              </div>
            </div>

            {/* Tóm tắt chiều về */}
            <div className={`mb-6 p-4 rounded-xl border transition-colors ${selectedInboundSeat ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
              <p className="text-xs font-black text-blue-600 mb-2 tracking-widest uppercase">🛬 CHIỀU VỀ • {new Date(inboundFlight.departureTime).toLocaleDateString('vi-VN')}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">{inboundFlight.departureAirport?.code} ➔ {inboundFlight.arrivalAirport?.code}</span>
                <span className="text-red-600 font-bold">{inSeatInfo.price.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-600">Ghế: <span className="text-blue-700">{selectedInboundSeat || '--'}</span></span>
                <span className={selectedInboundSeat ? 'text-blue-700' : 'text-gray-400'}>{inSeatInfo.name || 'Chưa chọn'}</span>
              </div>
            </div>

            <div className="mb-6 flex justify-between items-end border-t border-gray-200 pt-6">
              <p className="text-gray-500 font-bold">Tổng cộng:</p>
              <p className="text-3xl font-black text-red-600">{totalAmount.toLocaleString()} đ</p>
            </div>

            <button onClick={handleContinue} className="w-full bg-red-600 text-white font-black text-lg py-4 rounded-xl hover:bg-red-700 shadow-lg mb-3 transition transform hover:-translate-y-1">
              TIẾP TỤC THANH TOÁN
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

export default RoundTripDetails;