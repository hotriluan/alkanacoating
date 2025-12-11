import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';
import { HexColorPicker } from 'react-colorful';
import EmojiPicker from 'emoji-picker-react';
import RichTextEditor from '../../admin/components/RichTextEditor';
import ImageUploadWithGuide from '../../admin/components/ImageUploadWithGuide';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const CategoryManagementEnhanced = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        parent_id: '',
        order: 0,
        meta_title: '',
        meta_description: ''
    });
    const [categoryImage, setCategoryImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let mounted = true;
        (async () => {
            try { if (apiReady && typeof apiReady.then === 'function') await apiReady; } catch {}
            if (mounted) fetchCategories();
        })();
        return () => { mounted = false; };
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            const data = response.data;
            setCategories(Array.isArray(data) ? data : (data.categories || []));
        } catch (error) {
            if (error?.response?.status === 401) {
                try {
                    await ensureDevAuth();
                    const retry = await api.get('/admin/categories');
                    const data2 = retry.data;
                    setCategories(Array.isArray(data2) ? data2 : (data2.categories || []));
                    return;
                } catch (e2) {
                    console.error('Retry categories failed:', e2);
                }
            }
            console.error('Error fetching categories:', error);
            showNotification('Lỗi khi tải danh sách danh mục', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = new FormData();
            payload.append('name', formData.name || '');
            payload.append('description', formData.description || '');
            payload.append('icon', formData.icon || '');
            payload.append('color', formData.color || '');
            if (formData.parent_id) payload.append('parent_id', formData.parent_id);
            payload.append('order', formData.order || 0);
            payload.append('meta_title', formData.meta_title || '');
            payload.append('meta_description', formData.meta_description || '');
            
            if (categoryImage) {
                payload.append('image', categoryImage);
                console.log('Uploading image:', categoryImage.name, categoryImage.size, 'bytes');
            }

            if (editingCategory) {
                payload.append('_method', 'PUT');
            }

            console.log('Submitting category:', {
                name: formData.name,
                hasImage: !!categoryImage,
                isEdit: !!editingCategory,
                categoryId: editingCategory?.id
            });

            const url = editingCategory ? `/admin/categories/${editingCategory.id}` : '/admin/categories';
            const response = await api.post(url, payload);
            const data = response.data;

            console.log('Response:', response.status, data);

            if (response.status === 422) {
                setErrors(data.errors || {});
                console.error('Validation errors:', data.errors);
                showNotification('Vui lòng kiểm tra dữ liệu đầu vào', 'error');
                return;
            }

            if (response.status >= 200 && response.status < 300) {
                setErrors({});
                showNotification(data.message || 'Lưu thành công');
                fetchCategories();
                handleCloseModal();
            } else {
                showNotification(data.message || 'Có lỗi xảy ra', 'error');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                if (error.response.status === 422 && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                    console.error('Validation errors:', error.response.data.errors);
                }
            }
            showNotification(error.response?.data?.message || 'Lỗi khi lưu danh mục', 'error');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            icon: category.icon || '',
            color: category.color || '#3B82F6',
            parent_id: category.parent_id || '',
            order: category.order || 0,
            meta_title: category.meta_title || '',
            meta_description: category.meta_description || ''
        });
        const img = category.image_url || (category.image ? `/${category.image}` : null);
        setPreviewUrl(img);
        setCategoryImage(null);
        setErrors({});
        setShowModal(true);
    };

    const handleDelete = async (category) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
            return;
        }

        try {
            const response = await api.delete(`/admin/categories/${category.id}`);
            const data = response.data;

            if (response.status >= 200 && response.status < 300) {
                showNotification(data.message);
                fetchCategories();
            } else {
                showNotification(data.message || 'Lỗi khi xóa danh mục', 'error');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            showNotification('Lỗi khi xóa danh mục', 'error');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            icon: '',
            color: '#3B82F6',
            parent_id: '',
            order: 0,
            meta_title: '',
            meta_description: ''
        });
        setCategoryImage(null);
        setPreviewUrl(null);
        setErrors({});
        setShowColorPicker(false);
        setShowEmojiPicker(false);
    };

    const handleEmojiClick = (emojiData) => {
        setFormData({ ...formData, icon: emojiData.emoji });
        setShowEmojiPicker(false);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get parent categories for dropdown (exclude self when editing)
    const parentCategories = categories.filter(cat => 
        editingCategory ? cat.id !== editingCategory.id : true
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý danh mục</h1>
                <p className="text-gray-600">Quản lý danh mục sản phẩm với hỗ trợ phân cấp, màu sắc và biểu tượng</p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Thêm danh mục
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`mb-6 p-4 rounded-md ${notification.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Categories Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        <p className="mt-2 text-gray-500">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thứ tự
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Icon
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ảnh
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên danh mục
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Màu sắc
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Danh mục cha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sản phẩm
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {category.order}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {category.icon ? (
                                                    <span className="text-2xl">{category.icon}</span>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {category.image_url || category.image ? (
                                                    <img
                                                        src={category.image_url || `/${category.image}`}
                                                        alt={category.name}
                                                        className="h-10 w-10 rounded-md object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">No</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{category.name}</div>
                                                <div className="text-xs text-gray-500">{category.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {category.color ? (
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-6 h-6 rounded border border-gray-300"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                        <span className="text-xs text-gray-500 font-mono">{category.color}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {category.parent?.name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-900">{category.products_count || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="text-brand-600 hover:text-brand-900 mr-3"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                {/* Basic Info Section */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin cơ bản</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tên danh mục *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="VD: Sơn Epoxy"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Danh mục cha
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                                                value={formData.parent_id}
                                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                            >
                                                <option value="">— Không có —</option>
                                                {parentCategories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <div className="max-h-[200px] overflow-hidden">
                                            <RichTextEditor
                                                value={formData.description}
                                                onChange={(value) => setFormData({ ...formData, description: value })}
                                                placeholder="Mô tả chi tiết về danh mục..."
                                                height="150px"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Section */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Hình ảnh & Màu sắc</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Biểu tượng emoji
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:bg-gray-50"
                                                >
                                                    <span className="text-2xl">{formData.icon || '😀'}</span>
                                                    <span className="text-sm text-gray-500">Chọn</span>
                                                </button>
                                                {showEmojiPicker && (
                                                    <div className="absolute z-10 mt-1">
                                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Màu chủ đạo
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center gap-2 hover:bg-gray-50"
                                                >
                                                    <div
                                                        className="w-6 h-6 rounded border border-gray-300"
                                                        style={{ backgroundColor: formData.color }}
                                                    />
                                                    <span className="text-sm font-mono">{formData.color}</span>
                                                </button>
                                                {showColorPicker && (
                                                    <div className="absolute z-10 mt-1">
                                                        <HexColorPicker
                                                            color={formData.color}
                                                            onChange={(color) => setFormData({ ...formData, color })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Thứ tự hiển thị
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ảnh danh mục
                                        </label>
                                        <ImageUploadWithGuide
                                            guideType="category_thumbnail"
                                            value={previewUrl}
                                            onChange={setCategoryImage}
                                            error={errors.image?.[0]}
                                            previewSize="w-full h-48"
                                        />
                                    </div>
                                </div>

                                {/* SEO Section */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Tối ưu SEO</h4>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tiêu đề SEO
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                                                value={formData.meta_title}
                                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                                placeholder="Tự động tạo nếu để trống"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Mô tả SEO
                                            </label>
                                            <textarea
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                                                value={formData.meta_description}
                                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                                placeholder="Mô tả ngắn gọn cho search engines (150-160 ký tự)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                                    >
                                        {editingCategory ? 'Cập nhật' : 'Thêm'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagementEnhanced;
