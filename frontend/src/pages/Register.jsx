import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(fullName, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Đăng ký tài khoản</h2>
        {error && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Họ và Tên</label>
            <input type="text" className="w-full p-2 border rounded focus:outline-primary"
              value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full p-2 border rounded focus:outline-primary"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Mật khẩu</label>
            <input type="password" className="w-full p-2 border rounded focus:outline-primary"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-secondary text-white p-2 rounded hover:bg-orange-600 transition">
            Đăng ký
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Đã có tài khoản? <Link to="/login" className="text-primary font-bold">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;