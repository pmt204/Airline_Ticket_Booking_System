const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const { connectDB } = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

// Load cấu hình từ file .env
dotenv.config();

// Khởi tạo app Express
const app = express();

app.use(cors());

// Middleware để Express hiểu được dữ liệu dạng JSON gửi lên
app.use(express.json());
app.use(cors());

// Kết nối với MongoDB
connectDB();

// Thêm đoạn này vào để gọi Routes của Auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Route test cơ bản
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng đến với API Đặt Vé Máy Bay!' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/admin', adminRoutes);

// Cấu hình Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});

