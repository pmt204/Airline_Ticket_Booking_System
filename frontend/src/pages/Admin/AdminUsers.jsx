import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axiosClient.get('/api/users');
        setUsers(data);
      } catch (err) {
        console.error('Lỗi lấy danh sách user', err);
      }
    };

    fetchUsers();
  }, [reload]); 

  const handleToggleStatus = async (id, role) => {
    if (role === 'admin') {
      alert('Không thể khóa tài khoản Admin!');
      return;
    }
    try {
      await axiosClient.put(`/api/users/toggle-status/${id}`);
      setReload(!reload); 
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Quản lý Người dùng</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4">Họ Tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b hover:bg-gray-50">
                <td className="p-4">{u.fullName}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4 font-semibold">{u.role}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-white text-sm ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                    {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => handleToggleStatus(u._id, u.role)}
                    className={`px-3 py-1 rounded text-white ${u.isActive ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}
                  >
                    {u.isActive ? 'Khóa' : 'Mở khóa'}
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

export default AdminUsers;