import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const SearchFlight = () => {
  const navigate = useNavigate();
  const [searchParamsURL, setSearchParamsURL] = useSearchParams(); 
  
  const [airports, setAirports] = useState([]);
  const [airlines, setAirlines] = useState([]); // Thêm state lưu hãng bay
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cục bộ cho Form thu gọn 
  const [localParams, setLocalParams] = useState({
    dep: searchParamsURL.get('dep') || '',
    arr: searchParamsURL.get('arr') || '',
    date: searchParamsURL.get('date') || '',
    airline: searchParamsURL.get('airline') || '', // Thêm trường Hãng bay
    type: searchParamsURL.get('type') || 'one-way',
    isDirect: searchParamsURL.get('isDirect') === 'true' || false
  });

  // Tải danh sách sân bay và hãng bay cùng lúc
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

  // Tự động tìm kiếm mỗi khi URL thay đổi (Linh động bỏ trống trường)
  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        // Tự động build chuỗi query chỉ với các trường có dữ liệu
        const query = new URLSearchParams();
        if (searchParamsURL.get('dep')) query.append('dep', searchParamsURL.get('dep'));
        if (searchParamsURL.get('arr')) query.append('arr', searchParamsURL.get('arr'));
        if (searchParamsURL.get('date')) query.append('date', searchParamsURL.get('date'));
        if (searchParamsURL.get('airline')) query.append('airline', searchParamsURL.get('airline'));
        
        // Gọi API với chuỗi linh động (Nếu trống hết sẽ lấy toàn bộ chuyến bay)
        const { data } = await axiosClient.get(`/api/flights/search?${query.toString()}`);
        setFlights(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchFlights();
  }, [searchParamsURL]); 

  // Hàm khi người dùng bấm nút TÌM LẠI trên thanh ngang
  const handleModifySearch = (e) => {
    e.preventDefault();
    
    // Lọc bỏ các trường rỗng trên thanh URL cho sạch đẹp
    const newUrlParams = {};
    if (localParams.dep) newUrlParams.dep = localParams.dep;
    if (localParams.arr) newUrlParams.arr = localParams.arr;
    if (localParams.date) newUrlParams.date = localParams.date;
    if (localParams.airline) newUrlParams.airline = localParams.airline;
    if (localParams.type) newUrlParams.type = localParams.type;
    if (localParams.isDirect) newUrlParams.isDirect = localParams.isDirect;

    setSearchParamsURL(newUrlParams); // Kích hoạt useEffect tìm kiếm
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      
      {/* THANH TÌM KIẾM THU GỌN CHUYÊN NGHIỆP */}
      <div className="bg-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleModifySearch} className="space-y-4">
            
            {/* Dòng 1: Các tùy chọn Radio / Checkbox */}
            <div className="flex flex-wrap gap-6 text-white font-bold text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="flightType" className="accent-yellow-400 w-4 h-4" 
                  checked={localParams.type === 'round-trip'} onChange={() => setLocalParams({...localParams, type: 'round-trip'})}/>
                Khứ hồi
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="flightType" className="accent-yellow-400 w-4 h-4" 
                  checked={localParams.type === 'one-way'} onChange={() => setLocalParams({...localParams, type: 'one-way'})}/>
                Một chiều
              </label>
              <div className="w-px h-5 bg-red-500 mx-2 hidden md:block"></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-yellow-400 w-4 h-4 rounded" 
                  checked={localParams.isDirect} onChange={(e) => setLocalParams({...localParams, isDirect: e.target.checked})}/>
                Chỉ bay thẳng
              </label>
            </div>

            {/* Dòng 2: Các ô nhập liệu */}
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full relative">
                <label className="text-red-100 text-xs font-bold mb-1 block">Khởi hành</label>
                <select className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none focus:ring-2 focus:ring-yellow-400" 
                  value={localParams.dep} onChange={e => setLocalParams({...localParams, dep: e.target.value})}>
                  <option value="">🛫 Tất cả điểm đi</option>
                  {airports.map(a => <option key={a._id} value={a._id}>{a.city} ({a.code})</option>)}
                </select>
              </div>
              
              <div className="flex-1 w-full relative">
                <label className="text-red-100 text-xs font-bold mb-1 block">Điểm đến</label>
                <select className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none focus:ring-2 focus:ring-yellow-400" 
                  value={localParams.arr} onChange={e => setLocalParams({...localParams, arr: e.target.value})}>
                  <option value="">🛬 Tất cả điểm đến</option>
                  {airports.map(a => <option key={a._id} value={a._id}>{a.city} ({a.code})</option>)}
                </select>
              </div>

              <div className="flex-1 w-full">
                <label className="text-red-100 text-xs font-bold mb-1 block">Ngày đi</label>
                <input type="date" className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none focus:ring-2 focus:ring-yellow-400" 
                  value={localParams.date} onChange={e => setLocalParams({...localParams, date: e.target.value})} />
              </div>

              <div className="flex-1 w-full relative">
                <label className="text-red-100 text-xs font-bold mb-1 block">Hãng hàng không</label>
                <select className="w-full p-3 rounded-lg text-gray-800 font-bold bg-white outline-none focus:ring-2 focus:ring-yellow-400" 
                  value={localParams.airline} onChange={e => setLocalParams({...localParams, airline: e.target.value})}>
                  <option value="">✈️ Tất cả các hãng</option>
                  {airlines.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-red-800 font-black px-10 py-3 rounded-lg shadow-md transition transform hover:-translate-y-1">
                TÌM KIẾM
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DANH SÁCH KẾT QUẢ */}
      <div className="max-w-5xl mx-auto p-4 mt-8">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-black text-gray-800">
            {searchParamsURL.size === 0 ? 'Tất cả chuyến bay hiện có' : 'Kết quả tìm kiếm'} 
            <span className="text-blue-600 ml-2">({flights.length} chuyến)</span>
          </h3>
          <div className="hidden md:block text-sm font-bold text-gray-500">Giá vé hiển thị đã bao gồm thuế phí</div>
        </div>
        
        {loading && (
           <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mb-4"></div>
             <p className="text-lg font-bold text-gray-600">Hệ thống đang dò tìm vé tốt nhất...</p>
           </div>
        )}

        {!loading && flights.length === 0 && (
          <div className="text-center p-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <span className="text-6xl mb-4 block">🔍</span>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy chuyến bay phù hợp!</h4>
            <p className="text-gray-500">Vui lòng thử bỏ trống bớt các tiêu chí lọc hoặc thay đổi ngày bay để xem thêm kết quả.</p>
          </div>
        )}

        <div className="space-y-5">
          {flights.map(f => (
            <div key={f._id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition duration-300 flex flex-col md:flex-row justify-between items-center group">
              
              {/* Thông tin chuyến & Hãng bay */}
              <div className="flex items-center gap-6 mb-6 md:mb-0 w-full md:w-auto">
                <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-2">
                  <img src={f.airline?.logoUrl} alt="Logo" className="max-w-full max-h-full mix-blend-multiply" onError={e => e.target.style.display='none'} />
                </div>
                
                <div className="flex items-center gap-8 flex-1 md:flex-none">
                  <div className="text-center md:text-left">
                    <p className="text-3xl font-black text-gray-800">{new Date(f.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-sm text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded mt-1">{f.departureAirport?.code}</p>
                  </div>
                  
                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] text-gray-400 font-black mb-1 tracking-widest uppercase">{f.flightNumber}</span>
                    <div className="w-24 border-b-2 border-gray-300 relative group-hover:border-blue-400 transition">
                      <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-gray-400 group-hover:text-blue-500 transition">✈️</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Bay thẳng</span>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <p className="text-3xl font-black text-gray-800">{new Date(f.arrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-sm text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded mt-1">{f.arrivalAirport?.code}</p>
                  </div>
                </div>
              </div>
              
              {/* Nút đặt vé & Giá */}
              <div className="w-full md:w-auto text-center md:text-right flex flex-col md:items-end border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8 border-gray-100">
                <p className="text-sm font-bold text-green-600 mb-1">Chỉ còn {f.availableSeats} chỗ</p>
                <p className="text-3xl font-black text-red-600 mb-4">{f.basePrice?.toLocaleString()} <span className="text-lg text-gray-500">VND</span></p>
                <button onClick={() => navigate(`/flight/${f._id}`)} className="bg-red-600 text-white px-10 py-3 rounded-xl font-black hover:bg-red-700 w-full shadow-lg shadow-red-200 transition transform hover:-translate-y-1">
                  ĐẶT VÉ NGAY
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFlight;