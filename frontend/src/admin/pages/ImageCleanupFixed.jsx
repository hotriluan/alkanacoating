import { useState, useEffect } from 'react';
import api, { API_ROOT } from '../../services/api';

export default function ImageCleanupFixed() {
  const [analytics, setAnalytics] = useState(null);
  const [unusedImages, setUnusedImages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await api.get('/admin/images/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function scanUnusedImages() {
    try {
      setScanning(true);
      setUnusedImages(null);
      const res = await api.get('/admin/images/scan-unused');
      setUnusedImages(res.data);
      setActiveTab('cleanup');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi quét hình ảnh');
    } finally {
      setScanning(false);
    }
  }

  function handleSelectImage(image) {
    setSelectedImages(prev => {
      const exists = prev.some(p => p.path === image.path);
      if (exists) return prev.filter(p => p.path !== image.path);
      return [...prev, image];
    });
  }

  function handleSelectAll(type) {
    const imgs = unusedImages?.unused_images?.[type] || [];
    const all = imgs.every(i => selectedImages.some(s => s.path === i.path));
    if (all) setSelectedImages(prev => prev.filter(p => p.type !== type));
    else setSelectedImages(prev => {
      const filtered = prev.filter(p => p.type !== type);
      return [...filtered, ...imgs];
    });
  }

  async function handleBackup() {
    if (!selectedImages.length) return alert('Chọn ít nhất 1 hình ảnh để backup');
    if (!confirm(`Backup ${selectedImages.length} hình ảnh?`)) return;
    try {
      const res = await api.post('/admin/images/backup', { images: selectedImages });
      alert(`Backup thành công: ${res.data.backed_count} files -> ${res.data.backup_path}`);
    } catch (err) {
      console.error(err);
      alert('Lỗi backup');
    }
  }

  async function handleDelete() {
    if (!selectedImages.length) return alert('Chọn ít nhất 1 hình ảnh để xóa');
    if (!confirm(`Xóa ${selectedImages.length} hình ảnh? Hành động không thể hoàn tác.`)) return;
    try {
      const res = await api.post('/admin/images/delete-unused', { images: selectedImages });
      alert(`Đã xóa ${res.data.deleted_count} files`);
      setSelectedImages([]);
      await scanUnusedImages();
      await loadAnalytics();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa');
    }
  }

  function formatBytes(b) {
    if (!b) return '0 B';
    const k = 1024; const sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Quản lý Hình ảnh</h1>
        <p className="text-sm text-gray-600">Phân tích dung lượng và dọn dẹp hình ảnh không sử dụng</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('analytics')} className={`px-3 py-2 rounded ${activeTab==='analytics'?'bg-gray-100':''}`}>Thống kê</button>
        <button onClick={() => setActiveTab('cleanup')} className={`px-3 py-2 rounded ${activeTab==='cleanup'?'bg-gray-100':''}`}>Dọn dẹp</button>
      </div>

      {activeTab === 'analytics' && (
        <div>
          {loading && <div>Đang tải...</div>}
          {!loading && analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded shadow">Tổng file: <b>{analytics.total_files}</b></div>
              <div className="p-4 bg-white rounded shadow">Tổng dung lượng: <b>{analytics.total_size_mb} MB</b></div>
              <div className="p-4 bg-white rounded shadow">Tổng (GB): <b>{analytics.total_size_gb} GB</b></div>
            </div>
          )}
          <div className="mt-4">
            <button onClick={scanUnusedImages} className="px-4 py-2 bg-blue-600 text-white rounded">Quét hình ảnh không sử dụng</button>
          </div>
        </div>
      )}

      {activeTab === 'cleanup' && (
        <div>
          {scanning && <div>Đang quét...</div>}

          {!scanning && !unusedImages && (
            <div className="py-8 text-center">
              <div className="mb-4">Chưa quét hình ảnh</div>
              <button onClick={scanUnusedImages} className="px-4 py-2 bg-blue-600 text-white rounded">Bắt đầu quét</button>
            </div>
          )}

          {unusedImages && (
            <div>
              <div className="mb-4 p-4 bg-yellow-50 rounded">Tìm thấy <b>{unusedImages.total_unused}</b> hình ảnh • Tổng: <b>{unusedImages.total_size_mb} MB</b></div>

              <div className="space-y-4">
                {Object.entries(unusedImages.unused_images || {}).map(([type, images]) => (
                  images.length === 0 ? null : (
                    <div key={type} className="p-4 bg-white rounded shadow">
                      <div className="flex justify-between items-center mb-2">
                        <div><b className="capitalize">{type}</b> • {images.length} file</div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSelectAll(type)} className="px-2 py-1 border rounded">Chọn tất cả</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {images.map((img, idx) => {
                          const sel = selectedImages.some(s => s.path === img.path);
                          return (
                            <div key={idx} onClick={() => handleSelectImage(img)} className={`p-2 border rounded ${sel?'ring-2 ring-blue-300':''}`}>
                              <div className="aspect-square overflow-hidden rounded bg-gray-100 mb-2">
                                <img src={`${API_ROOT}/uploads/${type}/${img.filename}`} alt={img.filename} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-xs truncate">{img.filename}</div>
                              <div className="text-xs text-gray-500">{formatBytes(img.size)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={handleBackup} className="px-4 py-2 bg-green-600 text-white rounded">Backup ({selectedImages.length})</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Xóa ({selectedImages.length})</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
