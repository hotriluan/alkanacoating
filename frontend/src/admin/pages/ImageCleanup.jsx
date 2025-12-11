import { useState, useEffect } from 'react';
import api, { API_ROOT } from '../../services/api';

export default function ImageCleanup() {
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

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/images/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const scanUnusedImages = async () => {
    try {
      setScanning(true);
      setUnusedImages(null);
      const response = await api.get('/admin/images/scan-unused');
      setUnusedImages(response.data);
      setActiveTab('cleanup');
    } catch (error) {
      console.error('Error scanning images:', error);
      alert('Lỗi khi quét hình ảnh');
    } finally {
      setScanning(false);
    }
  };

  const handleSelectImage = (image) => {
    setSelectedImages(prev => {
      const exists = prev.find(i => i.path === image.path);
      if (exists) return prev.filter(i => i.path !== image.path);
      return [...prev, image];
    });
  };

  const handleSelectAll = (type) => {
    const images = unusedImages?.unused_images?.[type] || [];
    const allSelected = images.every(img => selectedImages.some(si => si.path === img.path));
    if (allSelected) {
      setSelectedImages(prev => prev.filter(p => p.type !== type));
    </div>
  );
}
        <div>
          {(() => {
            if (scanning) {
              return (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto" />
                  <p className="text-gray-500 mt-4">Đang quét hình ảnh không sử dụng...</p>
                </div>
              )
            }
            if (!unusedImages) {
              return (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa quét hình ảnh</h3>
                  <p className="text-gray-600 mb-6">Nhấn nút bên dưới để quét hình ảnh không sử dụng</p>
                  <button
                    onClick={scanUnusedImages}
                    disabled={scanning}
                    className="px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg hover:from-brand-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {scanning ? '🔍 Đang quét...' : '🔍 Bắt đầu quét'}
                  </button>
                </div>
              )
            }
            return (
              <>
              {/* Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-yellow-900 mb-1">
                      Tìm thấy {unusedImages.total_unused} hình ảnh không sử dụng
                    </h3>
                    <p className="text-yellow-700">
                      Tổng dung lượng: {unusedImages.total_size_mb} MB • 
                      Đã chọn: {selectedImages.length} file
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBackup}
                      disabled={selectedImages.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      💾 Backup ({selectedImages.length})
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={selectedImages.length === 0}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      🗑️ Xóa ({selectedImages.length})
                    </button>
                    <button
                      onClick={scanUnusedImages}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      🔄 Quét lại
                    </button>
                  </div>
                </div>
              </div>

              {/* Unused Images by Type */}
              <div className="space-y-6">
                {Object.entries(unusedImages.unused_images).map(([type, images]) => {
                  if (images.length === 0) return null;
                  
                  const typeSelected = images.filter(img => 
                    selectedImages.find(si => si.path === img.path)
                  ).length;

                  return (
                    <div key={type} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                          import { useState, useEffect } from 'react';
                          import api, { API_ROOT } from '../../services/api';

                          export default function ImageCleanup() {
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
                              import { useState, useEffect } from 'react';
                              import api, { API_ROOT } from '../../services/api';

                              export default function ImageCleanup() {
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
        <div>
          {(() => {
            if (scanning) {
              return (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto" />
                  <p className="text-gray-500 mt-4">Đang quét hình ảnh không sử dụng...</p>
                </div>
              )
            }
            if (!unusedImages) {
              return (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa quét hình ảnh</h3>
                  <p className="text-gray-600 mb-6">Nhấn nút bên dưới để quét hình ảnh không sử dụng</p>
                  <button
                    onClick={scanUnusedImages}
                    disabled={scanning}
                    className="px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg hover:from-brand-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {scanning ? '🔍 Đang quét...' : '🔍 Bắt đầu quét'}
                  </button>
                </div>
              )
            }
            return (
              <>
              {/* Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-yellow-900 mb-1">
                      Tìm thấy {unusedImages.total_unused} hình ảnh không sử dụng
                    </h3>
                    <p className="text-yellow-700">
                      Tổng dung lượng: {unusedImages.total_size_mb} MB • 
                      Đã chọn: {selectedImages.length} file
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBackup}
                      disabled={selectedImages.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      💾 Backup ({selectedImages.length})
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={selectedImages.length === 0}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      🗑️ Xóa ({selectedImages.length})
                    </button>
                    <button
                      onClick={scanUnusedImages}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      🔄 Quét lại
                    </button>
                  </div>
                </div>
              </div>

              {/* Unused Images by Type */}
              <div className="space-y-6">
                {Object.entries(unusedImages.unused_images).map(([type, images]) => {
                  if (images.length === 0) return null;
                  
                  const typeSelected = images.filter(img => 
                    selectedImages.find(si => si.path === img.path)
                  ).length;

                  return (
                    <div key={type} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 capitalize">{type}</h3>
                          <p className="text-sm text-gray-600">
                            {images.length} file • {formatBytes(images.reduce((sum, img) => sum + img.size, 0))}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectAll(type)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {typeSelected === images.length ? '☑️ Bỏ chọn tất cả' : '☐ Chọn tất cả'}
                        </button>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {images.map((image, index) => {
                            const isSelected = selectedImages.find(si => si.path === image.path);
                            return (
                              <div 
                                key={index}
                                onClick={() => handleSelectImage(image)}
                                className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-brand-600 bg-brand-50' 
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={`${API_ROOT}/uploads/${type}/${image.filename}`}
                                    alt={image.filename}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3E?%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                </div>
                                <div className="text-xs font-medium text-gray-900 truncate" title={image.filename}>
                                  {image.filename}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {image.size_kb} KB
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(image.modified).toLocaleDateString('vi-VN')}
                                </div>
                                {isSelected && (
                                  <div className="mt-1 text-center">
                                    <span className="text-xs font-semibold text-brand-600">✓ Đã chọn</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {unusedImages.total_unused === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Không có hình ảnh không sử dụng</h3>
                  <p className="text-gray-600">Tất cả hình ảnh đều đang được sử dụng!</p>
                </div>
              )}
              </>
            )
          })()}
        </div>
      )}
    </div>
  );
}
