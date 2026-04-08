import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchFlight from './pages/SearchFlight';
import AdminFlights from './pages/AdminFlights';
import FlightDetails from './pages/FlightDetails';

const Navbar = () => {
  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold">✈️ FlightBooking</Link>
      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:text-secondary font-bold">Trang Tìm Vé</Link>
        <Link to="/admin/flights" className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-sm">
          Giao diện Admin Chuyến Bay
        </Link>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<SearchFlight />} />
            <Route path="/admin/flights" element={<AdminFlights />} />
            <Route path="/flight/:id" element={<FlightDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;