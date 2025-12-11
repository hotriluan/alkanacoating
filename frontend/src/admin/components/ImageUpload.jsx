import React, { useState, useRef } from 'react';

const ImageUpload = ({
  value,
  onChange,
  placeholder = "Chọn hình ảnh...",
  className = "",
  multiple = false,
  previewSize = "w-32 h-32",
  // max bytes allowed on client (default 16MB)
  maxBytes = 16 * 1024 * 1024,
  // soft warn threshold in bytes (e.g., 8MB)
  warnBytes = 8 * 1024 * 1024,
  // callback to receive upload progress (0-100)
  onProgress = null
}) => {
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileSizeHuman, setFileSizeHuman] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh!');
      return;
    }

    // Validate file size (client-side max)
    if (file.size > maxBytes) {
      alert(`File quá lớn! Vui lòng chọn file nhỏ hơn ${Math.round(maxBytes / 1024 / 1024)}MB.`);
      return;
    }

    // Show soft warning for large files
    if (file.size > warnBytes) {
      if (!window.confirm(`File lớn (${(file.size / 1024 / 1024).toFixed(2)}MB). Hệ thống sẽ tự động nén nếu cần. Tiếp tục?`)) {
        return;
      }
    }

    try {
      setUploading(true);
      setProgress(0);
      setFileSizeHuman(`${(file.size / 1024 / 1024).toFixed(2)} MB`);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setPreview(imageUrl);
        onChange(file); // Pass the File object, not base64
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Có lỗi khi upload hình ảnh!');
    } finally {
      setUploading(false);
      setProgress(0);
      if (onProgress) onProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange(null); // Pass null instead of empty string
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        multiple={multiple}
      />

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-500 focus:outline-none focus:border-brand-500 transition-colors"
      >
        <div className="flex flex-col items-center justify-center py-4">
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-sm text-gray-600">
            {uploading ? 'Đang upload...' : placeholder}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF, WEBP tối đa {Math.round(maxBytes / 1024 / 1024)}MB
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
          />
          <div className="mt-1 text-xs text-gray-500">Kích thước: {fileSizeHuman || '—'}</div>
          {uploading && (
            <div className="w-full bg-gray-100 rounded mt-2 overflow-hidden">
              <div style={{ width: `${progress}%` }} className="h-2 bg-brand-500"></div>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;