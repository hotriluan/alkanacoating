import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ArchivedMenuManagement = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArchived();
    }, []);

    const fetchArchived = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/menus/archived');
            setMenus(res.data);
        } catch (e) {
            console.error('Error fetching archived menus', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn khôi phục menu này?')) return;
        try {
            await api.post(`/admin/menus/${id}/restore`);
            fetchArchived();
            alert('Đã khôi phục');
        } catch (e) {
            console.error('Restore failed', e);
            alert('Khôi phục thất bại');
        }
    };

    const handleForceDelete = async (id) => {
        if (!window.confirm('Xóa vĩnh viễn menu này? Hành động không thể hoàn tác.')) return;
        try {
            await api.delete(`/admin/menus/${id}/force-delete`);
            fetchArchived();
            alert('Đã xóa vĩnh viễn');
        } catch (e) {
            console.error('Delete failed', e);
            alert('Xóa thất bại');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Danh sách menu đã lưu trữ</h1>
            {menus.length === 0 ? (
                <div>Không có menu đã lưu trữ.</div>
            ) : (
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Tiêu đề</th>
                                <th className="px-4 py-2 text-left">URL</th>
                                <th className="px-4 py-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menus.map(m => (
                                <tr key={m.id} className="border-t">
                                    <td className="px-4 py-2">{m.name}</td>
                                    <td className="px-4 py-2">{m.url}</td>
                                    <td className="px-4 py-2">
                                        <button className="mr-3 text-green-600" onClick={() => handleRestore(m.id)}>Khôi phục</button>
                                        <button className="text-red-600" onClick={() => handleForceDelete(m.id)}>Xóa vĩnh viễn</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ArchivedMenuManagement;
