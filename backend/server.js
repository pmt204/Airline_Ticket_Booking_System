const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load cấu hình từ file .env
dotenv.config();

// Khởi tạo app Express
const app = express();

// Middleware để Express hiểu được dữ liệu dạng JSON gửi lên
app.use(express.json());

// Kết nối với MongoDB
connectDB();

// Route test cơ bản
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng đến với API Đặt Vé Máy Bay!' });
});

// Cấu hình Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});