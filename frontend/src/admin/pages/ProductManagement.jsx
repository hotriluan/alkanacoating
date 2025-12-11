import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth, API_ROOT } from '../../services/api';
import RichTextEditor from '../components/RichTextEditor';
import ImageUploadWithGuide from '../components/ImageUploadWithGuide';
import MultiImageUpload from '../components/MultiImageUpload';
import ModalPortal from '../components/ModalPortal';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    slug: '',
    category_id: '',
    description: '',
    thumbnail: '',
    
    // Detailed content
    content: '',
    features: '',
    applications: '',
    technical_specs: '',
    
    // Images
    product_images: [],
    
    // SEO & Publishing
    meta_title: '',
    meta_description: '',
    is_active: true,
    is_featured: false,
    order: 0
  });

  const steps = [
    { id: 1, title: 'Thông tin cơ bản', icon: '📝' },
    { id: 2, title: 'Nội dung chi tiết', icon: '📄' },
    { id: 3, title: 'Hình ảnh & Media', icon: '📸' },
    { id: 4, title: 'SEO & Xuất bản', icon: '🚀' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (apiReady && typeof apiReady.then === 'function') {
          await apiReady;
        }
      } catch (e) {
        // no-op
      }
      if (mounted) {
        fetchProducts();
        fetchCategories();
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      // Response shapes to support:
      // - { success, data: { data: [...] } }  (paginate)
      // - { success, data: [...] }
      // - [ ... ]
      let payload = response.data;
      let list = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (Array.isArray(payload?.data)) {
        list = payload.data;
      } else if (Array.isArray(payload?.data?.data)) {
        list = payload.data.data;
      }
      // Normalize fields expected by UI
      list = list.map(p => ({
        ...p,
        description: p.description || p.excerpt || '',
      }));
      setProducts(list);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/admin/products');
          let payload = retry.data;
          let list = [];
          if (Array.isArray(payload)) {
            list = payload;
          } else if (Array.isArray(payload?.data)) {
            list = payload.data;
          } else if (Array.isArray(payload?.data?.data)) {
            list = payload.data.data;
          }
          list = list.map(p => ({
            ...p,
            description: p.description || p.excerpt || '',
          }));
          setProducts(list);
          return;
        } catch (e2) {
          console.error('Retry fetch products failed:', e2);
        }
      }
      console.error('Error fetching products:', error);
      alert('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.data || []);
      setCategories(list);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/categories');
          const list = Array.isArray(retry.data)
            ? retry.data
            : (retry.data?.data || []);
          setCategories(list);
        } catch (e2) {
          console.error('Retry fetch categories failed:', e2);
        }
      }
      console.error('Error fetching categories:', error);
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
      console.log('=== PRODUCT SUBMIT START ===');
      console.log('Form Data:', formData);
      
      const submitData = new FormData();
      
      // Add basic fields
      Object.keys(formData).forEach(key => {
        if (key === 'product_images') return;
        if (key === 'thumbnail' && formData[key] instanceof File) {
          // Backend expects 'image' for the main thumbnail (AdminProductController)
          submitData.append('image', formData[key]);
          console.log(`  -> Thumbnail file (as image): ${formData[key].name}, size: ${formData[key].size}`);
          return;
        }
        
        const value = formData[key];
        console.log(`Field ${key}:`, value, typeof value);
        
        // Don't skip empty strings for text fields - backend needs to receive them
        if (value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            submitData.append(key, value ? '1' : '0');
          } else if (value instanceof File) {
            submitData.append(key, value);
            console.log(`  -> Added as file: ${value.name}, size: ${value.size}`);
          } else {
            // Send all string values, even if empty
            submitData.append(key, value || '');
          }
        }
      });

      console.log('Product images count:', formData.product_images.length);
      
      // Add images
      formData.product_images.forEach((image, index) => {
        if (image.file) {
          submitData.append(`images[${index}]`, image.file);
          console.log(`  -> Image ${index}: ${image.file.name}, size: ${image.file.size}`);
        }
      });
      
      if (formData.product_images.length > 0) {
        submitData.append('primary_image_index', 0);
      }

      // Log all FormData entries
      console.log('=== FormData Contents ===');
      for (let pair of submitData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      let response;
      if (editingProduct) {
        submitData.append('_method', 'PUT');
        console.log('Updating product:', editingProduct.id);
        response = await api.post(`/admin/products/${editingProduct.id}`, submitData);
      } else {
        console.log('Creating new product');
        response = await api.post('/admin/products', submitData);
      }

      console.log('Product saved successfully:', response.data);
      fetchProducts();
      resetForm();
      alert(editingProduct ? 'Sản phẩm đã được cập nhật!' : 'Sản phẩm đã được tạo!');
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      alert('Có lỗi xảy ra khi lưu sản phẩm: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Fetch full product details from admin endpoint to ensure we have all fields/images
    (async () => {
      try {
        const res = await api.get(`/admin/products/${product.id}`);
        const p = res.data?.data || res.data; // support both shapes

        // Prepare existing images for MultiImageUpload
        let existingImages = [];
        if (p?.images && p.images.length > 0) {
          existingImages = p.images.map((img, index) => ({
            id: `existing_${img.id || index}`,
            url: `${API_ROOT}/${img.image_path}`,
            name: img.alt_text || `existing_image_${index}`,
            file: null,
            is_primary: !!img.is_primary
          }));
        } else if (p?.thumbnail) {
          existingImages = [{
            id: 'existing_thumbnail',
            url: `${API_ROOT}/${p.thumbnail}`,
            name: 'existing_thumbnail',
            file: null,
            is_primary: true
          }];
        }

        setFormData({
          name: p.name || '',
          slug: p.slug || '',
          category_id: p.category_id || '',
          description: p.excerpt || product.description || '',
          thumbnail: p.thumbnail || '',
          content: p.content || '',
          features: p.features || '',
          applications: p.applications || '',
          technical_specs: p.technical_specs || '',
          product_images: existingImages,
          meta_title: p.meta_title || '',
          meta_description: p.meta_description || '',
          is_active: p.is_active === true || p.is_active === 1,
          is_featured: p.is_featured === true || p.is_featured === 1,
          order: p.order || 0
        });
        setCurrentStep(1);
        setShowForm(true);
      } catch (err) {
        console.error('Error loading product details for edit:', err);
        // fallback to existing object
        setShowForm(true);
      }
    })();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchProducts();
        alert('Sản phẩm đã được xóa!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  };

  const handleDuplicate = async (product) => {
    if (window.confirm(`Nhân bản sản phẩm "${product.name}"?`)) {
      try {
        // Prepare duplicate data
        const duplicateData = new FormData();
        duplicateData.append('name', `${product.name} (Bản sao)`);
        duplicateData.append('description', product.description || product.excerpt || '');
        duplicateData.append('content', product.content || '');
        duplicateData.append('category_id', product.category_id || '');
        duplicateData.append('features', product.features || '');
        duplicateData.append('applications', product.applications || '');
        duplicateData.append('technical_specs', product.technical_specs || '');
        duplicateData.append('is_active', '0'); // Inactive by default
        duplicateData.append('is_featured', '0');
        duplicateData.append('order', product.order || 0);
        
        await api.post('/admin/products', duplicateData);
        fetchProducts();
        alert('Sản phẩm đã được nhân bản! (Trạng thái: Không hoạt động)');
      } catch (error) {
        console.error('Error duplicating product:', error);
        alert('Có lỗi xảy ra khi nhân bản sản phẩm');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      description: '',
      thumbnail: '',
      content: '',
      features: '',
      applications: '',
      technical_specs: '',
      product_images: [],
      meta_title: '',
      meta_description: '',
      is_active: true,
      is_featured: false,
      order: 0
    });
    setEditingProduct(null);
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

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Auto-generate slug when name changes (only for new products)
  useEffect(() => {
    if (formData.name && !editingProduct) {
      const newSlug = generateSlug(formData.name);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.name, editingProduct]);

  // Auto-generate meta_title if empty (only for new products, not when editing)
  useEffect(() => {
    if (formData.name && !formData.meta_title && !editingProduct) {
      setFormData(prev => ({ 
        ...prev, 
        meta_title: `${formData.name} - Sản phẩm sơn chất lượng cao | Alkana Coating` 
      }));
    }
  }, [formData.name, formData.meta_title, editingProduct]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.slug?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      product.category?.name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng số: {filteredProducts.length} sản phẩm</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
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
            Thêm Sản phẩm
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
                  {editingProduct ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm'}
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
                            Tên sản phẩm *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="VD: Alkana EpoFloor Pro 100"
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
                            placeholder="alkana-epofloor-pro-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Danh mục
                        </label>
                        <select
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả ngắn *
                        </label>
                        <div className="max-h-[200px]">
                          <RichTextEditor
                            value={formData.description}
                            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                            placeholder="Mô tả ngắn gọn về sản phẩm (hiển thị trong danh sách)..."
                            height="150px"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hình ảnh đại diện
                        </label>
                        <ImageUploadWithGuide
                          value={formData.thumbnail}
                          onChange={(value) => setFormData(prev => ({ ...prev, thumbnail: value }))}
                          guideType="product_thumbnail"
                          placeholder="Chọn hình ảnh chính cho sản phẩm..."
                          previewSize="w-60 h-60"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Detailed Content */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nội dung chi tiết
                        </label>
                        <RichTextEditor
                          value={formData.content}
                          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                          placeholder="Mô tả chi tiết về sản phẩm, thành phần, cách sử dụng..."
                          height="250px"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tính năng nổi bật
                        </label>
                        <RichTextEditor
                          value={formData.features}
                          onChange={(value) => setFormData(prev => ({ ...prev, features: value }))}
                          placeholder="Liệt kê các tính năng nổi bật của sản phẩm..."
                          height="250px"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ứng dụng
                        </label>
                        <RichTextEditor
                          value={formData.applications}
                          onChange={(value) => setFormData(prev => ({ ...prev, applications: value }))}
                          placeholder="Các lĩnh vực ứng dụng của sản phẩm..."
                          height="250px"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thông số kỹ thuật
                        </label>
                        <RichTextEditor
                          value={formData.technical_specs}
                          onChange={(value) => setFormData(prev => ({ ...prev, technical_specs: value }))}
                          placeholder="Thông số kỹ thuật chi tiết..."
                          height="250px"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Images & Media */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thư viện hình ảnh sản phẩm (0/10)
                        </label>
                        <MultiImageUpload
                          images={formData.product_images}
                          onChange={(images) => setFormData(prev => ({ ...prev, product_images: images }))}
                          maxImages={10}
                          guideType="product_gallery"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: SEO & Publishing */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiêu đề SEO
                        </label>
                        <input
                          type="text"
                          name="meta_title"
                          value={formData.meta_title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Tiêu đề tối ưu cho SEO (tự động tạo nếu để trống)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.meta_title.length}/60 ký tự (tối ưu: 50-60)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả SEO
                        </label>
                        <textarea
                          name="meta_description"
                          value={formData.meta_description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Mô tả ngắn gọn cho search engines (150-160 ký tự)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.meta_description.length}/160 ký tự (tối ưu: 150-160)
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Cài đặt xuất bản</h3>
                        
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_active"
                              checked={formData.is_active}
                              onChange={handleInputChange}
                              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              <span className="font-medium">Kích hoạt sản phẩm</span> - Hiển thị trên website
                            </span>
                          </label>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_featured"
                              checked={formData.is_featured}
                              onChange={handleInputChange}
                              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              <span className="font-medium">🌟 Sản phẩm nổi bật</span> - Hiển thị ở vị trí ưu tiên
                            </span>
                          </label>
                        </div>
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
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Số càng nhỏ hiển thị càng trước (0 = đầu tiên)
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-green-800 mb-2">✅ Sẵn sàng xuất bản!</h3>
                        <p className="text-sm text-green-700">
                          Kiểm tra lại thông tin và nhấn "Lưu sản phẩm" để hoàn tất.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer - Navigation Buttons */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        ← Quay lại
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                      >
                        Tiếp theo →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                      >
                        {editingProduct ? '✓ Cập nhật sản phẩm' : '✓ Lưu sản phẩm'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          // Get primary image
          const primaryImage = product.images?.find(img => img.is_primary);
          const imageUrl = primaryImage
            ? `${API_ROOT}/${primaryImage.image_path}`
            : product.thumbnail
              ? `${API_ROOT}/${product.thumbnail}`
              : null;

          return (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-brand-100 to-brand-200 rounded-t-lg overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🎨</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex-1">
                    {product.name}
                  </h3>
                  <div className="flex gap-1 ml-2">
                    {product.is_featured && (
                      <span className="text-yellow-500" title="Nổi bật">🌟</span>
                    )}
                    {product.is_active ? (
                      <span className="text-green-500" title="Hoạt động">✓</span>
                    ) : (
                      <span className="text-red-500" title="Không hoạt động">✗</span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  {product.category?.name && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      {product.category.name}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description?.replace(/<[^>]*>/g, '').substring(0, 100)}
                  {product.description?.length > 100 && '...'}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-3 py-2 text-sm bg-brand-50 text-brand-700 rounded-md hover:bg-brand-100 transition-colors"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDuplicate(product)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    📋 Nhân bản
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !searchTerm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-gray-500 mb-4">
            Bắt đầu bằng cách thêm sản phẩm đầu tiên
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            + Thêm sản phẩm
          </button>
        </div>
      )}

      {/* No Search Results */}
      {filteredProducts.length === 0 && searchTerm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-gray-500 mb-4">
            Không có sản phẩm nào phù hợp với từ khóa "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
