import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// TÍCH HỢP ẢNH BANNER TỪ THƯ MỤC ASSETS
import bannerImg from '../assets/banner.jpg';

const Home = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [searchParams, setSearchParams] = useState({ dep: '', arr: '', date: '', type: 'one-way' });

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const { data } = await axiosClient.get('/api/flights/airports');
        setAirports(data);
      } catch (err) { console.error(err); }
    };
    fetchAirports();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?dep=${searchParams.dep}&arr=${searchParams.arr}&date=${searchParams.date}&type=${searchParams.type}`);
  };

  return (
    <div className="bg-white">
      {/* 1. HERO BANNER & FORM ĐẶT VÉ */}
      <div 
        className="relative w-full h-[600px] bg-cover bg-center flex items-center justify-end px-4 md:px-20"
        // SỬ DỤNG BIẾN ẢNH VỪA IMPORT Ở ĐÂY
        style={{ backgroundImage: `url(${bannerImg})` }} 
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        <div className="absolute left-10 md:left-20 top-1/3 text-white drop-shadow-lg hidden lg:block">
          <h1 className="text-6xl font-black mb-2 text-yellow-400 italic tracking-wide">BAY MUÔN NƠI</h1>
          <h2 className="text-7xl font-black italic">CÙNG VIETTICKET</h2>
          <p className="mt-4 text-xl font-bold bg-black bg-opacity-50 inline-block px-6 py-2 rounded-full border border-yellow-400">
            Hàng trăm giải thưởng hấp dẫn đang chờ đón!
          </p>
        </div>

        <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden mt-10">
          <div className="bg-red-600 text-white p-4 font-bold text-lg text-center flex justify-around">
            <span className="border-b-2 border-yellow-400 pb-1">Đặt vé máy bay</span>
            <span className="text-red-200 cursor-not-allowed">Tra cứu hành trình</span>
          </div>

          <form onSubmit={handleSearch} className="p-6">
            <div className="flex gap-6 mb-6 font-bold text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tripType" className="w-5 h-5 accent-red-600" 
                  checked={searchParams.type === 'round-trip'} onChange={() => setSearchParams({...searchParams, type: 'round-trip'})} /> Khứ hồi
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tripType" className="w-5 h-5 accent-red-600" 
                  checked={searchParams.type === 'one-way'} onChange={() => setSearchParams({...searchParams, type: 'one-way'})} /> Một chiều
              </label>
            </div>

            <div className="space-y-4">
              <select className="w-full border-b-2 border-gray-300 p-2 focus:border-red-600 outline-none text-lg font-semibold bg-transparent"
                value={searchParams.dep} onChange={e => setSearchParams({...searchParams, dep: e.target.value})}>
                <option value="">🛫 Chọn Điểm khởi hành</option>
                {airports.map(a => <option key={a._id} value={a._id}>{a.city} ({a.code})</option>)}
              </select>

              <select className="w-full border-b-2 border-gray-300 p-2 focus:border-red-600 outline-none text-lg font-semibold bg-transparent"
                value={searchParams.arr} onChange={e => setSearchParams({...searchParams, arr: e.target.value})}>
                <option value="">🛬 Chọn Điểm đến</option>
                {airports.map(a => <option key={a._id} value={a._id}>{a.city} ({a.code})</option>)}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">Ngày đi</label>
                  <input type="date" required className="w-full border-b-2 border-gray-300 p-2 focus:border-red-600 outline-none font-semibold" 
                    value={searchParams.date} onChange={e => setSearchParams({...searchParams, date: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Ngày về</label>
                  <input type="date" disabled={searchParams.type === 'one-way'} className="w-full border-b-2 border-gray-300 p-2 outline-none font-semibold disabled:bg-gray-100 disabled:text-gray-400" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full mt-8 bg-yellow-400 hover:bg-yellow-500 text-red-700 font-black text-xl py-4 rounded-full shadow-lg transition transform hover:scale-105">
              TÌM CHUYẾN BAY
            </button>
          </form>
        </div>
      </div>

      {/* 2. CHUYÊN MỤC VOUCHER & KHUYẾN MÃI */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-800 uppercase">Khuyến Mãi Nổi Bật</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Voucher 1 */}
          <div className="bg-red-50 rounded-xl overflow-hidden shadow-md border border-red-100 hover:shadow-xl transition">
            <div className="bg-red-600 text-white text-center py-2 font-bold text-sm tracking-widest">SIÊU SALE MÙA HÈ</div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-black text-red-600 mb-2">GIẢM 20%</h3>
              <p className="text-gray-600 text-sm mb-4">Áp dụng cho tất cả chuyến bay nội địa khởi hành trước tháng 8/2026.</p>
              <div className="inline-block bg-white border-2 border-dashed border-red-600 text-red-600 font-bold px-4 py-2 rounded">MÃ: SUMMER26</div>
            </div>
          </div>
          {/* Card Voucher 2 */}
          <div className="bg-blue-50 rounded-xl overflow-hidden shadow-md border border-blue-100 hover:shadow-xl transition">
            <div className="bg-blue-600 text-white text-center py-2 font-bold text-sm tracking-widest">CHÀO THÀNH VIÊN MỚI</div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-black text-blue-600 mb-2">TẶNG 500K</h3>
              <p className="text-gray-600 text-sm mb-4">Đăng ký tài khoản ngay hôm nay để nhận voucher giảm thẳng vào giá vé.</p>
              <div className="inline-block bg-white border-2 border-dashed border-blue-600 text-blue-600 font-bold px-4 py-2 rounded">MÃ: NEWBIE500</div>
            </div>
          </div>
          {/* Card Voucher 3 */}
          <div className="bg-yellow-50 rounded-xl overflow-hidden shadow-md border border-yellow-200 hover:shadow-xl transition">
            <div className="bg-yellow-500 text-white text-center py-2 font-bold text-sm tracking-widest">BAY QUỐC TẾ</div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-black text-yellow-600 mb-2">HOÀN TIỀN 10%</h3>
              <p className="text-gray-600 text-sm mb-4">Áp dụng khi thanh toán bằng thẻ Visa/Mastercard cho các chặng quốc tế.</p>
              <div className="inline-block bg-white border-2 border-dashed border-yellow-600 text-yellow-600 font-bold px-4 py-2 rounded">MÃ: GLOBAL10</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THÀNH TỰU & GIỚI THIỆU (Nền xám nhạt) */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-800 uppercase">Vì sao chọn VietTicket?</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Chúng tôi tự hào là nền tảng đặt vé máy bay mang lại trải nghiệm tiện lợi, minh bạch và tiết kiệm nhất cho hàng triệu hành khách mỗi năm.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-3xl font-black text-red-600 mb-1">20+</h3>
              <p className="text-gray-600 font-bold text-sm">Điểm đến</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-3xl font-black text-blue-600 mb-1">1M+</h3>
              <p className="text-gray-600 font-bold text-sm">Khách hàng tin dùng</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-3xl font-black text-yellow-500 mb-1">4.9/5</h3>
              <p className="text-gray-600 font-bold text-sm">Đánh giá chất lượng</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-3xl font-black text-green-600 mb-1">10 Năm</h3>
              <p className="text-gray-600 font-bold text-sm">Kinh nghiệm ngành</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ĐỐI TÁC HÃNG BAY */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-black text-gray-800 uppercase mb-8">Đối tác Hàng không uy tín</h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition duration-500">
          <h3 className="text-2xl font-black text-blue-800">Vietnam Airlines</h3>
          <h3 className="text-2xl font-black text-red-600">Vietjet Air</h3>
          <h3 className="text-2xl font-black text-green-600">Bamboo Airways</h3>
          <h3 className="text-2xl font-black text-blue-900">Pacific Airlines</h3>
          <h3 className="text-2xl font-black text-red-800">AirAsia</h3>
        </div>
      </div>

    </div>
  );
};

export default Home;