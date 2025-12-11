import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';
import ImageUploadWithGuide from '../components/ImageUploadWithGuide';
import ModalPortal from '../components/ModalPortal';

const SliderManagement = () => {
  const [sliders, setSliders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    button_text: 'Khám phá ngay',
    button_style: 'primary',
    text_position: 'left',
    overlay_opacity: 60,
    media_type: 'image',
    video_url: '',
    image: '',
    link: '',
    category_id: '',
    order: 0,
    is_active: true
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { if (apiReady && typeof apiReady.then === 'function') await apiReady; } catch {}
      if (mounted) {
        fetchSliders();
        fetchCategories();
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const data = response.data.data || response.data;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSliders = async () => {
    try {
      const response = await api.get('/admin/sliders');
      setSliders(response.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/admin/sliders');
          setSliders(retry.data);
          return;
        } catch (e2) {
          console.error('Retry sliders failed:', e2);
        }
      }
      console.error('Error fetching sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submit started', formData);

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Append form fields
      submitData.append('title', formData.title);
      submitData.append('subtitle', formData.subtitle);
      submitData.append('description', formData.description || '');
      submitData.append('button_text', formData.button_text);
      submitData.append('button_style', formData.button_style);
      submitData.append('text_position', formData.text_position);
      submitData.append('overlay_opacity', formData.overlay_opacity);
      submitData.append('media_type', formData.media_type);
      submitData.append('video_url', formData.video_url || '');
      submitData.append('link', formData.link);
      submitData.append('category_id', formData.category_id || '');
      submitData.append('order', formData.order);
      submitData.append('is_active', formData.is_active ? '1' : '0'); // Convert boolean to string

      // Append image file if exists
      if (formData.image && formData.image instanceof File) {
        submitData.append('image', formData.image);
        console.log('Image file added:', formData.image.name, 'Size:', formData.image.size);
      } else {
        console.log('No image file to upload. formData.image:', formData.image);
      }

      // Setup progress callback
      const config = {};
      if (formData.image instanceof File) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        };
      }

      let response;
      if (editingSlider) {
        // For edit, use POST as defined in the API routes
        console.log('Updating slider:', editingSlider.id);
        response = await api.post(`/admin/sliders/${editingSlider.id}`, submitData, config);
      } else {
        console.log('Creating new slider');
        response = await api.post('/admin/sliders', submitData, config);
      }

      // If backend returned stored size, show it to user
      if (response?.data?.stored_size_human) {
        alert('Ảnh đã được lưu, kích thước sau nén: ' + response.data.stored_size_human);
      }

      console.log('Slider saved successfully');
      fetchSliders();
      resetForm();
    } catch (error) {
      console.error('Error saving slider:', error);
      alert('Có lỗi xảy ra khi lưu slider: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      ...slider,
      image: null // Reset image field for new upload
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa slider này?')) {
      try {
        await api.delete(`/admin/sliders/${id}`);
        fetchSliders();
      } catch (error) {
        console.error('Error deleting slider:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      button_text: 'Khám phá ngay',
      button_style: 'primary',
      text_position: 'left',
      overlay_opacity: 60,
      media_type: 'image',
      video_url: '',
      image: null,
      link: '',
      category_id: '',
      order: 0,
      is_active: true
    });
    setEditingSlider(null);
    setShowForm(false);
    setShowPreview(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Drag & Drop handlers
  const handleDragStart = (e, slider) => {
    setDraggedItem(slider);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetSlider) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetSlider.id) {
      setDraggedItem(null);
      return;
    }

    const newSliders = [...sliders];
    const draggedIndex = newSliders.findIndex(s => s.id === draggedItem.id);
    const targetIndex = newSliders.findIndex(s => s.id === targetSlider.id);

    // Remove dragged item and insert at new position
    const [removed] = newSliders.splice(draggedIndex, 1);
    newSliders.splice(targetIndex, 0, removed);

    // Update order values
    const updatedSliders = newSliders.map((slider, index) => ({
      ...slider,
      order: index
    }));

    setSliders(updatedSliders);
    setDraggedItem(null);

    // Save new order to backend
    try {
      await Promise.all(
        updatedSliders.map(slider => 
          api.post(`/admin/sliders/${slider.id}`, { 
            ...slider, 
            order: slider.order
          })
        )
      );
    } catch (error) {
      console.error('Error updating slider order:', error);
      fetchSliders(); // Reload on error
    }
  };

  const bulkToggleActive = async (active) => {
    if (!window.confirm(`Bạn có chắc muốn ${active ? 'bật' : 'tắt'} tất cả sliders?`)) return;
    
    try {
      await Promise.all(
        sliders.map(slider => 
          api.post(`/admin/sliders/${slider.id}`, { 
            ...slider, 
            is_active: active
          })
        )
      );
      fetchSliders();
    } catch (error) {
      console.error('Error bulk updating sliders:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Slider</h1>
          <p className="text-sm text-gray-600 mt-1">Kéo thả để sắp xếp thứ tự hiển thị</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => bulkToggleActive(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
          >
            Bật tất cả
          </button>
          <button
            onClick={() => bulkToggleActive(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
          >
            Tắt tất cả
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Thêm Slider
          </button>
        </div>
      </div>

      {showForm && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={resetForm}
          >
            {/* Modal: add horizontal margin, max-height and overflow so it never grows outside the viewport */}
            <div
              className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingSlider ? 'Sửa Slider' : 'Thêm Slider'}
                </h2>
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-brand-600 hover:text-brand-700"
                  >
                    {showPreview ? '📝 Chỉnh sửa' : '👁️ Xem trước'}
                  </button>
                )}
              </div>

              {showPreview && formData.image ? (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    {formData.media_type === 'video' && formData.video_url ? (
                      <video src={formData.video_url} autoPlay muted loop className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
                      style={{ opacity: formData.overlay_opacity / 100 }}
                    />
                    <div className={`absolute inset-0 flex flex-col justify-center ${
                      formData.text_position === 'center' ? 'items-center text-center px-8' :
                      formData.text_position === 'right' ? 'items-end text-right pr-8' :
                      'items-start text-left pl-8'
                    }`}>
                      <h3 className="text-2xl font-bold text-white mb-2">{formData.title || 'Tiêu đề'}</h3>
                      <p className="text-lg text-white/90 mb-2">{formData.subtitle || 'Phụ đề'}</p>
                      {formData.description && <p className="text-sm text-white/80 mb-3">{formData.description}</p>}
                      <button className={`px-6 py-2 rounded-full font-medium ${
                        formData.button_style === 'secondary' ? 'bg-white text-brand-600' :
                        formData.button_style === 'outline' ? 'bg-transparent border-2 border-white text-white' :
                        'bg-brand-500 text-white'
                      }`}>
                        {formData.button_text}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại media
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="media_type"
                          value="image"
                          checked={formData.media_type === 'image'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm">Hình ảnh</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="media_type"
                          value="video"
                          checked={formData.media_type === 'video'}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm">Video</span>
                      </label>
                    </div>
                  </div>

                  {formData.media_type === 'image' ? (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hình ảnh *
                      </label>
                      <ImageUploadWithGuide
                        value={formData.image}
                        onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                        guideType="slider"
                        placeholder="Chọn hình ảnh slider..."
                        previewSize="w-full h-48"
                      />
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Video *
                      </label>
                      <input
                        type="text"
                        name="video_url"
                        value={formData.video_url}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Sơn Công Nghiệp Alkana"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phụ đề
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Chất lượng quốc tế"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả chi tiết
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Giải pháp sơn chuyên nghiệp..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text nút CTA
                    </label>
                    <input
                      type="text"
                      name="button_text"
                      value={formData.button_text}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kiểu nút
                    </label>
                    <select
                      name="button_style"
                      value={formData.button_style}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="primary">Primary (Brand)</option>
                      <option value="secondary">Secondary (White)</option>
                      <option value="outline">Outline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vị trí text
                    </label>
                    <select
                      name="text_position"
                      value={formData.text_position}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="left">Trái</option>
                      <option value="center">Giữa</option>
                      <option value="right">Phải</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ tối overlay ({formData.overlay_opacity}%)
                    </label>
                    <input
                      type="range"
                      name="overlay_opacity"
                      value={formData.overlay_opacity}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục sản phẩm
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">-- Không chọn --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Nếu chọn danh mục, nút sẽ link đến trang sản phẩm theo danh mục</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Liên kết
                    </label>
                    <input
                      type="text"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="/san-pham"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thứ tự
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Kích hoạt ngay</span>
                    </label>
                  </div>

                  {/* Footer */}
                  <div className="col-span-2 flex justify-end space-x-2 sticky bottom-0 bg-white py-4 mt-4 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 font-medium"
                    >
                      {editingSlider ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                  </div>
                </form>
              )}
          </div>
        </div>
        </ModalPortal>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hình ảnh
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nội dung
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cấu hình
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thứ tự
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sliders.map((slider) => (
              <tr 
                key={slider.id}
                draggable
                onDragStart={(e) => handleDragStart(e, slider)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slider)}
                className={`hover:bg-gray-50 cursor-move transition-colors ${
                  draggedItem?.id === slider.id ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden shadow-sm group">
                    {slider.media_type === 'video' && slider.video_url ? (
                      <>
                        <video src={slider.video_url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img
                        src={slider.image}
                        alt={slider.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{slider.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{slider.subtitle}</div>
                    {slider.description && (
                      <div className="text-xs text-gray-400 line-clamp-1 mt-1">{slider.description}</div>
                    )}
                    {slider.link && (
                      <div className="text-xs text-brand-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {slider.link}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        slider.button_style === 'primary' ? 'bg-brand-100 text-brand-700' :
                        slider.button_style === 'secondary' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {slider.button_text || 'Khám phá'}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      Vị trí: <span className="font-medium">{
                        slider.text_position === 'left' ? 'Trái' :
                        slider.text_position === 'center' ? 'Giữa' : 'Phải'
                      }</span>
                    </div>
                    <div className="text-gray-500">
                      Overlay: <span className="font-medium">{slider.overlay_opacity}%</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                    {slider.order}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${slider.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {slider.is_active ? '✓ Hiển thị' : '✕ Ẩn'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(slider)}
                      className="text-brand-600 hover:text-brand-900 hover:bg-brand-50 px-3 py-1 rounded"
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(slider.id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sliders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Chưa có slider nào</p>
            <p className="text-gray-400 text-sm mt-1">Nhấn "Thêm Slider" để tạo slider đầu tiên</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderManagement;