import React from 'react';

const JsonFileUploader = ({ onUploadSuccess, existing }) => {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const fileInputRef = React.useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Lỗi: Vui lòng chọn một tệp JSON hợp lệ.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('json', file);

    try {
      const response = await api.post('/admin/settings/upload-analytics-json', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(response.data.message || 'Tải lên thành công!');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải tệp lên.');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-800">Tệp JSON xác thực</h4>
          <p className="text-xs text-gray-500 mt-1">
            Tải lên tệp `service-account-credentials.json` bạn đã tạo từ Google Cloud.
          </p>
        </div>
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          disabled={uploading}
        />
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={uploading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {uploading ? 'Đang tải lên...' : '📁 Chọn tệp...'}
        </button>
      </div>

      <div className="mt-3 text-sm">
        {existing ? (
          <div className="text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            ✓ Đã tồn tại tệp xác thực trên máy chủ. Tải lên tệp mới sẽ ghi đè lên tệp cũ.
          </div>
        ) : (
          <div className="text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
            ✗ Chưa có tệp xác thực nào được tải lên.
          </div>
        )}
      </div>
      
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </div>
  );
};

export default JsonFileUploader;
