import React, { useEffect, useState } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';

export default function PostTagManagement() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', color: '#16a34a' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { if (apiReady && typeof apiReady.then === 'function') await apiReady; } catch {}
      if (!mounted) return;
      fetchTags();
    })();
    return () => { mounted = false; };
  }, []);

  const fetchTags = async () => {
    try {
      const res = await api.get('/admin/post-tags');
      setTags(res.data || []);
    } catch (err) {
      if (err?.response?.status === 401) {
        try { await ensureDevAuth(); const retry = await api.get('/admin/post-tags'); setTags(retry.data || []); return; } catch {}
      }
      console.error('Error loading tags', err);
      alert('Không tải được danh sách tags');
    } finally { setLoading(false); }
  };

  const resetForm = () => { setEditing(null); setForm({ name: '', slug: '', color: '#16a34a' }); };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editing) {
        await api.put(`/admin/post-tags/${editing.id}`, payload);
      } else {
        await api.post('/admin/post-tags', payload);
      }
      await fetchTags();
      resetForm();
    } catch (err) {
      console.error('Save tag failed', err);
      alert('Lưu tag thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const onDelete = async (tag) => {
    if (!window.confirm(`Xóa tag "${tag.name}"?`)) return;
    try {
      await api.delete(`/admin/post-tags/${tag.id}`);
      await fetchTags();
    } catch (err) {
      console.error('Delete tag failed', err);
      alert('Xóa tag thất bại');
    }
  };

  const filtered = tags.filter(t => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.slug?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tags Bài viết</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng số: {filtered.length} tag</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Tìm theo tên/slug"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">{editing ? 'Sửa tag' : 'Thêm tag'}</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
              <input
                type="text"
                value={form.name}
                onChange={(e)=>setForm(f=>({...f, name: e.target.value, slug: e.target.value
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[đĐ]/g, 'd')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim()
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e)=>setForm(f=>({...f, slug: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Màu</label>
              <input
                type="color"
                value={form.color || '#16a34a'}
                onChange={(e)=>setForm(f=>({...f, color: e.target.value}))}
                className="h-10 w-20 p-0 border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700">
                {editing ? 'Lưu thay đổi' : 'Thêm tag'}
              </button>
              {editing && (
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sử dụng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(tag => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{tag.name}</td>
                  <td className="px-4 py-3 text-gray-600">{tag.slug}</td>
                  <td className="px-4 py-3"><span className="inline-block w-5 h-5 rounded" style={{ backgroundColor: tag.color || '#16a34a' }} /></td>
                  <td className="px-4 py-3 text-gray-700">{tag.usage_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs hover:text-blue-800"
                        onClick={()=>{ setEditing(tag); setForm({ name: tag.name || '', slug: tag.slug || '', color: tag.color || '#16a34a' }); }}
                      >Sửa</button>
                      <button
                        className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs hover:text-red-800"
                        onClick={()=>onDelete(tag)}
                      >Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">Chưa có tag nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
