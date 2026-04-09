import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Thêm state điện thoại
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Nhớ cập nhật hàm register trong AuthContext để nhận thêm tham số phone
      await register(fullName, email, password, phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] bg-gray-50 py-10">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Tạo Tài Khoản</h2>
          <p className="text-gray-500 text-sm mt-2">Trở thành thành viên để nhận nhiều ưu đãi</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 font-bold p-3 mb-6 rounded-lg border border-red-100 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Họ và Tên</label>
            <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="VD: Pham Minh Thanh" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="VD: email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
            <input type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="VD: 0912345678" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
            <input type="password" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-red-600 text-white font-bold p-4 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition transform hover:-translate-y-1 mt-6">
            ĐĂNG KÝ NGAY
          </button>
        </form>
        
        <p className="text-center mt-8 text-sm text-gray-600 font-medium">
          Đã có tài khoản? <Link to="/login" className="text-red-600 font-bold hover:underline">Đăng nhập tại đây</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;