import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Khung chứa nội dung các trang */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* FOOTER MỚI - HOÀNH TRÁNG & ĐẦY ĐỦ THÔNG TIN */}
      <footer className="bg-gray-900 text-white pt-12 pb-6 mt-12 shadow-inner">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Cột 1: Giới thiệu */}
          <div>
            <h4 className="text-2xl font-black text-red-600 italic mb-4 tracking-tighter">
              VietTicket<span className="text-yellow-500">.com</span>
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hệ thống đặt vé máy bay trực tuyến hàng đầu. Chuyến bay an toàn, dịch vụ tận tâm, mang thế giới đến gần bạn hơn.
            </p>
          </div>

          {/* Cột 2: Liên hệ */}
          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 text-gray-200">Liên Hệ</h4>
            <p className="text-gray-400 text-sm mb-3">📍 123 Đường Hàng Không, Phường 2, Thủ Đức, TP.HCM</p>
            <p className="text-gray-400 text-sm mb-3">📞 Hotline: 1900 1234 56</p>
            <p className="text-gray-400 text-sm">✉️ Email: support@vietticket.com</p>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 text-gray-200">Hỗ Trợ Khách Hàng</h4>
            <ul className="text-gray-400 text-sm space-y-3">
              <li><a href="#" className="hover:text-red-400 transition">Câu hỏi thường gặp (FAQ)</a></li>
              <li><a href="#" className="hover:text-red-400 transition">Chính sách hành lý</a></li>
              <li><a href="#" className="hover:text-red-400 transition">Quy định đổi/trả vé</a></li>
              <li><a href="#" className="hover:text-red-400 transition">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Cột 4: Mạng xã hội & App */}
          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 text-gray-200">Kết Nối Với Chúng Tôi</h4>
            <div className="flex gap-4 mb-6">
              {/* Icon mạng xã hội (Dùng emoji hoặc icon SVG tùy bạn) */}
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition font-bold text-white">f</a>
              <a href="#" className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:opacity-80 transition font-bold text-white">ig</a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition font-bold text-white">▶</a>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 text-center pt-6 text-sm text-gray-500">
          <p> Bản quyền © 2026 thuộc về VietTicket.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;