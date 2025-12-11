import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';
// import AdminLayout from '../../admin/components/AdminLayout';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewIsObjectUrl, setPreviewIsObjectUrl] = useState(false);
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
            if (selectedFile) {
                payload.append('image', selectedFile);
                console.log('Uploading file:', selectedFile.name, selectedFile.size, 'bytes');
            }

            if (editingCategory) {
                payload.append('_method', 'PUT');
            }

            console.log('Submitting category:', {
                name: formData.name,
                hasFile: !!selectedFile,
                isEdit: !!editingCategory,
                categoryId: editingCategory?.id
            });

            const url = editingCategory ? `/admin/categories/${editingCategory.id}` : '/admin/categories';
            // Don't set Content-Type - let axios/browser handle FormData boundary
            const response = await api.post(url, payload);
            const data = response.data;

            console.log('Response:', response.status, data);

            if (response.status === 422) {
                setErrors(data.errors || {});
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
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                if (error.response.status === 422 && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                }
            }
            showNotification(error.response?.data?.message || 'Lỗi khi lưu danh mục', 'error');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
        });
        // show existing image if present
        const img = category.image_url || (category.image ? `/${category.image}` : null);
        setPreviewUrl(img);
        setPreviewIsObjectUrl(false);
        setSelectedFile(null);
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
        setFormData({ name: '' });
        // cleanup preview object url if any
        if (previewIsObjectUrl && previewUrl) {
            try { URL.revokeObjectURL(previewUrl); } catch (e) { /* no-op */ }
        }
        setPreviewUrl(null);
        setPreviewIsObjectUrl(false);
        setSelectedFile(null);
        setErrors({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        // revoke previous object url if created
        if (previewIsObjectUrl && previewUrl) {
            try { URL.revokeObjectURL(previewUrl); } catch (e) { /* no-op */ }
        }
        const url = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewUrl(url);
        setPreviewIsObjectUrl(true);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý danh mục</h1>
                <p className="text-gray-600">Quản lý danh mục sản phẩm của bạn</p>
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
                                        Ảnh
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên danh mục
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số sản phẩm
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-500 font-mono text-sm">{category.slug}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-900">{category.products_count || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(category.created_at).toLocaleDateString('vi-VN')}
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
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                        placeholder="Nhập tên danh mục"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ảnh danh mục (tùy chọn)
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                    />
                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600">{errors.image[0]}</p>
                                    )}
                                    {previewUrl && (
                                        <div className="mt-2">
                                            <img src={previewUrl} alt="preview" className="h-24 w-24 object-cover rounded-md" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
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

export default CategoryManagement;