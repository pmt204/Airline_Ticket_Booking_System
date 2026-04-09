import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminSystem = () => {
  const [airports, setAirports] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [reload, setReload] = useState(false);

  // Form states (Đã thêm code cho Airline)
  const [newAirport, setNewAirport] = useState({ name: '', code: '', city: '', country: 'Vietnam' });
  const [newAirline, setNewAirline] = useState({ name: '', code: '', country: 'Vietnam' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, alnRes] = await Promise.all([
          axiosClient.get('/api/flights/airports'),
          axiosClient.get('/api/flights/airlines')
        ]);
        setAirports(aptRes.data);
        setAirlines(alnRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [reload]);

  const handleAddAirport = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/flights/airports', newAirport);
      alert('Thêm Sân bay thành công!');
      setNewAirport({ name: '', code: '', city: '', country: 'Vietnam' });
      setReload(!reload);
    } catch (err) { alert('Lỗi khi thêm Sân bay (Mã IATA có thể bị trùng)!'); console.error(err); }
  };

  const handleAddAirline = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/flights/airlines', newAirline);
      alert('Thêm Hãng bay thành công!');
      setNewAirline({ name: '', code: '', country: 'Vietnam' });
      setReload(!reload);
    } catch (err) { alert('Lỗi khi thêm Hãng bay (Mã hãng có thể bị trùng)!'); console.error(err); }
  };

  // 2 Hàm xử lý Bật/Tắt trạng thái
  const handleToggleAirport = async (id) => {
    try {
      await axiosClient.put(`/api/flights/airports/${id}/status`);
      setReload(!reload);
    } catch (err) { console.error(err); alert('Lỗi cập nhật trạng thái!'); }
  };

  const handleToggleAirline = async (id) => {
    try {
      await axiosClient.put(`/api/flights/airlines/${id}/status`);
      setReload(!reload);
    } catch (err) { console.error(err); alert('Lỗi cập nhật trạng thái!'); }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">⚙️ Cấu hình Hệ thống (Sân bay & Hãng bay)</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ========================================= */}
        {/* KHỐI SÂN BAY */}
        {/* ========================================= */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-blue-600 mb-4">🛫 Quản lý Sân bay</h3>
          
          <form onSubmit={handleAddAirport} className="space-y-3 mb-6 bg-blue-50 p-4 rounded border border-blue-100">
            <input type="text" placeholder="Tên sân bay (VD: Quốc tế Nội Bài)" required className="w-full p-2 border rounded" value={newAirport.name} onChange={e => setNewAirport({...newAirport, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Mã IATA (VD: HAN)" required className="w-full p-2 border rounded uppercase font-bold text-blue-700" value={newAirport.code} onChange={e => setNewAirport({...newAirport, code: e.target.value.toUpperCase()})} />
              <input type="text" placeholder="Thành phố" required className="w-full p-2 border rounded" value={newAirport.city} onChange={e => setNewAirport({...newAirport, city: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">Thêm Sân Bay</button>
          </form>

          <div className="h-80 overflow-y-auto border rounded">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800 text-white sticky top-0">
                <tr><th className="p-3">Mã</th><th className="p-3">Tên & TP</th><th className="p-3">Trạng thái</th><th className="p-3">Hành động</th></tr>
              </thead>
              <tbody>
                {airports.map(a => (
                  <tr key={a._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-black text-blue-600">{a.code}</td>
                    <td className="p-3">
                      <p className="font-bold text-gray-800">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.city}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-white text-xs font-bold ${a.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                        {a.isActive ? 'Đang mở' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggleAirport(a._id)} className={`px-3 py-1 rounded text-white text-xs font-bold transition ${a.isActive ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}>
                        {a.isActive ? 'Khóa' : 'Mở lại'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================= */}
        {/* KHỐI HÃNG BAY */}
        {/* ========================================= */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-red-600 mb-4">✈️ Quản lý Hãng bay</h3>
          
          <form onSubmit={handleAddAirline} className="space-y-3 mb-6 bg-red-50 p-4 rounded border border-red-100">
            <input type="text" placeholder="Tên hãng bay (VD: Vietjet Air)" required className="w-full p-2 border rounded" value={newAirline.name} onChange={e => setNewAirline({...newAirline, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Mã hãng (VD: VJ)" required className="w-full p-2 border rounded uppercase font-bold text-red-700" value={newAirline.code} onChange={e => setNewAirline({...newAirline, code: e.target.value.toUpperCase()})} />
              <input type="text" placeholder="Quốc gia" required className="w-full p-2 border rounded" value={newAirline.country} onChange={e => setNewAirline({...newAirline, country: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition">Thêm Hãng Bay</button>
          </form>

          <div className="h-80 overflow-y-auto border rounded">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800 text-white sticky top-0">
                <tr><th className="p-3">Mã</th><th className="p-3">Hãng bay</th><th className="p-3">Trạng thái</th><th className="p-3">Hành động</th></tr>
              </thead>
              <tbody>
                {airlines.map(a => (
                  <tr key={a._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-black text-red-600">{a.code}</td>
                    <td className="p-3">
                      <p className="font-bold text-gray-800">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.country}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-white text-xs font-bold ${a.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                        {a.isActive ? 'Đang mở' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggleAirline(a._id)} className={`px-3 py-1 rounded text-white text-xs font-bold transition ${a.isActive ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}>
                        {a.isActive ? 'Khóa' : 'Mở lại'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminSystem;