import { useState, useRef, useEffect } from 'react';
import api, { API_ROOT } from '../../services/api';

export default function ImageUploader({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Resolve a preview URL for a stored value or a File instance
  const resolvePreview = (val) => {
    if (!val) return '';
    // File object
    if (typeof File !== 'undefined' && val instanceof File) {
      try { return URL.createObjectURL(val); } catch { return ''; }
    }
    if (typeof val === 'string') {
      if (val.startsWith('data:') || /^https?:\/\//i.test(val)) return val;
      // If backend returns a path like "/uploads/..", prefix API_ROOT
      if (val.startsWith('/')) return API_ROOT.replace(/\/$/, '') + val;
      // Otherwise try to normalize and prefix
      const normalized = val.replace(/^\/+/, '');
      return API_ROOT.replace(/\/$/, '') + '/' + normalized;
    }
    return '';
  };

  useEffect(() => {
    setPreviewUrl(resolvePreview(value));
  }, [value]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 8MB!');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'settings');

      const response = await api.post('/admin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;
      onChange(imageUrl); // persist the stored value (e.g. '/uploads/...')
      setPreviewUrl(resolvePreview(imageUrl));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (newUrl) => {
    onChange(newUrl);
    setPreviewUrl(resolvePreview(newUrl));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Hoặc nhập URL ảnh: https://... hoặc /uploads/image.jpg"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {uploading ? '⏳ Đang tải...' : '📁 Chọn ảnh'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {previewUrl && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">🖼️ Xem trước:</p>
              <img 
                src={previewUrl} 
                alt={label || 'Preview'} 
                className="max-w-full max-h-64 rounded-lg shadow-lg object-contain border-2 border-gray-200"
                onError={(e) => {
                  // Try simple fallbacks: replace API_ROOT with origin, then try relative path
                  const img = e.target;
                  try {
                    if (img.dataset.tried === '1') {
                      img.style.display = 'none';
                      const msg = img.nextSibling;
                      if (msg) msg.style.display = 'block';
                      return;
                    }
                    img.dataset.tried = '1';
                    const src = img.getAttribute('src') || '';
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const apiRoot = API_ROOT || '';
                    if (apiRoot && src.startsWith(apiRoot)) {
                      img.src = src.replace(apiRoot, origin);
                      return;
                    }
                    if (origin && src.startsWith(origin)) {
                      const rel = src.replace(origin, '');
                      if (rel) { img.src = rel; return; }
                    }
                    if (src.startsWith('/')) { img.src = origin + src; return; }
                    img.style.display = 'none';
                    const msg = img.nextSibling;
                    if (msg) msg.style.display = 'block';
                  } catch (err) {
                    img.style.display = 'none';
                    const msg = img.nextSibling;
                    if (msg) msg.style.display = 'block';
                  }
                }}
              />
              <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded border border-red-200" style={{display: 'none'}}>
                ❌ Không thể tải ảnh. Kiểm tra lại đường dẫn URL.
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleUrlChange('')}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa ảnh"
            >
              🗑️
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-mono bg-white p-2 rounded border">
            {value}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Hướng dẫn:</strong> Upload ảnh từ máy tính hoặc nhập URL trực tiếp. 
          Kích thước khuyến nghị: 1920x600px (Hero), 800x600px (Thumbnail).
        </p>
      </div>
    </div>
  );
}
