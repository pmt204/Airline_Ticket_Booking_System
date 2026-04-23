import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [reload, setReload] = useState(false);

  const [newVoucher, setNewVoucher] = useState({
    code: '', discountType: 'Percentage', discountValue: '', minPurchaseValue: 0,
    validFrom: '', validUntil: '', usageLimit: 100
  });

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axiosClient.get('/api/vouchers');
        setVouchers(res.data);
      } catch (err) { console.error(err); }
    };
    fetchVouchers();
  }, [reload]);

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/vouchers', newVoucher);
      alert('Tạo Mã Khuyến Mãi thành công!');
      setNewVoucher({ code: '', discountType: 'Percentage', discountValue: '', minPurchaseValue: 0, validFrom: '', validUntil: '', usageLimit: 100 });
      setReload(!reload);
    } catch (err) { console.error(err); alert('Lỗi tạo mã (Có thể mã đã tồn tại)!'); }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axiosClient.put(`/api/vouchers/${id}/status`);
      setReload(!reload);
    } catch (err) { console.error(err); alert('Lỗi cập nhật trạng thái!'); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🎟️ Quản Lý Mã Khuyến Mãi (Vouchers)</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-blue-600 mb-4">+ Tạo Voucher Mới</h3>
        <form onSubmit={handleCreateVoucher} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded border">
          <div>
            <label className="text-xs font-bold text-gray-600">Mã Code (Viết liền không dấu)</label>
            <input type="text" required placeholder="VD: SUMMER26" className="w-full p-2 border rounded uppercase font-bold text-red-600" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-600">Loại giảm giá</label>
            <select className="w-full p-2 border rounded" value={newVoucher.discountType} onChange={e => setNewVoucher({...newVoucher, discountType: e.target.value})}>
              <option value="Percentage">Giảm theo %</option>
              <option value="Fixed">Giảm tiền mặt (VNĐ)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Mức giảm ({newVoucher.discountType === 'Percentage' ? '%' : 'VNĐ'})</label>
            <input type="number" required placeholder="VD: 20" className="w-full p-2 border rounded" value={newVoucher.discountValue} onChange={e => setNewVoucher({...newVoucher, discountValue: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Đơn hàng tối thiểu (VNĐ)</label>
            <input type="number" className="w-full p-2 border rounded" value={newVoucher.minPurchaseValue} onChange={e => setNewVoucher({...newVoucher, minPurchaseValue: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Ngày bắt đầu</label>
            <input type="datetime-local" required className="w-full p-2 border rounded" value={newVoucher.validFrom} onChange={e => setNewVoucher({...newVoucher, validFrom: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Ngày kết thúc</label>
            <input type="datetime-local" required className="w-full p-2 border rounded" value={newVoucher.validUntil} onChange={e => setNewVoucher({...newVoucher, validUntil: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600">Số lượng phát hành</label>
            <input type="number" required className="w-full p-2 border rounded" value={newVoucher.usageLimit} onChange={e => setNewVoucher({...newVoucher, usageLimit: e.target.value})} />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">LƯU VOUCHER</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 text-white">
            <tr><th className="p-4">Mã KM</th><th className="p-4">Giá trị giảm</th><th className="p-4">Thời hạn</th><th className="p-4">Đã dùng</th><th className="p-4">Trạng thái</th><th className="p-4">Hành động</th></tr>
          </thead>
          <tbody>
            {vouchers.map(v => (
              <tr key={v._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-black text-red-600">{v.code}</td>
                <td className="p-4 font-bold text-blue-600">
                  {v.discountType === 'Percentage' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()} đ`}
                </td>
                <td className="p-4 text-xs">
                  <p>Từ: {new Date(v.validFrom).toLocaleDateString('vi-VN')}</p>
                  <p className="text-red-500">Đến: {new Date(v.validUntil).toLocaleDateString('vi-VN')}</p>
                </td>
                <td className="p-4 font-bold">{v.usedCount} / {v.usageLimit}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-white font-bold text-xs ${v.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                    {v.isActive ? 'Đang bật' : 'Đã tắt'}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleToggleStatus(v._id)} className={`px-3 py-1 rounded text-white text-xs font-bold transition ${v.isActive ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}>
                    {v.isActive ? 'Khóa mã' : 'Mở lại'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVouchers;