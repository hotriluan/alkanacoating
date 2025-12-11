
import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';
import RichTextEditor from '../components/RichTextEditor';
import ImageUploadWithGuide from '../components/ImageUploadWithGuide';
import ModalPortal from '../components/ModalPortal';
import { resolveAssetUrl } from '../../utils/media';
import DateTimePickerInline, { formatLocal } from '../components/DateTimePickerInline';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    // Basic info
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: null,
    tags: [],
    
    // Media
    thumbnail: '',
    featured_image: '',
    
    // Publishing
    status: 'published',
    is_published: true,
    is_featured: false,
    published_at: '',
    
    // SEO
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null);

  const steps = [
    { id: 1, title: 'Nội dung', icon: '✍️' },
    { id: 2, title: 'Hình ảnh & Phân loại', icon: '🖼️' },
    { id: 3, title: 'SEO & Xuất bản', icon: '🚀' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { if (apiReady && typeof apiReady.then === 'function') await apiReady; } catch {}
      if (!mounted) return;
      await Promise.allSettled([fetchPosts(), fetchCategories(), fetchTags()]);
    })();
    return () => { mounted = false; };
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/admin/posts');
      const list = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      const total = Array.isArray(response.data) ? list.length : (response.data?.total || list.length);
      setPosts(list);
      setTotalCount(total);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/admin/posts');
          const list = Array.isArray(retry.data) ? retry.data : (retry.data?.data || []);
          const total = Array.isArray(retry.data) ? list.length : (retry.data?.total || list.length);
          setPosts(list);
          setTotalCount(total);
          return;
        } catch (e2) {
          console.error('Retry posts failed:', e2);
        }
      }
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/post-categories');
      setCategories(response.data || []);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/admin/post-categories');
          setCategories(retry.data || []);
          return;
        } catch (e2) {
          console.error('Retry post-categories failed:', e2);
        }
      }
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/admin/post-tags');
      setTags(response.data || []);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/admin/post-tags');
          setTags(retry.data || []);
          return;
        } catch (e2) {
          console.error('Retry post-tags failed:', e2);
        }
      }
      console.error('Error fetching tags:', error);
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
  // Always use FormData for flexible file/string handling
      const fd = new FormData();

      // Basic fields
      fd.append('title', formData.title || '');
      fd.append('slug', formData.slug || '');
      fd.append('excerpt', formData.excerpt || '');
      fd.append('content', formData.content || '');
      fd.append('status', formData.status || 'published');

      // Booleans as ints
      fd.append('is_published', formData.is_published ? '1' : '0');
      fd.append('is_featured', formData.is_featured ? '1' : '0');

      // Optionals
      fd.append('category_id', formData.category_id ? String(formData.category_id) : '');
  // published_at from state (formatted local string)
  fd.append('published_at', publishedAt ? formatLocal(publishedAt) : '');
      fd.append('meta_title', formData.meta_title || '');
      fd.append('meta_description', formData.meta_description || '');
      fd.append('meta_keywords', formData.meta_keywords || '');

      // Tags array
      if (Array.isArray(formData.tags)) {
        formData.tags.forEach((id) => fd.append('tags[]', String(id)));
      }

      // Images: accept File or string; send empty string to clear
      const thumb = formData.thumbnail;
      if (typeof File !== 'undefined' && thumb instanceof File) {
        fd.append('thumbnail', thumb);
      } else if (typeof thumb === 'string') {
        fd.append('thumbnail', thumb);
      } else if (thumb === null) {
        fd.append('thumbnail', '');
      }

      const feat = formData.featured_image;
      if (typeof File !== 'undefined' && feat instanceof File) {
        fd.append('featured_image', feat);
      } else if (typeof feat === 'string') {
        fd.append('featured_image', feat);
      } else if (feat === null) {
        fd.append('featured_image', '');
      }

      let response;
      if (editingPost) {
        // Use POST with method override for better compatibility
        fd.append('_method', 'PUT');
        response = await api.post(`/admin/posts/${editingPost.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/admin/posts', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      console.log('Post saved:', response.data);
      fetchPosts();
      resetForm();
      alert(editingPost ? 'Bài viết đã được cập nhật!' : 'Bài viết đã được tạo!');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      ...post,
      tags: post.post_tags?.map(t => t.id) || [],
      published_at: post.published_at ? post.published_at : '',
      category_id: post.category_id || null,
    });
    setPublishedAt(post.published_at ? new Date(post.published_at) : null);
    setCurrentStep(1);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await api.delete(`/admin/posts/${id}`);
        fetchPosts();
        alert('Bài viết đã được xóa!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Có lỗi xảy ra khi xóa bài viết');
      }
    }
  };

  const handleDuplicate = async (post) => {
    try {
      await api.post(`/admin/posts/${post.id}/duplicate`);
      fetchPosts();
      alert('Đã nhân bản bài viết!');
    } catch (error) {
      console.error('Error duplicating post:', error);
      alert('Có lỗi xảy ra khi nhân bản');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category_id: null,
      tags: [],
      thumbnail: '',
      featured_image: '',
      status: 'published',
      is_published: true,
      is_featured: false,
      published_at: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
    });
    setPublishedAt(null);
    setEditingPost(null);
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

  const handleTagsChange = (tagId) => {
    setFormData(prev => {
      const tags = prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId];
      return { ...prev, tags };
    });
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

  // Auto-generate slug
  useEffect(() => {
    if (formData.title && !editingPost) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, editingPost]);

  // Auto-generate meta_title (only for new posts, not when editing)
  useEffect(() => {
    if (formData.title && !formData.meta_title && !editingPost) {
      setFormData(prev => ({ 
        ...prev, 
        meta_title: `${formData.title} | Alkana Coating Blog` 
      }));
    }
  }, [formData.title, formData.meta_title, editingPost]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      post.title?.toLowerCase().includes(search) ||
      post.slug?.toLowerCase().includes(search) ||
      post.excerpt?.toLowerCase().includes(search) ||
      post.category?.name?.toLowerCase().includes(search)
    );
  }).filter(post => !showPublishedOnly || !!post.is_published);

  return (
    <div className="p-6">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Bài viết</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng số: {totalCount} bài viết</p>
        </div>
        
  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
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

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center text-sm text-gray-700">
              <input type="checkbox" className="mr-2" checked={showPublishedOnly} onChange={(e)=>setShowPublishedOnly(e.target.checked)} />
              Chỉ hiển thị công khai
            </label>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
          >
            Thêm Bài viết
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
                  {editingPost ? 'Sửa Bài viết' : 'Thêm Bài viết'}
                </h2>
                
                {/* Step Indicator */}
                <div className="flex items-center justify-between mt-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
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
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-4 ${
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
                  {/* Step 1: Content */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
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
                          placeholder="Nhập tiêu đề bài viết..."
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
                          placeholder="bai-viet-abc"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tóm tắt (Excerpt) *
                        </label>
                        <textarea
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          rows={3}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Mô tả ngắn gọn về bài viết (hiển thị trong danh sách)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nội dung chính
                        </label>
                        <div className="max-h-[300px]">
                          <RichTextEditor
                            value={formData.content}
                            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                            placeholder="Nội dung chi tiết bài viết..."
                            height="200px"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Media & Categories */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ảnh thumbnail (danh sách)
                        </label>
                        <ImageUploadWithGuide
                          value={formData.thumbnail}
                          onChange={(value) => setFormData(prev => ({ ...prev, thumbnail: value }))}
                          guideType="post_thumbnail"
                          placeholder="Chọn ảnh hiển thị trong danh sách bài viết..."
                          previewSize="w-full h-40"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ảnh featured (chi tiết)
                        </label>
                        <ImageUploadWithGuide
                          value={formData.featured_image}
                          onChange={(value) => setFormData(prev => ({ ...prev, featured_image: value }))}
                          guideType="post_thumbnail"
                          placeholder="Chọn ảnh lớn hiển thị đầu bài viết..."
                          previewSize="w-full h-48"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Danh mục
                        </label>
                        <select
                          name="category_id"
                          value={formData.category_id || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="">Chọn danh mục...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <label
                              key={tag.id}
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                                formData.tags.includes(tag.id)
                                  ? 'bg-brand-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.tags.includes(tag.id)}
                                onChange={() => handleTagsChange(tag.id)}
                                className="sr-only"
                              />
                              {tag.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: SEO & Publishing */}
                  {currentStep === 3 && (
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
                          placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Độ dài tối ưu: 150-160 ký tự</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Keywords
                        </label>
                        <input
                          type="text"
                          name="meta_keywords"
                          value={formData.meta_keywords}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                        />
                      </div>

                      <DateTimePickerInline
                        value={publishedAt}
                        onChange={setPublishedAt}
                        onClear={()=>setPublishedAt(null)}
                      />

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

                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Bài viết nổi bật</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Công khai</span>
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
                        {editingPost ? '✓ Cập nhật' : '✓ Tạo bài viết'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-60">
                Bài viết
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] w-40">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lượt xem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 align-top">
                  <div className="flex items-start">
                    {(post.thumbnail || post.featured_image || post.image) && (
                      <img
                        src={resolveAssetUrl(post.thumbnail || post.featured_image || post.image)}
                        alt={post.title}
                        className="h-12 w-16 object-cover rounded mr-3 flex-shrink-0 border border-gray-200"
                        onError={e => { e.currentTarget.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="90"%3E%3Crect fill="%23f3f4f6" width="120" height="90"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📝%3C/text%3E%3C/svg%3E' }}
                      />
                    )}
                    <div className="pl-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 break-words line-clamp-2">{post.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</div>
                      {post.is_featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          ⭐ Nổi bật
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap align-top min-w-[120px]">
                  {post.category ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" style={{
                      backgroundColor: post.category.color + '20',
                      color: post.category.color
                    }}>
                      {post.category.icon} {post.category.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Chưa có</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {post.post_tags?.slice(0, 3).map(tag => (
                      <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {tag.name}
                      </span>
                    ))}
                    {post.post_tags?.length > 3 && (
                      <span className="text-xs text-gray-500">+{post.post_tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    post.is_published 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.is_published ? '✅ Công khai' : '⏳ Nháp'}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {post.reading_time > 0 && `📖 ${post.reading_time} phút đọc`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  👁️ {post.view_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-brand-600 hover:text-brand-900 text-xs bg-brand-50 px-2 py-1 rounded"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDuplicate(post)}
                      className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                    >
                      📋 Nhân bản
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">Chưa có bài viết nào</p>
            <p className="text-gray-400 text-sm mt-2">Hãy tạo bài viết đầu tiên!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostManagement;
