const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const { connectDB } = require('./config/db');

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const voucherRoutes = require('./routes/voucherRoutes');

// Load cấu hình từ file .env
dotenv.config();

// Khởi tạo app Express
const app = express();

// ==========================================
// 1. CÁC MIDDLEWARE XỬ LÝ DỮ LIỆU (PHẢI NẰM Ở ĐÂY)
// ==========================================
app.use(cors());

// Middleware để Express hiểu được dữ liệu JSON (Bắt buộc nằm TRÊN các Routes)
app.use(express.json());

// Kết nối Database
connectDB();

// ==========================================
// 2. KHAI BÁO CÁC ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/vouchers', voucherRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));

// ==========================================
// 3. CÁC ROUTE TEST CƠ BẢN
// ==========================================
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng đến với API Đặt Vé Máy Bay!' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// ==========================================
// 4. CẤU HÌNH PORT VÀ CHẠY SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});