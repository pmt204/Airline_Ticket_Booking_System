import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';

const Navbar = () => (
  <nav className="bg-gray-900 text-white p-4 flex justify-between shadow-md">
    <Link to="/" className="text-xl font-bold tracking-widest text-secondary">✈️ FLIGHT ADMIN</Link>
    <div className="space-x-4">
      <Link to="/" className="hover:text-blue-400 font-bold">Mô phỏng Thanh Toán</Link>
      <Link to="/dashboard" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 font-bold">Dashboard Thống Kê</Link>
    </div>
  </nav>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Checkout />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;