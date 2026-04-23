import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ZaloWidget from './components/ZaloWidget';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import Home from './pages/Home';
import Profile from './pages/Profile';
import SearchFlight from './pages/SearchFlight';
import FlightDetails from './pages/FlightDetails';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import MyFlights from './pages/MyFlights';
import OnlineCheckin from './pages/OnlineCheckin';
import RoundTripDetails from './pages/RoundTripDetails';
import BookingDetails from './pages/BookingDetails';

import AdminUsers from './pages/Admin/AdminUsers';
import AdminFlights from './pages/Admin/AdminFlights';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminBookings from './pages/Admin/AdminBookings';
import AdminSystem from './pages/Admin/AdminSystem';
import AdminVouchers from './pages/Admin/AdminVouchers';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/search" element={<SearchFlight />} />
          <Route path="/flight/:id" element={<FlightDetails />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/my-flights" element={<MyFlights />} />
          <Route path="/checkin" element={<OnlineCheckin />} />
          <Route path="/flight/roundtrip" element={<RoundTripDetails />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="flights" element={<AdminFlights />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="vouchers" element={<AdminVouchers />} />
        </Route>

      </Routes>
      <ZaloWidget />
    </Router>
  );
}

export default App;