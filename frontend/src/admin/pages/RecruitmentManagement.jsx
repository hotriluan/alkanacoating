import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';
import RichTextEditor from '../components/RichTextEditor';

const RecruitmentManagement = () => {
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecruitment, setEditingRecruitment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    deadline: '',
    status: 'open'
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { if (apiReady && typeof apiReady.then === 'function') await apiReady; } catch {}
      if (mounted) fetchRecruitments();
    })();
    return () => { mounted = false; };
  }, []);

  const fetchRecruitments = async () => {
    try {
      const response = await api.get('/admin/recruitments');
      setRecruitments(response.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/admin/recruitments');
          setRecruitments(retry.data);
          return;
        } catch (e2) {
          console.error('Retry recruitments failed:', e2);
        }
      }
      console.error('Error fetching recruitments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecruitment) {
        await api.put(`/admin/recruitments/${editingRecruitment.id}`, formData);
      } else {
        await api.post('/admin/recruitments', formData);
      }
      fetchRecruitments();
      resetForm();
    } catch (error) {
      console.error('Error saving recruitment:', error);
    }
  };

  const handleEdit = (recruitment) => {
    setEditingRecruitment(recruitment);
    setFormData({
      ...recruitment,
      deadline: recruitment.deadline ? recruitment.deadline.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) {
      try {
        await api.delete(`/admin/recruitments/${id}`);
        fetchRecruitments();
      } catch (error) {
        console.error('Error deleting recruitment:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      requirements: '',
      location: '',
      salary: '',
      deadline: '',
      status: 'open'
    });
    setEditingRecruitment(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Filter recruitments based on search term
  const filteredRecruitments = recruitments.filter(recruitment => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      recruitment.title?.toLowerCase().includes(search) ||
      recruitment.slug?.toLowerCase().includes(search) ||
      recruitment.location?.toLowerCase().includes(search) ||
      recruitment.salary?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Tuyển dụng</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng số: {filteredRecruitments.length} tin tuyển dụng</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm tin tuyển dụng..."
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
            Thêm Tin tuyển dụng
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRecruitment ? 'Sửa Tin tuyển dụng' : 'Thêm Tin tuyển dụng'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
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
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="tuyen-dung-abc (tự động tạo nếu để trống)"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả công việc
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Mô tả chi tiết về công việc..."
                  height="300px"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu ứng viên
                </label>
                <RichTextEditor
                  value={formData.requirements}
                  onChange={(value) => setFormData(prev => ({ ...prev, requirements: value }))}
                  placeholder="Yêu cầu về kinh nghiệm, kỹ năng..."
                  height="300px"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Hà Nội, TP.HCM..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức lương
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="10-15 triệu, Thỏa thuận..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn nộp hồ sơ
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
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
                    <option value="open">Đang tuyển</option>
                    <option value="closed">Đã đóng</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                >
                  {editingRecruitment ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Địa điểm
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mức lương
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Hạn nộp
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Ứng tuyển
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecruitments.map((recruitment) => (
              <tr key={recruitment.id}>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">{recruitment.title}</div>
                  <div className="text-xs text-gray-500">#{recruitment.slug}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {recruitment.location || '--'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  <div className="max-w-[150px] truncate" title={recruitment.salary}>
                    {recruitment.salary || '--'}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(recruitment.deadline)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {recruitment.applications_count || 0}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${recruitment.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {recruitment.status === 'open' ? 'Đang tuyển' : 'Đã đóng'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(recruitment)}
                    className="text-brand-600 hover:text-brand-900 mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(recruitment.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recruitments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có tin tuyển dụng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitmentManagement;