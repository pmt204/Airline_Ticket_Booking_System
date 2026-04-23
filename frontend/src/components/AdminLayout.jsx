import { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">⛔ Cấm truy cập</h2>
          <p className="text-gray-600 mb-6">Bạn không có quyền quản trị viên để vào khu vực này.</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">Về Trang chủ</Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 text-center border-b border-gray-800 bg-gray-950">
          <h2 className="text-2xl font-black italic text-red-600">
            VietTicket<span className="text-yellow-500">.com</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Admin Workspace</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/admin/dashboard" className={`block px-4 py-3 rounded-lg font-bold transition ${isActive('dashboard') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            📊 Bảng Thống Kê
          </Link>
          <Link to="/admin/flights" className={`block px-4 py-3 rounded-lg font-bold transition ${isActive('flights') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            ✈️ Quản Lý Chuyến Bay
          </Link>
          <Link to="/admin/users" className={`block px-4 py-3 rounded-lg font-bold transition ${isActive('users') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            👥 Quản Lý Người Dùng
          </Link>
          <Link to="/admin/bookings" className={`block px-4 py-3 rounded-lg font-bold transition ${isActive('bookings') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            🎫 Quản Lý Đơn Vé
          </Link>
          <Link to="/admin/system" className={`block px-4 py-3 rounded-lg font-bold transition ${isActive('system') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            ⚙️ Sân bay & Hãng bay
          </Link>
          <Link to="/admin/vouchers" className={`block px-4 py-3 rounded-lg font-bold transition ${isActive('vouchers') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            🎟️ Quản Lý Voucher
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <Link to="/" className="block px-4 py-2 text-center text-sm font-bold text-gray-400 hover:text-white mb-2">
            ⬅ Về Website Khách Hàng
          </Link>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-md">
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen relative">
        
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
          <h1 className="text-xl font-bold text-gray-700">Hệ Thống Quản Trị Trung Tâm</h1>
          
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">{user.fullName}</p>
              <p className="text-xs text-blue-600 font-bold leading-tight">Super Admin</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet /> 
        </div>
        
      </main>
    </div>
  );
};

export default AdminLayout;