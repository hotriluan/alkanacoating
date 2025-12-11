import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export default function BackupManagement() {
    const [activeTab, setActiveTab] = useState('data'); // 'data' or 'full'
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            const res = await api.get('/admin/backups');
            setBackups(res.data);
        } catch (error) {
            console.error('Error fetching backups:', error);
            toast.error('Không thể tải danh sách backup');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async (type) => {
        if (!window.confirm(`Bạn có chắc chắn muốn tạo bản sao lưu ${type === 'data' ? 'Dữ liệu' : 'Toàn bộ'} không?`)) return;

        setProcessing(true);
        const toastId = toast.loading('Đang tạo bản sao lưu...');

        try {
            const endpoint = type === 'data' ? '/admin/backups/data' : '/admin/backups/full';
            await api.post(endpoint);
            toast.success('Tạo bản sao lưu thành công', { id: toastId });
            fetchBackups();
        } catch (error) {
            console.error('Error creating backup:', error);
            toast.error('Lỗi khi tạo bản sao lưu: ' + (error.response?.data?.message || error.message), { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    const handleRestore = async (filename) => {
        if (!window.confirm('CẢNH BÁO: Hành động này sẽ ghi đè dữ liệu hiện tại bằng bản sao lưu. Bạn có chắc chắn muốn tiếp tục?')) return;

        setProcessing(true);
        const toastId = toast.loading('Đang khôi phục dữ liệu...');

        try {
            await api.post(`/admin/backups/${filename}/restore`);
            toast.success('Khôi phục dữ liệu thành công!', { id: toastId });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Error restoring backup:', error);
            toast.error('Lỗi khi khôi phục: ' + (error.response?.data?.message || error.message), { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bản sao lưu này?')) return;

        try {
            await api.delete(`/admin/backups/${filename}`);
            toast.success('Đã xóa bản sao lưu');
            setBackups(prev => prev.filter(b => b.filename !== filename));
        } catch (error) {
            console.error('Error deleting backup:', error);
            toast.error('Không thể xóa bản sao lưu');
        }
    };

    const handleDownload = async (filename, isInstaller = false) => {
        const toastId = toast.loading('Đang chuẩn bị tải xuống...');
        try {
            const url = isInstaller
                ? '/admin/backups/installer'
                : `/admin/backups/${filename}/download`;

            const response = await api.get(url, {
                responseType: 'blob',
            });

            // Create blob link to download
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', isInstaller ? 'installer.php' : filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast.success('Bắt đầu tải xuống', { id: toastId });
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Lỗi khi tải xuống: ' + (error.response?.data?.message || 'Không xác định'), { id: toastId });
        }
    };

    const filteredBackups = backups.filter(b =>
        activeTab === 'data' ? b.type === 'data' : b.type === 'full'
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Sao lưu & Khôi phục</h1>
                <div className="space-x-2">
                    {activeTab === 'full' && (
                        <button
                            onClick={() => handleDownload(null, true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                        >
                            <span>⬇️</span> Tải Installer (deploy.php)
                        </button>
                    )}
                    <button
                        onClick={() => handleCreateBackup(activeTab)}
                        disabled={processing}
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {processing ? (
                            <span className="animate-spin">⌛</span>
                        ) : (
                            <span>➕</span>
                        )}
                        Tạo sao lưu mới
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'data'
                        ? 'bg-white text-brand-600 shadow'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    Sao lưu Dữ liệu (Hàng ngày)
                </button>
                <button
                    onClick={() => setActiveTab('full')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'full'
                        ? 'bg-white text-brand-600 shadow'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    Sao lưu Toàn bộ (Di chuyển Web)
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                {activeTab === 'data' ? (
                    <p>
                        <strong>Sao lưu Dữ liệu:</strong> Chỉ sao lưu Cơ sở dữ liệu và thư mục hình ảnh (Uploads).
                        Dùng để bảo vệ nội dung hàng ngày. Có thể khôi phục trực tiếp tại đây.
                    </p>
                ) : (
                    <p>
                        <strong>Sao lưu Toàn bộ:</strong> Sao lưu Mã nguồn + Database + Uploads.
                        Dùng để di chuyển website sang hosting khác.
                        Để khôi phục, hãy tải file Backup và file <strong>Installer (deploy.php)</strong> lên hosting mới và chạy file deploy.php.
                    </p>
                )}
            </div>

            {/* Backup List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải...</div>
                ) : filteredBackups.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Chưa có bản sao lưu nào.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Tên file</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Kích thước</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Ngày tạo</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBackups.map((backup) => (
                                <tr key={backup.filename} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{backup.filename}</td>
                                    <td className="px-6 py-4 text-gray-600">{backup.size}</td>
                                    <td className="px-6 py-4 text-gray-600">{backup.created_at}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleDownload(backup.filename)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Tải về
                                        </button>
                                        {activeTab === 'data' && (
                                            <button
                                                onClick={() => handleRestore(backup.filename)}
                                                disabled={processing}
                                                className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                                            >
                                                Khôi phục
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(backup.filename)}
                                            disabled={processing}
                                            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
