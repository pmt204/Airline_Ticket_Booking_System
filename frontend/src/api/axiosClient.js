import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000', // Port của Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bạn có thể thêm Interceptors ở đây sau này để tự động gắn Token (JWT) vào mỗi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;