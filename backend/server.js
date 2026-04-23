const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const { connectDB } = require('./config/db');

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const voucherRoutes = require('./routes/voucherRoutes');

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/vouchers', voucherRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng đến với API Đặt Vé Máy Bay!' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});