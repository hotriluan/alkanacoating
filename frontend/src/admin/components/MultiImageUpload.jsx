import React, { useState, useRef } from 'react';
import { IMAGE_GUIDES } from './ImageUploadWithGuide';

const MultiImageUpload = ({ 
  images = [], 
  onChange, 
  maxImages = 10,
  className = "",
  guideType = 'product_gallery'
}) => {
  const [uploading, setUploading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const fileInputRef = useRef(null);

  const guide = IMAGE_GUIDES[guideType] || IMAGE_GUIDES.product_gallery;
  const maxBytesFromGuide = parseFloat(guide.maxSize) * 1024 * 1024;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed max limit
    if (images.length + files.length > maxImages) {
      alert(`Chỉ có thể upload tối đa ${maxImages} hình ảnh!`);
      return;
    }

    try {
      setUploading(true);
      const newImages = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} không phải là hình ảnh!`);
          continue;
        }

        // Validate file size
        if (file.size > maxBytesFromGuide) {
          alert(`File ${file.name} quá lớn! Vui lòng chọn file nhỏ hơn ${guide.maxSize}.`);
          continue;
        }

        // Create preview
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = (e) => {
            newImages.push({
              id: Date.now() + Math.random(),
              url: e.target.result,
              file: file,
              name: file.name
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      // Update images array
      onChange([...images, ...newImages]);

    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Có lỗi khi upload hình ảnh!');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (imageId) => {
    onChange(images.filter(img => img.id !== imageId));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-1">{guide.title}</h4>
              <p className="text-sm text-blue-800 mb-2">{guide.description}</p>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white rounded p-2 border border-blue-100">
                  <span className="text-blue-600 font-semibold">📏 Kích thước:</span>
                  <div className="font-mono text-blue-900">{guide.recommended}</div>
                </div>
                <div className="bg-white rounded p-2 border border-blue-100">
                  <span className="text-blue-600 font-semibold">⚖️ Dung lượng:</span>
                  <div className="font-mono text-blue-900">Max {guide.maxSize}</div>
                </div>
                <div className="bg-white rounded p-2 border border-blue-100">
                  <span className="text-blue-600 font-semibold">🖼️ Số lượng:</span>
                  <div className="font-mono text-blue-900">Max {maxImages} ảnh</div>
                </div>
              </div>

              {guide.tips && guide.tips.length > 0 && (
                <div className="mt-2 bg-white rounded p-2 border border-blue-100">
                  <span className="text-blue-600 font-semibold text-xs">✨ Lưu ý:</span>
                  <ul className="mt-1 space-y-0.5 text-xs text-blue-800">
                    {guide.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-blue-400">•</span>
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
        multiple
      />

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading || images.length >= maxImages}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-500 focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center justify-center py-6">
          <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-sm text-gray-600 mb-1">
            {uploading ? 'Đang upload...' : `Thêm ảnh (${images.length}/${maxImages})`}
          </span>
          <span className="text-xs text-gray-400">
            {guide.recommended} • Max {guide.maxSize} • PNG, JPG, WEBP
          </span>
        </div>
      </button>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-brand-500 text-white text-xs text-center py-1 rounded-b-lg">
                  Ảnh chính
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;