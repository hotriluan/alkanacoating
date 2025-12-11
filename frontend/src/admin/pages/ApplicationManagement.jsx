import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [recruitmentFilter, setRecruitmentFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { if (apiReady && typeof apiReady.then === 'function') await apiReady; } catch {}
      if (mounted) {
        fetchApplications();
        fetchRecruitments();
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/admin/applications');
      setApplications(response.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          const retry = await api.get('/admin/applications');
          setApplications(retry.data);
          return;
        } catch (e2) {
          console.error('Retry applications failed:', e2);
        }
      }
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruitments = async () => {
    try {
      const response = await api.get('/admin/recruitments');
      setRecruitments(response.data);
    } catch (error) {
      console.error('Error fetching recruitments:', error);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleChangeStatus = (application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setAdminNotes(application.admin_notes || '');
    setShowStatusModal(true);
  };

  const submitStatusChange = async () => {
    try {
      await api.put(`/admin/applications/${selectedApplication.id}/status`, {
        status: newStatus,
        admin_notes: adminNotes
      });
      fetchApplications();
      setShowStatusModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
      try {
        await api.delete(`/admin/applications/${id}`);
        fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Có lỗi xảy ra khi xóa hồ sơ');
      }
    }
  };

  const handleDownloadCV = async (application) => {
    if (!application.cv_file) {
      alert('Không có file CV');
      return;
    }
    
    try {
      const response = await api.get(`/admin/applications/${application.id}/download-cv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CV_${application.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Có lỗi xảy ra khi tải CV');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { text: 'Mới', color: 'bg-blue-100 text-blue-800' },
      reviewing: { text: 'Đang xem xét', color: 'bg-yellow-100 text-yellow-800' },
      shortlisted: { text: 'Đạt vòng sơ tuyển', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Từ chối', color: 'bg-red-100 text-red-800' },
      accepted: { text: 'Chấp nhận', color: 'bg-purple-100 text-purple-800' }
    };
    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!app.name?.toLowerCase().includes(search) &&
          !app.email?.toLowerCase().includes(search) &&
          !app.phone?.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (statusFilter && app.status !== statusFilter) return false;
    if (recruitmentFilter && app.recruitment_id !== parseInt(recruitmentFilter)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Hồ sơ Ứng tuyển</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng số: {filteredApplications.length} hồ sơ</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
            <svg 
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Recruitment Filter */}
          <select
            value={recruitmentFilter}
            onChange={(e) => setRecruitmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Tất cả vị trí</option>
            {recruitments.map(rec => (
              <option key={rec.id} value={rec.id}>{rec.title}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="new">Mới</option>
            <option value="reviewing">Đang xem xét</option>
            <option value="shortlisted">Đạt vòng sơ tuyển</option>
            <option value="rejected">Từ chối</option>
            <option value="accepted">Chấp nhận</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ứng viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vị trí ứng tuyển
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ngày nộp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{app.name}</div>
                    <div className="text-sm text-gray-500">{app.email}</div>
                    <div className="text-sm text-gray-500">{app.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{app.recruitment?.title || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(app.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(app.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewDetails(app)}
                    className="text-brand-600 hover:text-brand-900 mr-3"
                    title="Xem chi tiết"
                  >
                    <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  {app.cv_file && (
                    <button
                      onClick={() => handleDownloadCV(app)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Tải CV"
                    >
                      <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleChangeStatus(app)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Thay đổi trạng thái"
                  >
                    <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Xóa"
                  >
                    <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có hồ sơ ứng tuyển nào</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Chi tiết Hồ sơ</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vị trí ứng tuyển</label>
                  <p className="text-gray-900">{selectedApplication.recruitment?.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Họ tên</label>
                  <p className="text-gray-900">{selectedApplication.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedApplication.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900">{selectedApplication.phone || '--'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Thư giới thiệu</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.cover_letter || '--'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                </div>

                {selectedApplication.admin_notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ghi chú của Admin</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.admin_notes}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày nộp</label>
                  <p className="text-gray-900">{formatDate(selectedApplication.created_at)}</p>
                </div>

                {selectedApplication.cv_file && (
                  <div>
                    <button
                      onClick={() => handleDownloadCV(selectedApplication)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Tải CV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Thay đổi Trạng thái</h2>
                <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ứng viên</label>
                  <p className="text-gray-900">{selectedApplication.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái mới</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="new">Mới</option>
                    <option value="reviewing">Đang xem xét</option>
                    <option value="shortlisted">Đạt vòng sơ tuyển</option>
                    <option value="rejected">Từ chối</option>
                    <option value="accepted">Chấp nhận</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
                    placeholder="Ghi chú nội bộ..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={submitStatusChange}
                    className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
