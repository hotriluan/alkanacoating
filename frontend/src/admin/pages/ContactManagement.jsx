import React, { useState, useEffect } from 'react';
import api, { apiReady } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (apiReady && typeof apiReady.then === 'function') await apiReady;
      } catch {}
      if (mounted) {
        fetchContacts();
        fetchStats();
      }
    })();
    return () => { mounted = false; };
  }, [filters, pagination.current_page]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        status: filters.status,
        search: filters.search,
      };
      const response = await api.get('/admin/contacts', { params });
      setContacts(response.data.data || []);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/contacts/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewContact = async (contact) => {
    try {
      const response = await api.get(`/admin/contacts/${contact.id}`);
      setSelectedContact(response.data);
      setShowModal(true);
      // Refresh list to update status
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      await api.put(`/admin/contacts/${contactId}`, { status: newStatus });
      setSelectedContact({ ...selectedContact, status: newStatus });
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateNotes = async (contactId, notes) => {
    try {
      await api.put(`/admin/contacts/${contactId}`, { admin_notes: notes });
      setSelectedContact({ ...selectedContact, admin_notes: notes });
      fetchContacts();
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    
    try {
      await api.delete(`/admin/contacts/${contactId}`);
      setShowModal(false);
      setSelectedContact(null);
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-yellow-100 text-yellow-800',
      replied: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      new: '✉️',
      read: '📖',
      replied: '✅',
      archived: '📦',
    };
    return icons[status] || '📧';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Tin nhắn</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi tin nhắn từ khách hàng</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90">Tổng số</div>
            <div className="text-3xl font-bold mt-2">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90">Mới</div>
            <div className="text-3xl font-bold mt-2">{stats.new}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90">Đã đọc</div>
            <div className="text-3xl font-bold mt-2">{stats.read}</div>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90">Đã trả lời</div>
            <div className="text-3xl font-bold mt-2">{stats.replied}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90">Hôm nay</div>
            <div className="text-3xl font-bold mt-2">{stats.today}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tên, email, chủ đề..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPagination({ ...pagination, current_page: 1 });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'new', 'read', 'replied', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilters({ ...filters, status });
                  setPagination({ ...pagination, current_page: 1 });
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.status === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tất cả' : 
                 status === 'new' ? 'Mới' :
                 status === 'read' ? 'Đã đọc' :
                 status === 'replied' ? 'Đã trả lời' : 'Lưu trữ'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Đang tải...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">Không có tin nhắn nào</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Chủ đề
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contact.status)}`}>
                        <span>{getStatusIcon(contact.status)}</span>
                        {contact.status === 'new' ? 'Mới' :
                         contact.status === 'read' ? 'Đã đọc' :
                         contact.status === 'replied' ? 'Đã trả lời' : 'Lưu trữ'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500">📞 {contact.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 max-w-xs truncate">{contact.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewContact(contact)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} trong tổng số {pagination.total} tin nhắn
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Trước
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button
                    onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Contact Detail Modal */}
      <AnimatePresence>
        {showModal && selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Chi tiết tin nhắn</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Thông tin khách hàng</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Họ tên</div>
                      <div className="font-medium text-gray-900">{selectedContact.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{selectedContact.email}</div>
                    </div>
                    {selectedContact.phone && (
                      <div>
                        <div className="text-sm text-gray-600">Số điện thoại</div>
                        <div className="font-medium text-gray-900">{selectedContact.phone}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-600">Thời gian gửi</div>
                      <div className="font-medium text-gray-900">{formatDate(selectedContact.created_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
                  <div className="bg-gray-50 rounded-lg p-4 font-medium text-gray-900">
                    {selectedContact.subject}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung tin nhắn</label>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <div className="flex gap-2">
                    {['new', 'read', 'replied', 'archived'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedContact.id, status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedContact.status === status
                            ? getStatusColor(status)
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getStatusIcon(status)} {
                          status === 'new' ? 'Mới' :
                          status === 'read' ? 'Đã đọc' :
                          status === 'replied' ? 'Đã trả lời' : 'Lưu trữ'
                        }
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú nội bộ</label>
                  <textarea
                    value={selectedContact.admin_notes || ''}
                    onChange={(e) => setSelectedContact({ ...selectedContact, admin_notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Thêm ghi chú nội bộ..."
                  />
                  <button
                    onClick={() => handleUpdateNotes(selectedContact.id, selectedContact.admin_notes)}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💾 Lưu ghi chú
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🗑️ Xóa tin nhắn
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactManagement;
