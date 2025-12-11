import React, { useState, useRef, useEffect } from 'react';
import { API_ROOT } from '../../services/api';

/**
 * Image upload guides for different contexts
 */
const IMAGE_GUIDES = {
  slider: {
    title: 'Slider Trang chủ',
    recommended: '1920×1080px',
    ratio: '16:9',
    description: 'Hero banner toàn màn hình, nên dùng ảnh ngang chất lượng cao',
    maxSize: '8MB',
    tips: [
      'Tối ưu để hiển thị trên màn hình rộng',
      'Nội dung quan trọng nên ở giữa (safe zone)',
      'Tránh text quá nhỏ, khó đọc trên mobile'
    ]
  },
  product_thumbnail: {
    title: 'Ảnh đại diện Sản phẩm',
    recommended: '800×800px',
    ratio: '1:1 (vuông)',
    description: 'Ảnh chính hiển thị trong danh sách và chi tiết sản phẩm',
    maxSize: '8MB',
    tips: [
      'Ảnh vuông để hiển thị đồng đều trong grid',
      'Nền trắng hoặc trong suốt tốt nhất',
      'Sản phẩm chiếm 80% khung hình'
    ]
  },
  product_gallery: {
    title: 'Ảnh Gallery Sản phẩm',
    recommended: '1200×800px',
    ratio: '3:2',
    description: 'Ảnh phụ hiển thị trong gallery chi tiết sản phẩm (tối đa 10 ảnh)',
    maxSize: '8MB',
    tips: [
      'Chụp sản phẩm từ nhiều góc độ',
      'Có thể dùng ảnh ngang hoặc dọc',
      'Hình ảnh rõ nét, đủ sáng'
    ]
  },
  project_thumbnail: {
    title: 'Ảnh đại diện Dự án',
    recommended: '1200×800px',
    ratio: '3:2',
    description: 'Ảnh chính của dự án trong danh sách và header trang chi tiết',
    maxSize: '8MB',
    tips: [
      'Ảnh toàn cảnh công trình hoàn thiện',
      'Chụp trong điều kiện ánh sáng tốt',
      'Tránh ảnh quá tối hoặc quá sáng'
    ]
  },
  project_gallery: {
    title: 'Ảnh Gallery Dự án',
    recommended: '1200×800px',
    ratio: '3:2 (hoặc 16:9)',
    description: 'Ảnh chi tiết công trình, thi công, kết quả',
    maxSize: '8MB',
    tips: [
      'Thể hiện quá trình thi công từ đầu đến cuối',
      'Chụp cận cảnh chi tiết chất lượng sơn',
      'Before-After nếu có'
    ]
  },
  post_thumbnail: {
    title: 'Ảnh đại diện Bài viết',
    recommended: '1200×630px',
    ratio: '1.91:1 (OG Image)',
    description: 'Ảnh đại diện hiển thị trong danh sách và khi share social',
    maxSize: '8MB',
    tips: [
      'Tuân thủ tỉ lệ OG:Image cho Facebook/Twitter',
      'Text overlay (nếu có) rõ ràng, dễ đọc',
      'Ảnh liên quan trực tiếp đến nội dung bài viết'
    ]
  },
  category_thumbnail: {
    title: 'Ảnh Danh mục Sản phẩm',
    recommended: '600×400px',
    ratio: '3:2',
    description: 'Icon/ảnh đại diện cho danh mục sản phẩm',
    maxSize: '8MB',
    tips: [
      'Đơn giản, dễ nhận biết',
      'Icon hoặc hình minh họa sản phẩm đại diện',
      'Màu sắc nổi bật'
    ]
  },
  logo: {
    title: 'Logo',
    recommended: '512×512px',
    ratio: '1:1',
    description: 'Logo công ty, nên dùng PNG với nền trong suốt',
    maxSize: '8MB',
    tips: [
      'Nền trong suốt (PNG)',
      'Vector hoặc độ phân giải cao',
      'Tỉ lệ 1:1 hoặc có thể crop vuông'
    ]
  },
  favicon: {
    title: 'Favicon',
    recommended: '64×64px',
    ratio: '1:1',
    description: 'Icon nhỏ hiển thị trên tab trình duyệt',
    maxSize: '8MB',
    tips: [
      'Icon đơn giản, dễ nhận biết ở kích thước nhỏ',
      'Nên dùng PNG hoặc ICO',
      'Màu sắc tương phản rõ ràng'
    ]
  },
  og_image: {
    title: 'OG Image (Social Share)',
    recommended: '1200×630px',
    ratio: '1.91:1',
    description: 'Ảnh hiển thị khi share link lên Facebook, Twitter,...',
    maxSize: '8MB',
    tips: [
      'Tuân thủ chuẩn Open Graph',
      'Text (nếu có) nằm trong safe zone 1200×600',
      'Không dùng ảnh có border/watermark'
    ]
  },
  recruitment_image: {
    title: 'Ảnh Tuyển dụng',
    recommended: '1200×800px',
    ratio: '3:2',
    description: 'Ảnh minh họa cho tin tuyển dụng',
    maxSize: '8MB',
    tips: [
      'Ảnh môi trường làm việc, đội ngũ',
      'Chuyên nghiệp, thân thiện',
      'Tránh ảnh stock quá chung chung'
    ]
  }
};

