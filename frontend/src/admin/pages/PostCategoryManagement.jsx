import { useState, useEffect } from 'react';
import api from '../../services/api';
import EmojiPicker from '../components/EmojiPicker';

export default function PostCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#6b7280',
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/post-categories');
      setCategories(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching post categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await api.put(`/admin/post-categories/${currentCategory.id}`, formData);
      } else {
        await api.post('/admin/post-categories', formData);
      }
      fetchCategories();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving post category:', error);
      alert('Lỗi khi lưu danh mục: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa danh mục này? Tất cả bài viết trong danh mục sẽ không có danh mục.')) {
      try {
        await api.delete(`/admin/post-categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting post category:', error);
        alert('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#6b7280',
      is_active: category.is_active ?? true,
      order: category.order ?? 0,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#6b7280',
      is_active: true,
      order: 0,
    });
    setShowEmojiPicker(false);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.slug && cat.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Danh mục bài viết</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục cho tin tức và blog</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Tìm thấy {filteredCategories.length} danh mục
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào. Click "Thêm danh mục" để tạo mới.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hiển thị</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số bài viết</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mô tả</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium" style={{
                      backgroundColor: (category.color || '#6b7280') + '20',
                      color: category.color || '#6b7280'
                    }}>
                      <span className="mr-2 text-base">{category.icon || '🏷️'}</span>
                      {category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.posts_count || 0} bài
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {category.description || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    required
                    placeholder="VD: Tin tức công nghệ"
                  />
                </div>

                {/* Icon picker (emoji/text) */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Icon (emoji/ký tự)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                      placeholder="VD: 📰, 🧪, 🎯 ..."
                      maxLength={4}
                      onFocus={() => setShowEmojiPicker(false)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Chọn emoji"
                    >
                      <span className="text-2xl">{formData.icon || '🏷️'}</span>
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <EmojiPicker
                      value={formData.icon}
                      onChange={(emoji) => {
                        setFormData({ ...formData, icon: emoji });
                        setShowEmojiPicker(false);
                      }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">Đề xuất: dùng emoji đơn giản</p>
                </div>
              </div>

              {/* Slug & Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    placeholder="VD: tin-tuc-cong-nghe (để trống để tự động tạo)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nếu để trống, hệ thống sẽ tự động tạo slug từ tên danh mục
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Màu hiển thị</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10 w-16 p-1 border border-gray-300 rounded"
                    />
                    <span
                      className="inline-flex items-center px-3 py-1 rounded text-sm"
                      style={{ backgroundColor: (formData.color || '#6b7280') + '20', color: formData.color || '#6b7280' }}
                    >
                      {formData.icon || '🏷️'} Demo
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  rows="3"
                  placeholder="Mô tả ngắn về danh mục này..."
                />
              </div>

              {/* Active & Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">Kích hoạt</span>
                </label>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Thứ tự</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    min={0}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors font-semibold"
                >
                  {currentCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
