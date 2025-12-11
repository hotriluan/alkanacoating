import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';
import { API_ROOT } from '../../services/api';
import RichTextEditor from '../components/RichTextEditor';
import ImageUploadWithGuide from '../components/ImageUploadWithGuide';
import MultiImageUpload from '../components/MultiImageUpload';
import ModalPortal from '../components/ModalPortal';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    // Basic info
    title: '',
    slug: '',
    description: '',
    short_description: '',
    image: '',
    
    // Client & project details
    client: '',
    location: '',
    start_date: '',
    end_date: '',
    budget_range: '',
    project_type: '',
    
    // Progress & features
    progress_percentage: 0,
    features: [],
    video_url: '',
    is_video_visible: true,
    
    // SEO
    meta_title: '',
    meta_description: '',
    
    // Status
    status: 'published',
    is_published: true,
    is_featured: false,
    order: 0,
    
    // Images and testimonials
    project_images: [],
    testimonials: []
  });

  const projectTypes = [
    'Công nghiệp',
    'Dân dụng', 
    'Hạ tầng',
    'Thương mại',
    'Y tế',
    'Giáo dục',
    'Khách sạn & Resort',
    'Nhà xưởng',
    'Chung cư',
    'Biệt thự'
  ];

  const budgetRanges = [
    'Dưới 500 triệu',
    '500 triệu - 1 tỷ',
    '1 - 5 tỷ',
    '5 - 10 tỷ',
    'Trên 10 tỷ',
    'Thỏa thuận'
  ];

  const steps = [
    { id: 1, title: 'Thông tin cơ bản', icon: '📝' },
    { id: 2, title: 'Chi tiết dự án', icon: '🏗️' },
    { id: 3, title: 'Hình ảnh', icon: '📸' },
    { id: 4, title: 'SEO & Xuất bản', icon: '🚀' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Ensure dev auto-login completes to avoid 401 on first load
        if (apiReady && typeof apiReady.then === 'function') {
          await apiReady;
        }
      } catch (e) {
        // no-op; we'll still attempt the fetch
      }
      if (mounted) {
        fetchProjects();
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/admin/projects');
      // Support both plain arrays and Laravel pagination objects
      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.data || []);
      setProjects(list);
    } catch (error) {
      // If unauthorized, attempt dev auto-login once and retry
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/admin/projects');
          const list = Array.isArray(retry.data)
            ? retry.data
            : (retry.data?.data || []);
          setProjects(list);
          return;
        } catch (e2) {
          console.error('Retry fetch projects failed:', e2);
        }
      }
      console.error('Error fetching projects:', error);
      alert('Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only allow submit on the final step
    if (currentStep !== steps.length) {
      console.log('Submit blocked: not on final step');
      return;
    }
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add basic fields
      Object.keys(formData).forEach(key => {
        if (key === 'project_images' || key === 'testimonials') return;
        
        const value = formData[key];
        if ((typeof value === 'boolean') || (value !== null && value !== undefined && value !== '')) {
          if (Array.isArray(value)) {
            submitData.append(key, JSON.stringify(value));
          } else if (typeof value === 'boolean') {
            submitData.append(key, value ? '1' : '0');
          } else {
            submitData.append(key, value);
          }
        }
      });
      
      // Ensure status is synced with is_published
      const finalStatus = formData.is_published ? 'published' : 'draft';
      submitData.set('status', finalStatus);

      // Add images - send all images including new files and existing image IDs
      formData.project_images.forEach((image, index) => {
        // If it's a new file, append the file object
        if (image.file) {
          submitData.append(`project_images[${index}][file]`, image.file);
        }
        // If it's an existing image, append its ID
        if (image.id) {
          submitData.append(`project_images[${index}][id]`, image.id);
        }
        // Append metadata for both new and existing images
        submitData.append(`project_images[${index}][image_type]`, image.image_type || 'gallery');
        submitData.append(`project_images[${index}][caption]`, image.caption || '');
        submitData.append(`project_images[${index}][alt_text]`, image.alt_text || '');
        submitData.append(`project_images[${index}][sort_order]`, (image.sort_order ?? (index + 1)).toString());
      });

      let response;
      if (editingProject) {
        submitData.append('_method', 'PUT');
        
        // Log what we're sending for debugging
        console.log('Updating project with data:');
        for (let pair of submitData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
        
        response = await api.post(`/admin/projects/${editingProject.id}`, submitData);
      } else {
        // Log what we're sending for debugging (create)
        console.log('Creating project with data:');
        for (let pair of submitData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
        response = await api.post('/admin/projects', submitData);
      }

      console.log('Project saved successfully:', response.data);
      fetchProjects();
      resetForm();
      alert(editingProject ? 'Dự án đã được cập nhật!' : 'Dự án đã được tạo!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Có lỗi xảy ra khi lưu dự án: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = async (project) => {
    setEditingProject(project);

    // Parse features if it's a JSON string
    let parsedFeatures = [];
    if (project.features) {
      if (typeof project.features === 'string') {
        try {
          parsedFeatures = JSON.parse(project.features);
        } catch (e) {
          parsedFeatures = [];
        }
      } else if (Array.isArray(project.features)) {
        parsedFeatures = project.features;
      }
    }

    // Fetch full project with images for preview
    let existingGallery = [];
    try {
      const res = await api.get(`/admin/projects/${project.id}`);
      const full = res.data || {};
      project = { ...project, ...full };
      existingGallery = Array.isArray(full.images)
        ? full.images.map((img) => ({ id: img.id || img.image_url, url: resolveAssetUrl(img.image_url) }))
        : [];
    } catch (_) {
      existingGallery = [];
    }

    setFormData({
      // Basic info
      title: project.title || '',
      slug: project.slug || '',
  description: project.description || '',
      short_description: project.short_description || '',
  image: (project.thumbnail || project.image || ''),
      
      // Client & project details
      client: project.client || '',
      location: project.location || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      budget_range: project.budget_range || '',
      project_type: project.project_type || '',
      
      // Progress & features
      progress_percentage: project.progress_percentage || 0,
      features: parsedFeatures,
      video_url: project.video_url || '',
      is_video_visible: project.is_video_visible !== undefined ? project.is_video_visible : !!project.video_url,
      
      // SEO
      meta_title: project.meta_title || '',
      meta_description: project.meta_description || '',
      
      // Status
      status: project.status || 'published',
      is_published: project.is_published !== undefined ? project.is_published : true,
      is_featured: project.is_featured || false,
      order: project.order || 0,
      
      // Images and testimonials
      project_images: existingGallery,
      testimonials: project.testimonials || []
    });
    setCurrentStep(1);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này? Tất cả hình ảnh và đánh giá liên quan cũng sẽ bị xóa.')) {
      try {
        await api.delete(`/admin/projects/${id}`);
        fetchProjects();
        alert('Dự án đã được xóa!');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Có lỗi xảy ra khi xóa dự án');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      short_description: '',
      image: '',
      client: '',
      location: '',
      start_date: '',
      end_date: '',
      budget_range: '',
      project_type: '',
      progress_percentage: 0,
      features: [],
      video_url: '',
      is_video_visible: true,
      meta_title: '',
      meta_description: '',
      status: 'published',
      is_published: true,
      is_featured: false,
      order: 0,
      project_images: [],
      testimonials: []
    });
    setEditingProject(null);
    setCurrentStep(1);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const nextStep = (e) => {
    if (e) e.preventDefault();
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e) => {
    if (e) e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title && !editingProject) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, editingProject]);

  // Auto-generate meta_title if empty (only for new projects, not when editing)
  useEffect(() => {
    if (formData.title && !formData.meta_title && !editingProject) {
      setFormData(prev => ({ 
        ...prev, 
        meta_title: `${formData.title} - Dự án sơn chuyên nghiệp | Alkana Coating` 
      }));
    }
  }, [formData.title, formData.meta_title, editingProject]);

  // Helper: resolve absolute URL for images from backend
  const resolveAssetUrl = (path) => {
    if (!path) return '';
    if (typeof path === 'string' && /^https?:\/\//i.test(path)) return path;
    const base = API_ROOT || api.defaults.baseURL?.replace('/api', '') || 'https://hotriluan.xyz';
    const normalized = ('' + path).replace(/^\/+/, '');
    return `${base}/${normalized}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      project.title?.toLowerCase().includes(search) ||
      project.slug?.toLowerCase().includes(search) ||
      project.client?.toLowerCase().includes(search) ||
      project.location?.toLowerCase().includes(search) ||
      project.project_type?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Dự án</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng số: {filteredProjects.length} dự án</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <svg 
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
          >
            Thêm Dự án
          </button>
        </div>
      </div>

      {showForm && (
        <ModalPortal>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={resetForm}
          >
            <div
              className="bg-white rounded-lg w-full max-w-4xl mx-4 h-[88vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingProject ? 'Sửa Dự án' : 'Thêm Dự án'}
                </h2>
                
                {/* Step Indicator */}
                <div className="flex items-center justify-between mt-4">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        currentStep === step.id
                          ? 'bg-brand-500 text-white'
                          : currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step.id ? '✓' : step.id}
                      </div>
                      <div className="ml-2 text-sm">
                        <div className="font-medium">{step.icon} {step.title}</div>
                      </div>
                      {step.id < steps.length && (
                        <div className={`w-16 h-1 mx-4 ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                  {/* Step 1: Basic Info */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề dự án *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Ví dụ: Sơn nhà máy ABC"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slug (URL)
                          </label>
                          <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="son-nha-may-abc"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả ngắn *
                        </label>
                        <textarea
                          name="short_description"
                          value={formData.short_description}
                          onChange={handleInputChange}
                          rows={3}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Mô tả ngắn gọn về dự án (hiển thị trong danh sách)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả chi tiết
                        </label>
                        <RichTextEditor
                            value={formData.description}
                            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                            placeholder="Mô tả chi tiết về dự án, quy trình thực hiện..."
                            height="200px"
                          />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hình ảnh chính
                        </label>
                        <ImageUploadWithGuide
                          value={formData.image}
                          onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                          guideType="project_thumbnail"
                          placeholder="Chọn hình ảnh đại diện cho dự án..."
                          previewSize="w-full h-48"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Project Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Khách hàng
                          </label>
                          <input
                            type="text"
                            name="client"
                            value={formData.client || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Tên công ty hoặc cá nhân"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa điểm
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Thành phố, tỉnh"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày bắt đầu
                          </label>
                          <input
                            type="date"
                            name="start_date"
                            value={formData.start_date || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày hoàn thành
                          </label>
                          <input
                            type="date"
                            name="end_date"
                            value={formData.end_date || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại dự án
                          </label>
                          <input
                            type="text"
                            name="project_type"
                            value={formData.project_type || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="VD: Công nghiệp, Dân dụng, Thương mại..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngân sách
                          </label>
                          <input
                            type="text"
                            name="budget_range"
                            value={formData.budget_range || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="VD: 500 triệu - 1 tỷ, Thỏa thuận..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiến độ hoàn thành ({formData.progress_percentage || 0}%)
                        </label>
                        <input
                          type="range"
                          name="progress_percentage"
                          value={formData.progress_percentage || 0}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video (YouTube/Vimeo URL)
                        </label>
                        <input
                          type="url"
                          name="video_url"
                          value={formData.video_url || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            name="is_video_visible"
                            checked={formData.is_video_visible}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Hiển thị video trên trang chi tiết</span>
                        </label>
                      </div>

                      {/* Features */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Đặc điểm nổi bật
                          </label>
                          <button
                            type="button"
                            onClick={addFeature}
                            className="text-sm bg-brand-100 text-brand-600 px-2 py-1 rounded hover:bg-brand-200"
                          >
                            + Thêm
                          </button>
                        </div>
                        {(Array.isArray(formData.features) ? formData.features : []).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => handleFeatureChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                              placeholder="Ví dụ: Sử dụng sơn cao cấp Nippon Paint"
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Images */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Gallery & Hình ảnh dự án</h3>
                        <MultiImageUpload
                          images={formData.project_images}
                          onChange={(images) => setFormData(prev => ({ ...prev, project_images: images }))}
                          maxImages={20}
                          guideType="project_gallery"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: SEO & Publish */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Title (SEO)
                        </label>
                        <input
                          type="text"
                          name="meta_title"
                          value={formData.meta_title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Tiêu đề hiển thị trên Google"
                        />
                        <p className="text-xs text-gray-500 mt-1">Độ dài tối ưu: 50-60 ký tự</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description (SEO)
                        </label>
                        <textarea
                          name="meta_description"
                          value={formData.meta_description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm Google"
                        />
                        <p className="text-xs text-gray-500 mt-1">Độ dài tối ưu: 150-160 ký tự</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="published">Đã xuất bản</option>
                            <option value="draft">Bản nháp</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thứ tự hiển thị
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
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Dự án nổi bật</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Xuất bản công khai</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between sticky bottom-0 z-10">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        ← Quay lại
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Hủy
                    </button>
                    
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                      >
                        Tiếp tục →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                      >
                        {editingProject ? '✓ Cập nhật dự án' : '✓ Tạo dự án'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hình ảnh
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dự án
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng & Loại
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiến độ
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lượt xem
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap">
                  {project.thumbnail || project.image ? (
                    <img
                      src={resolveAssetUrl(project.thumbnail || project.image)}
                      alt={project.title}
                      className="h-12 w-20 object-cover rounded shadow-sm"
                      onError={(e)=>{ e.currentTarget.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="100"%3E%3Crect fill="%23f3f4f6" width="160" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📷%3C/text%3E%3C/svg%3E' }}
                    />
                  ) : (
                    <div className="h-12 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">📷</span>
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{project.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {project.short_description || project.description}
                  </div>
                  {project.is_featured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                      ⭐
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {project.client || 'Chưa cập nhật'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {project.project_type && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 truncate">
                        {project.project_type}
                      </span>
                    )}
                  </div>
                  {project.location && (
                    <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                      📍 {project.location}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {project.progress_percentage || 0}%
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'published' && project.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status === 'published' && project.is_published ? '✅ Đã xuất bản' : '⏳ Nháp'}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                  👁️ {project.view_count || 0}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-brand-600 hover:text-brand-900 text-xs bg-brand-50 px-2 py-1 rounded"
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
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
      </div>
    </div>
  );
};

export default ProjectManagement;