const ImageUploadWithGuide = ({
  value,
  onChange,
  guideType = 'product_thumbnail',
  placeholder,
  className = "",
  previewSize = "w-32 h-32"
}) => {
  // Helper to build absolute URL for existing image paths
  const resolvePreview = (val) => {
    if (!val) return '';
    // If a File instance
    if (typeof File !== 'undefined' && val instanceof File) {
      try {
        return URL.createObjectURL(val);
      } catch {
        return '';
      }
    }
    // If already a data URL or absolute URL
    if (typeof val === 'string') {
      if (val.startsWith('data:') || /^https?:\/\//i.test(val)) return val;
  // Normalize relative path coming from backend (e.g., "uploads/products/abc.jpg")
  const base = API_ROOT;
  const normalized = val.replace(/^\/+/, '');
  return `${base}/${normalized}`;
    }
    return '';
  };

  const [preview, setPreview] = useState(resolvePreview(value));
  const [uploading, setUploading] = useState(false);
  const [fileSizeHuman, setFileSizeHuman] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const fileInputRef = useRef(null);

  const guide = IMAGE_GUIDES[guideType] || IMAGE_GUIDES.product_thumbnail;

  // Convert maxSize string to bytes
  const maxBytesFromGuide = parseFloat(guide.maxSize) * 1024 * 1024;
  
  // Keep preview in sync when value prop changes (e.g., khi Sửa sản phẩm)
  useEffect(() => {
    setPreview(resolvePreview(value));
    // Reset size hint khi dùng ảnh có sẵn từ server
    setFileSizeHuman(null);
  }, [value]);

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh!');
      return;
    }

    // Validate file size
    if (file.size > maxBytesFromGuide) {
      alert(`File quá lớn! Vui lòng chọn file nhỏ hơn ${guide.maxSize}.`);
      return;
    }

    try {
      setUploading(true);
      setFileSizeHuman(`${(file.size / 1024 / 1024).toFixed(2)} MB`);

      // Create preview
      const objectUrl = resolvePreview(file);
      setPreview(objectUrl);
      onChange(file);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Có lỗi khi upload hình ảnh!');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Try sensible alternate URLs when preview fails to load:
  // 1) Replace API_ROOT with window.location.origin
  // 2) Try the relative path (remove origin)
  // If all fail, hide image and let the error box show.
  const handleImgError = (e) => {
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
      const apiRoot = (typeof API_ROOT !== 'undefined' && API_ROOT) ? API_ROOT : '';

      // If the src starts with API_ROOT, try replacing with origin
      if (apiRoot && src.startsWith(apiRoot)) {
        const alt = src.replace(apiRoot, origin);
        img.src = alt;
        return;
      }

      // If src starts with origin, try the relative path
      if (origin && src.startsWith(origin)) {
        const rel = src.replace(origin, '');
        if (rel) {
          img.src = rel;
          return;
        }
      }

      // If src is absolute URL or other, try prefixing origin
      if (src.startsWith('/')) {
        img.src = origin + src;
        return;
      }

      img.style.display = 'none';
      const msg = img.nextSibling;
      if (msg) msg.style.display = 'block';
    } catch (err) {
      img.style.display = 'none';
      const msg = img.nextSibling;
      if (msg) msg.style.display = 'block';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Guide Toggle */}
      <button
        type="button"
        onClick={() => setShowGuide(!showGuide)}
        className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
      >
        {showGuide ? '▼' : '▶'} Hướng dẫn tải ảnh {guide.title}
      </button>

      {/* Guide Box */}
      {showGuide && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-2">{guide.title}</h4>
              <p className="text-sm text-blue-800 mb-3">{guide.description}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-blue-600 font-semibold">📏 Kích thước:</span>
                  <div className="font-mono text-blue-900 mt-1">{guide.recommended}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-blue-600 font-semibold">📐 Tỉ lệ:</span>
                  <div className="font-mono text-blue-900 mt-1">{guide.ratio}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-blue-600 font-semibold">⚖️ Dung lượng:</span>
                  <div className="font-mono text-blue-900 mt-1">Max {guide.maxSize}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-blue-600 font-semibold">📁 Định dạng:</span>
                  <div className="font-mono text-blue-900 mt-1">JPG, PNG, WEBP</div>
                </div>
              </div>

              {guide.tips && guide.tips.length > 0 && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-blue-100">
                  <span className="text-blue-600 font-semibold text-sm">✨ Lưu ý:</span>
                  <ul className="mt-2 space-y-1 text-sm text-blue-800">
                    {guide.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-500 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center justify-center py-4">
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-sm text-gray-600">
            {uploading ? 'Đang upload...' : (placeholder || `Chọn hình ${guide.title.toLowerCase()}...`)}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {guide.recommended} • Max {guide.maxSize} • PNG, JPG, WEBP
          </span>
        </div>
      </button>

      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className={`${previewSize} object-cover rounded-lg border border-gray-200`}
            onError={handleImgError}
          />
          <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded border border-red-200" style={{display: 'none'}}>
            ❌ Không thể tải ảnh. Kiểm tra lại đường dẫn URL.
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Kích thước file: {fileSizeHuman || '—'}
          </div>
          {uploading && (
            <div className="mt-1 text-xs text-brand-600">Đang xử lý...</div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWithGuide;
export { IMAGE_GUIDES };
