import React, { useState } from 'react';
import ImageUpload from '../admin/components/ImageUpload';
import MultiImageUpload from '../admin/components/MultiImageUpload';

const TestImageUpload = () => {
  const [singleImage, setSingleImage] = useState('');
  const [multipleImages, setMultipleImages] = useState([]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Image Upload Components</h1>
      
      {/* Single Image Upload */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Single Image Upload</h2>
        <p className="text-gray-600 mb-4">Dùng cho: Slider, Project, Post thumbnail</p>
        
        <ImageUpload
          value={singleImage}
          onChange={setSingleImage}
          placeholder="Chọn hình ảnh đại diện..."
          previewSize="w-48 h-32"
        />
        
        {singleImage && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Image URL: {singleImage.substring(0, 50)}...</p>
          </div>
        )}
      </div>

      {/* Multiple Image Upload */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Multiple Image Upload</h2>
        <p className="text-gray-600 mb-4">Dùng cho: Product gallery, Project gallery</p>
        
        <MultiImageUpload
          images={multipleImages}
          onChange={setMultipleImages}
          maxImages={5}
        />
        
        {multipleImages.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              Đã chọn {multipleImages.length} hình ảnh
            </p>
          </div>
        )}
      </div>

      {/* Usage Examples */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Cách sử dụng:</h3>
        <div className="space-y-2 text-sm">
          <div><strong>ImageUpload:</strong> Slider, Project thumbnail, Post thumbnail</div>
          <div><strong>MultiImageUpload:</strong> Product gallery (khi cần nhiều ảnh)</div>
          <div><strong>Features:</strong> Preview, Remove, File validation, Size limit 5MB</div>
        </div>
      </div>
    </div>
  );
};

export default TestImageUpload;