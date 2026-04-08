import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const SearchFlight = () => {
  const navigate = useNavigate(); // Dùng để chuyển trang
  
  const [airports, setAirports] = useState([]);
  const [flights, setFlights] = useState([]);
  
  // State lưu điều kiện tìm kiếm
  const [searchParams, setSearchParams] = useState({ dep: '', arr: '', date: '' });
  const [loading, setLoading] = useState(false);

  // Lấy danh sách sân bay để đổ vào Select box lúc mới vào trang
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const { data } = await axiosClient.get('/api/flights/airports');
        setAirports(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAirports();
  }, []);

  // Hàm xử lý tìm kiếm vé
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosClient.get(
        `/api/flights/search?dep=${searchParams.dep}&arr=${searchParams.arr}&date=${searchParams.date}`
      );
      setFlights(data);
    } catch (err) {
      console.error(err);
      alert('Lỗi tìm kiếm!');
    }
    setLoading(false);
  };

  return (
    <div>
      {/* HERO SECTION - THANH TÌM KIẾM */}
      <div className="bg-primary py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">TÌM CHUYẾN BAY CỦA BẠN</h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-600 mb-1">Điểm đi</label>
              <select 
                className="border-2 p-3 rounded-lg" 
                value={searchParams.dep} 
                onChange={e => setSearchParams({...searchParams, dep: e.target.value})}
              >
                <option value="">Tất cả</option>
                {airports.map(a => <option key={a._id} value={a._id}>{a.city} ({a.code})</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-600 mb-1">Điểm đến</label>
              <select 
                className="border-2 p-3 rounded-lg" 
                value={searchParams.arr} 
                onChange={e => setSearchParams({...searchParams, arr: e.target.value})}
              >
                <option value="">Tất cả</option>
                {airports.map(a => <option key={a._id} value={a._id}>{a.city} ({a.code})</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-600 mb-1">Ngày đi</label>
              <input 
                type="date" 
                className="border-2 p-3 rounded-lg" 
                value={searchParams.date} 
                onChange={e => setSearchParams({...searchParams, date: e.target.value})} 
              />
            </div>

            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full bg-secondary text-white p-3 rounded-lg font-bold text-lg hover:bg-orange-600 transition"
              >
                {loading ? 'Đang tìm...' : 'TÌM VÉ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* KẾT QUẢ TÌM KIẾM */}
      <div className="max-w-4xl mx-auto p-6 mt-4">
        <h3 className="text-xl font-bold mb-4">Kết quả tìm kiếm ({flights.length} chuyến bay)</h3>
        
        {/* Báo lỗi nếu không có chuyến bay nào */}
        {flights.length === 0 && !loading && (
          <div className="text-center p-8 bg-gray-100 rounded-lg text-gray-500">
            Không tìm thấy chuyến bay nào phù hợp. Hãy thử thay đổi ngày hoặc điểm đến.
          </div>
        )}

        {/* Danh sách các chuyến bay */}
        <div className="space-y-4">
          {flights.map(f => (
            <div key={f._id} className="bg-white border rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between items-center hover:shadow-md transition">
              
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {new Date(f.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-gray-500">{f.departureAirport?.code}</p>
                </div>
                <div className="text-gray-400"> ✈️ </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {new Date(f.arrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-gray-500">{f.arrivalAirport?.code}</p>
                </div>
              </div>
              
              <div className="text-center md:text-right flex flex-col md:items-end gap-2">
                <p className="text-sm text-gray-500">{f.airline?.name} • {f.flightNumber}</p>
                <p className="text-2xl font-bold text-secondary">{f.basePrice?.toLocaleString()} VND</p>
                
                {/* Nút Chọn chuyến -> Chuyển sang trang FlightDetails */}
                <button 
                  onClick={() => navigate(`/flight/${f._id}`)} 
                  className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800"
                >
                  Chọn chuyến
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