import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/'); // Đăng nhập xong đẩy về Trang chủ
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Đăng nhập</h2>
        {error && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded focus:outline-primary"
              value={email} onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded focus:outline-primary"
              value={password} onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-blue-800 transition">
            Đăng nhập
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Chưa có tài khoản? <Link to="/register" className="text-secondary font-bold">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;