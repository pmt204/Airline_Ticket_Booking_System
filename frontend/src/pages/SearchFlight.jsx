import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const SearchFlight = () => {
  const navigate = useNavigate();
  const [searchParamsURL, setSearchParamsURL] = useSearchParams(); 
  
  const [airports, setAirports] = useState([]);
  const [airlines, setAirlines] = useState([]);
  
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [inboundFlights, setInboundFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('outbound');
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedInbound, setSelectedInbound] = useState(null);

  const [localParams, setLocalParams] = useState({
    dep: searchParamsURL.get('dep') || '',
    arr: searchParamsURL.get('arr') || '',
    date: searchParamsURL.get('date') || '',
    returnDate: searchParamsURL.get('returnDate') || '',
    airline: searchParamsURL.get('airline') || '',
    type: searchParamsURL.get('type') || 'one-way',
    isDirect: searchParamsURL.get('isDirect') === 'true' || false
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [aptRes, alnRes] = await Promise.all([
          axiosClient.get('/api/flights/airports'),
          axiosClient.get('/api/flights/airlines')
        ]);
        setAirports(aptRes.data);
        setAirlines(alnRes.data);
      } catch (err) { console.error(err); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const dep = searchParamsURL.get('dep');
        const arr = searchParamsURL.get('arr');
        const date = searchParamsURL.get('date');
        const returnDate = searchParamsURL.get('returnDate');
        const type = searchParamsURL.get('type');
        const airline = searchParamsURL.get('airline');

        // 1. TÌM CHIỀU ĐI
        const queryOut = new URLSearchParams();
        if (dep) queryOut.append('dep', dep);
        if (arr) queryOut.append('arr', arr);
        if (date) queryOut.append('date', date);
        if (airline) queryOut.append('airline', airline);
        const outRes = await axiosClient.get(`/api/flights/search?${queryOut.toString()}`);
        setOutboundFlights(outRes.data);

        // 2. TÌM CHIỀU VỀ 
        if (type === 'round-trip' && returnDate) {
          const queryIn = new URLSearchParams();
          if (arr) queryIn.append('dep', arr); 
          if (dep) queryIn.append('arr', dep); 
          queryIn.append('date', returnDate);
          if (airline) queryIn.append('airline', airline);
          const inRes = await axiosClient.get(`/api/flights/search?${queryIn.toString()}`);
          setInboundFlights(inRes.data);
        } else {
          setInboundFlights([]);
        }

        setSelectedOutbound(null);
        setSelectedInbound(null);
        setActiveTab('outbound');
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchFlights();
  }, [searchParamsURL]); 

  const handleModifySearch = (e) => {
    e.preventDefault();
    if (localParams.type === 'round-trip' && !localParams.returnDate) {
      alert("Vui lòng chọn ngày về!");
      return;
    }
    setSearchParamsURL({ ...localParams });
  };

  const handleSelectFlight = (flight) => {
    if (localParams.type === 'one-way') {
      navigate(`/flight/${flight._id}`);
    } else {
      if (activeTab === 'outbound') {
        setSelectedOutbound(flight);
        setSelectedInbound(null); 
        setActiveTab('inbound');
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } else {
        setSelectedInbound(flight);
      }
    }
  };

  const handleProceedRoundTrip = () => {
    if (!selectedOutbound || !selectedInbound) return alert("Vui lòng chọn đủ 2 chuyến!");
    navigate(`/flight/roundtrip?outbound=${selectedOutbound._id}&inbound=${selectedInbound._id}`);
  };

  const renderFlightCard = (f, isSelected) => (
    <div key={f._id} className={`bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-xl transition flex flex-col md:flex-row justify-between items-center group cursor-pointer ${isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200'}`} onClick={() => handleSelectFlight(f)}>
      <div className="flex items-center gap-6 mb-6 md:mb-0 w-full md:w-auto">
        <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2">
          <img src={f.airline?.logoUrl} alt="Logo" className="max-w-full max-h-full mix-blend-multiply" onError={e => e.target.style.display='none'} />
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-3xl font-black text-gray-800">{new Date(f.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-sm text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded mt-1">{f.departureAirport?.code}</p>
          </div>
          <div className="flex flex-col items-center px-2">
            <span className="text-[10px] text-gray-400 font-black mb-1 uppercase tracking-widest">{f.flightNumber}</span>
            <div className={`w-24 border-b-2 border-dashed relative ${isSelected ? 'border-red-400' : 'border-gray-300'}`}>
              <span className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${isSelected ? 'text-red-600' : 'text-gray-400'}`}>✈️</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-3xl font-black text-gray-800">{new Date(f.arrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-sm text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded mt-1">{f.arrivalAirport?.code}</p>
          </div>
        </div>
      </div>
      <div className="text-center md:text-right flex flex-col md:items-end border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8 border-gray-100">
        <p className="text-sm font-bold text-green-600 mb-1">Chỉ còn {f.availableSeats} chỗ</p>
        <p className="text-3xl font-black text-red-600 mb-4">{f.basePrice?.toLocaleString()} VND</p>
        <button className={`px-10 py-3 rounded-xl font-black w-full shadow-md ${isSelected ? 'bg-gray-800 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}>
          {isSelected ? 'ĐÃ CHỌN' : (localParams.type === 'one-way' ? 'ĐẶT VÉ' : 'CHỌN CHUYẾN')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <div className="bg-red-700 shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleModifySearch} className="space-y-4">
            <div className="flex flex-wrap gap-6 text-white font-bold text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="flightType" className="accent-yellow-400 w-4 h-4" checked={localParams.type === 'round-trip'} onChange={() => { setLocalParams({...localParams, type: 'round-trip'}); setSearchParamsURL({...localParams, type: 'round-trip'}); }}/> Khứ hồi
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="flightType" className="accent-yellow-400 w-4 h-4" checked={localParams.type === 'one-way'} onChange={() => { setLocalParams({...localParams, type: 'one-way'}); setSearchParamsURL({...localParams, type: 'one-way'}); }}/> Một chiều
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <div className="relative">
                <label className="text-red-100 text-xs font-bold mb-1 block">Khởi hành</label>
                <select className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none" value={localParams.dep} onChange={e => setLocalParams({...localParams, dep: e.target.value})}>
                  <option value="">🛫 Điểm đi</option>
                  {airports.map(a => <option key={a._id} value={a._id}>{a.city}</option>)}
                </select>
              </div>
              <div className="relative">
                <label className="text-red-100 text-xs font-bold mb-1 block">Điểm đến</label>
                <select className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none" value={localParams.arr} onChange={e => setLocalParams({...localParams, arr: e.target.value})}>
                  <option value="">🛬 Điểm đến</option>
                  {airports.map(a => <option key={a._id} value={a._id}>{a.city}</option>)}
                </select>
              </div>
              <div>
                <label className="text-red-100 text-xs font-bold mb-1 block">Ngày đi</label>
                <input type="date" className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none" value={localParams.date} onChange={e => setLocalParams({...localParams, date: e.target.value})} />
              </div>
              <div>
                <label className="text-red-100 text-xs font-bold mb-1 block">Ngày về</label>
                <input type="date" disabled={localParams.type === 'one-way'} min={localParams.date} className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none disabled:bg-red-800 disabled:text-red-400" value={localParams.returnDate} onChange={e => setLocalParams({...localParams, returnDate: e.target.value})} />
              </div>
              <div>
                <label className="text-red-100 text-xs font-bold mb-1 block">Hãng bay</label>
                <select className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none" value={localParams.airline} onChange={e => setLocalParams({...localParams, airline: e.target.value})}>
                  <option value="">✈️ Tất cả</option>
                  {airlines.map(a => <option key={a._id} value={a._id}>{a.code}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-800 font-black px-4 py-3 rounded-lg shadow-md transition">TÌM KIẾM</button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 mt-6">
        {localParams.type === 'round-trip' && (
          <div className="flex bg-white rounded-2xl shadow-sm mb-6 p-2 border border-gray-200">
            <button onClick={() => setActiveTab('outbound')} className={`flex-1 py-4 rounded-xl font-black text-lg transition ${activeTab === 'outbound' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              🛫 CHUYẾN ĐI {selectedOutbound && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full relative -top-1">Đã chọn</span>}
            </button>
            <button onClick={() => setActiveTab('inbound')} className={`flex-1 py-4 rounded-xl font-black text-lg transition ${activeTab === 'inbound' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              🛬 CHUYẾN VỀ {selectedInbound && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full relative -top-1">Đã chọn</span>}
            </button>
          </div>
        )}

        {loading && <div className="text-center py-20 font-bold text-gray-600">Đang tìm chuyến bay tốt nhất...</div>}

        {!loading && activeTab === 'outbound' && (
          <div className="space-y-5">
            {outboundFlights.length === 0 ? <p className="text-center p-10 bg-white rounded-xl text-gray-500">Không tìm thấy chuyến đi.</p> : outboundFlights.map(f => renderFlightCard(f, selectedOutbound?._id === f._id))}
          </div>
        )}

        {!loading && activeTab === 'inbound' && localParams.type === 'round-trip' && (
          <div className="space-y-5 animate-fade-in">
            {inboundFlights.length === 0 ? (
              <p className="text-center p-10 bg-white rounded-xl text-gray-500">
                Không có chuyến về trong ngày này.
              </p>
            ) : (
              inboundFlights
                .filter(f => {
                  if (!selectedOutbound) return true; 

                  // 1. LOGIC TUYẾN BAY: Đảo ngược Khởi hành và Điểm đến
                  const isReverseRoute = 
                    f.departureAirport?.code === selectedOutbound.arrivalAirport?.code &&
                    f.arrivalAirport?.code === selectedOutbound.departureAirport?.code;

                  // 2. LOGIC THỜI GIAN: Chuyến về cất cánh sau khi chuyến đi hạ cánh 2 tiếng
                  const isValidTime = 
                    new Date(f.departureTime).getTime() >= new Date(selectedOutbound.arrivalTime).getTime() + (2 * 3600000);

                  return isReverseRoute && isValidTime;
                })
                .map(f => renderFlightCard(f, selectedInbound?._id === f._id))
            )}
          </div>
        )}
      </div>

      {/* THANH THANH TOÁN TẠM TÍNH DƯỚI CÙNG */}
      {localParams.type === 'round-trip' && (selectedOutbound || selectedInbound) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Chiều đi</p>
                {selectedOutbound ? <p className="font-black text-blue-800">{selectedOutbound.airline?.code} • <span className="text-red-600">{selectedOutbound.basePrice.toLocaleString()}đ</span></p> : <p className="text-gray-400 italic">Chưa chọn</p>}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Chiều về</p>
                {selectedInbound ? <p className="font-black text-blue-800">{selectedInbound.airline?.code} • <span className="text-red-600">{selectedInbound.basePrice.toLocaleString()}đ</span></p> : <p className="text-gray-400 italic">Chưa chọn</p>}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-xs text-gray-500 font-bold uppercase">Tổng cộng</p>
                <p className="text-2xl font-black text-red-600">{((selectedOutbound?.basePrice || 0) + (selectedInbound?.basePrice || 0)).toLocaleString()} VND</p>
              </div>
              <button onClick={handleProceedRoundTrip} disabled={!selectedOutbound || !selectedInbound} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black hover:bg-blue-700 disabled:bg-gray-300">
                CHỌN CHỖ NGỒI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFlight;