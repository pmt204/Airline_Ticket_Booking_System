import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="w-full">
      <div className="bg-gray-200 text-gray-700 text-sm py-1 px-4 flex justify-end items-center gap-4">
        <span className="cursor-pointer hover:text-red-600">🎧 Hỗ trợ</span>
        <span>|</span>
        <span className="cursor-pointer">Tiếng Việt ▾</span>
        <span>|</span>
        {user ? (
          <div className="flex gap-4 items-center">
            <Link to="/profile" className="font-bold text-red-600 hover:underline">
              👤 Chào, {user.fullName}
            </Link>
            <button onClick={logout} className="hover:text-red-600">Đăng xuất</button>
          </div>
        ) : (
          <div>
            <Link to="/register" className="hover:text-red-600">Đăng ký</Link>
            <span className="mx-2">|</span>
            <Link to="/login" className="hover:text-red-600 font-bold">Đăng nhập</Link>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md py-3 px-6 flex justify-between items-center">
        <Link to="/" className="text-3xl font-black text-red-600 italic tracking-tighter">
          VietTicket<span className="text-yellow-500">.com</span>
        </Link>

        <nav className="hidden md:flex gap-6 font-bold text-gray-700">
          <Link to="/" className="text-red-600 border-b-2 border-red-600 pb-1">ĐẶT VÉ</Link>
          <Link to="/my-flights" className="hover:text-red-600 font-bold transition">CHUYẾN BAY CỦA TÔI</Link>
          <Link to="/checkin" className="hover:text-red-600 font-bold transition">ONLINE CHECK-IN</Link>          
          {user?.role === 'admin' && (
            <div className="flex gap-4 ml-4 pl-4 border-l-2 border-gray-300">
              <Link to="/admin" className="bg-gray-800 text-white px-4 py-1 rounded-full text-sm hover:bg-black transition flex items-center gap-2">
                ⚙️ Quản trị Hệ thống
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;