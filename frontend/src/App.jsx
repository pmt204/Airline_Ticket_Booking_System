import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
// IMPORT 2 COMPONENT MỚI
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold">✈️ FlightBooking</Link>
      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:text-secondary">Trang chủ</Link>
        
        {user ? (
          <>
            {/* Sửa lại: Bấm vào tên để vào trang Profile */}
            <Link to="/profile" className="font-semibold text-secondary hover:underline">
              Chào, {user.fullName}
            </Link>
            
            {/* Sửa lại: Nút Admin trỏ tới trang Quản lý User */}
            {user.role === 'admin' && (
              <Link to="/admin/users" className="bg-red-500 px-3 py-1 rounded hover:bg-red-700">
                QL Người dùng
              </Link>
            )}
            
            <button onClick={logout} className="bg-white text-primary px-3 py-1 rounded font-bold hover:bg-gray-200">
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-secondary px-4 py-2 rounded font-bold hover:bg-orange-600 transition">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

// ... (Home component giữ nguyên)
const Home = () => <div className="p-8 text-center text-2xl font-bold">Trang chủ Tìm kiếm vé (Sẽ làm sau)</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* THÊM 2 ROUTE MỚI */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;