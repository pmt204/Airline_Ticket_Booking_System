import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminFlights = () => {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [reload, setReload] = useState(false);

  // State cho tạo mới
  const [newFlight, setNewFlight] = useState({ flightNumber: '', airline: '', departureAirport: '', arrivalAirport: '', departureTime: '', arrivalTime: '', basePrice: '', seatCapacity: '' });
  
  // State cho việc Chỉnh sửa
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ basePrice: '', status: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightsRes, airportsRes, airlinesRes] = await Promise.all([
          axiosClient.get('/api/flights'), axiosClient.get('/api/flights/airports'), axiosClient.get('/api/flights/airlines')
        ]);
        setFlights(flightsRes.data); setAirports(airportsRes.data); setAirlines(airlinesRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [reload]);

  const handleCreateFlight = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/flights', newFlight);
      alert('Tạo chuyến bay thành công!');
      setReload(!reload);
      setNewFlight({ flightNumber: '', airline: '', departureAirport: '', arrivalAirport: '', departureTime: '', arrivalTime: '', basePrice: '', seatCapacity: '' });
    } catch (err) { console.error(err); alert('Lỗi tạo chuyến bay.'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Chắc chắn xóa chuyến bay này?')) {
      try { await axiosClient.delete(`/api/flights/${id}`); setReload(!reload); } 
      catch (err) { console.error(err); alert('Lỗi khi xóa!'); }
    }
  };

  // Hàm xử lý Cập nhật Giá & Trạng thái
  const handleUpdate = async (id) => {
    try {
      await axiosClient.put(`/api/flights/${id}/price`, editData);
      alert('Cập nhật thành công!');
      setEditingId(null);
      setReload(!reload);
    } catch (err) { console.error(err); alert('Lỗi cập nhật!'); }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Quản lý Chuyến bay</h2>
      
      {/* KHU VỰC THÊM CHUYẾN BAY (Giữ nguyên như cũ) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-bold mb-4">Thêm chuyến bay mới</h3>
        <form onSubmit={handleCreateFlight} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Mã chuyến" className="border p-2 rounded" required value={newFlight.flightNumber} onChange={e => setNewFlight({...newFlight, flightNumber: e.target.value})} />
          <select className="border p-2 rounded" required value={newFlight.airline} onChange={e => setNewFlight({...newFlight, airline: e.target.value})}>
            <option value="">-- Hãng bay --</option>{airlines.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <select className="border p-2 rounded" required value={newFlight.departureAirport} onChange={e => setNewFlight({...newFlight, departureAirport: e.target.value})}>
            <option value="">-- Nơi đi --</option>{airports.map(a => <option key={a._id} value={a._id}>{a.code}</option>)}
          </select>
          <select className="border p-2 rounded" required value={newFlight.arrivalAirport} onChange={e => setNewFlight({...newFlight, arrivalAirport: e.target.value})}>
            <option value="">-- Nơi đến --</option>{airports.map(a => <option key={a._id} value={a._id}>{a.code}</option>)}
          </select>
          <input type="datetime-local" className="border p-2 rounded" required value={newFlight.departureTime} onChange={e => setNewFlight({...newFlight, departureTime: e.target.value})} />
          <input type="datetime-local" className="border p-2 rounded" required value={newFlight.arrivalTime} onChange={e => setNewFlight({...newFlight, arrivalTime: e.target.value})} />
          <input type="number" placeholder="Giá vé" className="border p-2 rounded" required value={newFlight.basePrice} onChange={e => setNewFlight({...newFlight, basePrice: e.target.value})} />
          <input type="number" placeholder="Tổng ghế" className="border p-2 rounded" required value={newFlight.seatCapacity} onChange={e => setNewFlight({...newFlight, seatCapacity: e.target.value})} />
          <button type="submit" className="md:col-span-4 bg-primary text-white p-2 rounded hover:bg-blue-800 font-bold">+ Tạo chuyến bay</button>
        </form>
      </div>

      {/* DANH SÁCH & CHỈNH SỬA */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-left min-w-max">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4">Mã CB</th><th className="p-4">Hành trình</th><th className="p-4">Khởi hành</th><th className="p-4">Giá vé</th><th className="p-4">Trạng thái</th><th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(f => (
              <tr key={f._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{f.flightNumber}</td>
                <td className="p-4">{f.departureAirport?.code} ➔ {f.arrivalAirport?.code}</td>
                <td className="p-4">{new Date(f.departureTime).toLocaleString('vi-VN')}</td>
                
                {/* Chế độ xem hoặc Chế độ sửa */}
                {editingId === f._id ? (
                  <>
                    <td className="p-4"><input type="number" className="border p-1 w-24" value={editData.basePrice} onChange={e => setEditData({...editData, basePrice: e.target.value})} /></td>
                    <td className="p-4">
                      <select className="border p-1" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})}>
                        <option value="Scheduled">Đúng giờ</option>
                        <option value="Delayed">Hoãn</option>
                        <option value="Cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleUpdate(f._id)} className="bg-green-500 text-white px-2 py-1 rounded">Lưu</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Hủy</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-secondary font-bold">{f.basePrice?.toLocaleString()} đ</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm text-white ${f.status === 'Cancelled' ? 'bg-red-500' : f.status === 'Delayed' ? 'bg-orange-500' : 'bg-green-500'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => { setEditingId(f._id); setEditData({ basePrice: f.basePrice, status: f.status }); }} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700">Sửa</button>
                      <button onClick={() => handleDelete(f._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700">Xóa</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminFlights;