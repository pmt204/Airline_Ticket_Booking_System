import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Home = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  
  // State quản lý Tab hiển thị ('booking' hoặc 'feedback')
  const [activeTab, setActiveTab] = useState('booking'); 

  // State dữ liệu Form Đặt vé
  const [searchParams, setSearchParams] = useState({ dep: '', arr: '', date: '', type: 'one-way' });
  
  // State dữ liệu Form Phản hồi
  const [feedbackData, setFeedbackData] = useState({ name: '', email: '', message: '' });

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

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // Ở đây nếu bác có API backend thì gắn vào, tạm thời hiện Alert báo thành công
    alert('Cảm ơn bạn đã gửi ý kiến phản hồi! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.');
    setFeedbackData({ name: '', email: '', message: '' }); // Xóa trắng form sau khi gửi
    setActiveTab('booking'); // Tự động quay lại tab đặt vé
  };

  return (
    <div className="bg-white relative">        
        <div 
        className="relative w-full h-[600px] bg-cover bg-center bg-no-repeat flex items-center justify-end px-4 md:px-20"
        style={{ backgroundImage: "url('/images/hero.jpg')" }} 
        >
        
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="absolute left-10 md:left-20 top-1/3 text-white drop-shadow-lg hidden lg:block z-10">
          <h1 className="text-6xl font-black mb-2 text-yellow-400 italic tracking-wide">BAY MUÔN NƠI</h1>
          <h2 className="text-7xl font-black italic">CÙNG VIETTICKET</h2>
        </div>

        <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden mt-10">
          
          {/* THANH ĐIỀU HƯỚNG TABS */}
          <div className="bg-red-600 text-white p-4 font-bold text-lg text-center flex justify-around cursor-pointer transition-all">
            <span 
              onClick={() => setActiveTab('booking')}
              className={`pb-1 ${activeTab === 'booking' ? 'border-b-2 border-yellow-400 text-white' : 'text-red-200 hover:text-white'}`}
            >
              Đặt vé máy bay
            </span>
            <span 
              onClick={() => setActiveTab('feedback')}
              className={`pb-1 ${activeTab === 'feedback' ? 'border-b-2 border-yellow-400 text-white' : 'text-red-200 hover:text-white'}`}
            >
              Gửi phản hồi
            </span>
          </div>

          {/* HIỂN THỊ DỰA TRÊN TAB ĐANG CHỌN */}
          {activeTab === 'booking' ? (
            
            // FORM ĐẶT VÉ (Giữ nguyên như cũ)
            <form onSubmit={handleSearch} className="p-6 animate-fade-in">
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

          ) : (

            // FORM PHẢN HỒI (Mới thêm)
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5 animate-fade-in">
              <div className="text-center mb-2">
                <h3 className="text-lg font-black text-gray-800">Lắng nghe ý kiến của bạn</h3>
                <p className="text-xs text-gray-500 font-bold">Mọi đóng góp đều giúp VietTicket tốt hơn</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">Họ và Tên</label>
                <input type="text" required placeholder="Nhập tên của bạn..." className="w-full border-b-2 border-gray-300 p-2 focus:border-red-600 outline-none font-semibold" 
                  value={feedbackData.name} onChange={e => setFeedbackData({...feedbackData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500">Email liên hệ</label>
                <input type="email" required placeholder="Nhập email..." className="w-full border-b-2 border-gray-300 p-2 focus:border-red-600 outline-none font-semibold" 
                  value={feedbackData.email} onChange={e => setFeedbackData({...feedbackData, email: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">Nội dung góp ý</label>
                <textarea required rows="3" placeholder="Chia sẻ trải nghiệm của bạn..." className="w-full border-2 border-gray-200 mt-1 p-3 rounded-xl focus:border-red-600 outline-none font-semibold resize-none"
                  value={feedbackData.message} onChange={e => setFeedbackData({...feedbackData, message: e.target.value})}></textarea>
              </div>

              <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-full shadow-lg transition transform hover:scale-105">
                GỬI PHẢN HỒI
              </button>
            </form>

          )}
        </div>
      </div>

      {/* 2. CHUYÊN MỤC VOUCHER & KHUYẾN MÃI */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-800 uppercase">Khuyến Mãi Nổi Bật</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 rounded-xl overflow-hidden shadow-md border border-red-100 hover:shadow-xl transition">
            <div className="bg-red-600 text-white text-center py-2 font-bold text-sm tracking-widest">SIÊU SALE MÙA HÈ</div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-black text-red-600 mb-2">GIẢM 20%</h3>
              <p className="text-gray-600 text-sm mb-4">Áp dụng cho tất cả chuyến bay nội địa khởi hành trước tháng 8/2026.</p>
              <div className="inline-block bg-white border-2 border-dashed border-red-600 text-red-600 font-bold px-4 py-2 rounded">MÃ: SUMMER26</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl overflow-hidden shadow-md border border-blue-100 hover:shadow-xl transition">
            <div className="bg-blue-600 text-white text-center py-2 font-bold text-sm tracking-widest">CHÀO THÀNH VIÊN MỚI</div>
            <div className="p-6 text-center">
              <h3 className="text-2xl font-black text-blue-600 mb-2">TẶNG 500K</h3>
              <p className="text-gray-600 text-sm mb-4">Đăng ký tài khoản ngay hôm nay để nhận voucher giảm thẳng vào giá vé.</p>
              <div className="inline-block bg-white border-2 border-dashed border-blue-600 text-blue-600 font-bold px-4 py-2 rounded">MÃ: NEWBIE500</div>
            </div>
          </div>
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

      {/* 3. THÀNH TỰU & GIỚI THIỆU */}
      <div className="bg-gray-100 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-800 uppercase">Vì sao chọn VietTicket?</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Chúng tôi tự hào là nền tảng đặt vé máy bay mang lại trải nghiệm tiện lợi, minh bạch và tiết kiệm nhất cho hàng triệu hành khách mỗi năm.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-3xl font-black text-red-600 mb-1">20+</h3>
              <p className="text-gray-600 font-bold text-sm">Điểm đến</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-3xl font-black text-blue-600 mb-1">1M+</h3>
              <p className="text-gray-600 font-bold text-sm">Khách hàng tin dùng</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-3xl font-black text-yellow-500 mb-1">4.9/5</h3>
              <p className="text-gray-600 font-bold text-sm">Đánh giá chất lượng</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-3xl font-black text-green-600 mb-1">10 Năm</h3>
              <p className="text-gray-600 font-bold text-sm">Kinh nghiệm ngành</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ĐỐI TÁC HÃNG BAY */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center relative z-10">
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