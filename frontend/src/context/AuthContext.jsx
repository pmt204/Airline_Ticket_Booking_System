import { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra xem có token trong máy không mỗi khi mở web
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Nếu có token, gọi API lấy thông tin profile
          const { data } = await axiosClient.get('/api/auth/profile');
          setUser(data);
        } catch (error) {
          console.error("Token hết hạn hoặc lỗi", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  // Hàm Đăng nhập
  const login = async (email, password) => {
    const { data } = await axiosClient.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token); // Lưu chìa khóa vào trình duyệt
    setUser(data); // Cập nhật state
    return data;
  };

  // Hàm Đăng ký
  const register = async (fullName, email, password) => {
    const { data } = await axiosClient.post('/api/auth/register', { fullName, email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  // Hàm Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};