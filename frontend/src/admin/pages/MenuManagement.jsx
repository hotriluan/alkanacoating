import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';
import { Link } from 'react-router-dom';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    parent_id: null,
    order: 0,
    is_active: true,
    type: 'default',
    payload: null,
    icon: '',
    image: ''
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { if (apiReady && typeof apiReady.then === 'function') await apiReady; } catch {}
      if (mounted) fetchMenus();
    })();
    return () => { mounted = false; };
  }, []);

  // Resolve asset URLs (handle backend origin/port differences and fallbacks)
  const resolveAssetUrl = (input) => {
    if (!input) return '';
    const backendBase = (api.defaults && api.defaults.baseURL) ? String(api.defaults.baseURL).replace(/\/api\/?$/, '') : '';

    // If it's a CSS class or plain token (no dot and no slash), return as-is
    if (typeof input === 'string' && !input.includes('.') && !input.startsWith('/') && !input.startsWith('http')) {
      return input;
    }

    // If absolute URL
    try {
      const url = new URL(input, backendBase || window.location.origin);
      // If backendBase available and URL hostname is localhost but missing port, prefer backendBase origin
      if (backendBase) {
        const backendOrigin = backendBase.replace(/\/$/, '');
        if (url.hostname === 'localhost' && !url.port) {
          return backendOrigin + url.pathname + url.search;
        }
      }
      return url.href;
    } catch (e) {
      // input might be a relative path like /storage/menus/filename or a filename
      if (input.startsWith('/')) {
        return (backendBase ? backendBase.replace(/\/$/, '') : '') + input;
      }
      // treat as filename
      return (backendBase ? backendBase.replace(/\/$/, '') : '') + '/storage/menus/' + input;
    }
  };

  // Development helper: attempt to auto-login on localhost using seeded admin creds
  const devAutoLogin = async () => {
    // Keep for backward-compat but delegate to shared helper
    try {
      await ensureDevAuth();
      return true;
    } catch {
      return false;
    }
  };

  const fetchMenus = async () => {
    try {
      let response;
      try {
        response = await api.get('/admin/menus');
      } catch (err) {
        // if unauthorized, try dev auto-login (localhost) and retry using token auth
        if (err.response && err.response.status === 401) {
          const ok = await devAutoLogin();
          if (ok) {
            response = await api.get('/admin/menus');
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      setMenus(response.data);
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sendData = { ...formData };
      if (sendData.payload && typeof sendData.payload !== 'string') {
        try {
          sendData.payload = JSON.stringify(sendData.payload);
        } catch (err) {
          // keep as-is
        }
      }

      if (editingMenu) {
        await api.put(`/admin/menus/${editingMenu.id}`, sendData);
      } else {
        await api.post('/admin/menus', sendData);
      }
      fetchMenus();
      resetForm();
    } catch (error) {
      console.error('Error saving menu:', error);
    }
  };

  const handleUpload = async (file, field = 'image') => {
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post('/admin/menus/upload-asset', data);
      const { filename, url, thumb_url, medium_url, small_url } = res.data || {};

      if (!filename) {
        throw new Error('Upload did not return a filename');
      }

      // Save filename to form state
      setFormData(prev => ({ ...prev, [field]: filename }));

      // Determine a usable preview URL. Backend should return url or thumb_url.
      // If not, fall back to the public storage path (/storage/menus/<filename>).
      const fallbackUrl = `/storage/menus/${filename}`;
      // Prefer small for icon previews, medium for image previews when caller chooses
      const previewUrl = (small_url || thumb_url || medium_url || url || fallbackUrl);
      if (!thumb_url && !url) {
        console.warn('Using fallback preview URL; ensure `php artisan storage:link` has been run and files exist in storage/app/public/menus');
      }
      setPreview(prev => ({ ...prev, [field]: previewUrl }));
    } catch (e) {
      console.error('Upload failed', e);
      // user-friendly message
      const msg = e?.response?.data?.message || e.message || 'Upload failed';
      alert(msg);
    }
  };

  // Client-side center-crop and resize utility
  const cropAndResize = (file, targetWidth = 600, targetHeight = 400) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            // compute center crop
            const srcW = img.naturalWidth;
            const srcH = img.naturalHeight;
            const srcRatio = srcW / srcH;
            const targetRatio = targetWidth / targetHeight;

            let sx = 0, sy = 0, sWidth = srcW, sHeight = srcH;
            if (srcRatio > targetRatio) {
              // source is wider -> crop sides
              sHeight = srcH;
              sWidth = Math.round(srcH * targetRatio);
              sx = Math.round((srcW - sWidth) / 2);
            } else {
              // source is taller -> crop top/bottom
              sWidth = srcW;
              sHeight = Math.round(srcW / targetRatio);
              sy = Math.round((srcH - sHeight) / 2);
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error('Canvas is empty'));
              // preserve original file type if possible
              const newFile = new File([blob], file.name, { type: blob.type || file.type });
              resolve(newFile);
            }, file.type || 'image/jpeg', 0.9);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = (e) => reject(new Error('Failed to load image for cropping'));
        img.src = ev.target.result;
      };
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const [preview, setPreview] = React.useState({ image: null, icon: null });

  // Mega builder helpers
  const ensurePayload = () => {
    setFormData(prev => ({ ...prev, payload: Array.isArray(prev.payload) ? prev.payload : [] }));
  };

  const addColumn = () => {
    setFormData(prev => ({ ...prev, payload: [...(prev.payload || []), { title: '', links: [] }] }));
  };

  const removeColumn = (idx) => {
    setFormData(prev => ({ ...prev, payload: prev.payload.filter((_, i) => i !== idx) }));
  };

  const updateColumnTitle = (idx, value) => {
    setFormData(prev => {
      const payload = [...(prev.payload || [])];
      payload[idx] = { ...(payload[idx] || {}), title: value };
      return { ...prev, payload };
    });
  };

  const addLink = (colIdx) => {
    setFormData(prev => {
      const payload = [...(prev.payload || [])];
      payload[colIdx] = { ...(payload[colIdx] || {}), links: [...((payload[colIdx] && payload[colIdx].links) || []), { name: '', url: '' }] };
      return { ...prev, payload };
    });
  };

  const updateLink = (colIdx, linkIdx, field, value) => {
    setFormData(prev => {
      const payload = [...(prev.payload || [])];
      const col = { ...(payload[colIdx] || {}) };
      col.links = [...(col.links || [])];
      col.links[linkIdx] = { ...(col.links[linkIdx] || {}), [field]: value };
      payload[colIdx] = col;
      return { ...prev, payload };
    });
  };

  const removeLink = (colIdx, linkIdx) => {
    setFormData(prev => {
      const payload = [...(prev.payload || [])];
      const col = { ...(payload[colIdx] || {}) };
      col.links = (col.links || []).filter((_, i) => i !== linkIdx);
      payload[colIdx] = col;
      return { ...prev, payload };
    });
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setFormData(menu);
    setPreview(prev => ({
      ...prev,
      image: resolveAssetUrl(menu.image_url || (menu.image ? `/storage/menus/${menu.image}` : null)),
      icon: resolveAssetUrl(menu.icon_url || (menu.icon ? `/storage/menus/${menu.icon}` : null))
    }));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa menu này?')) {
      try {
        await api.delete(`/admin/menus/${id}`);
        fetchMenus();
      } catch (error) {
        console.error('Error deleting menu:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      parent_id: null,
      order: 0,
      is_active: true
    });
    setEditingMenu(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'parent_id' && value === '' ? null : value)
    }));
  };

  const rootMenus = menus.filter(menu => !menu.parent_id);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Filter menus based on search term
  const filteredMenus = menus.filter(menu => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      menu.name?.toLowerCase().includes(search) ||
      menu.url?.toLowerCase().includes(search) ||
      menu.type?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Menu</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng số: {filteredMenus.length} menu</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm menu..."
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

          <div className="flex gap-2">
            <Link 
              to="/menus/archived" 
              className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 whitespace-nowrap flex items-center"
            >
              📁 Menu lưu trữ
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
            >
              Thêm Menu
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold mb-0">{editingMenu ? 'Sửa Menu' : 'Thêm Menu'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên menu *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                  <input type="text" name="url" value={formData.url} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="/san-pham" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Menu cha</label>
                  <select name="parent_id" value={formData.parent_id || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">-- Menu gốc --</option>
                    {rootMenus.map(menu => (<option key={menu.id} value={menu.id}>{menu.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại Menu</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="default">Mặc định</option>
                    <option value="mega">Mega Menu</option>
                  </select>
                </div>

                {formData.type === 'mega' && (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Mega Menu Columns</label>
                      <button type="button" onClick={() => { ensurePayload(); addColumn(); }} className="text-sm px-3 py-1 bg-brand-100 rounded">Thêm cột</button>
                    </div>

                    <div className="space-y-4">
                      {(formData.payload || []).map((col, idx) => (
                        <div key={idx} className="border rounded p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2 gap-4">
                            <input type="text" value={col.title || ''} onChange={(e) => updateColumnTitle(idx, e.target.value)} placeholder="Tiêu đề cột" className="px-2 py-1 border rounded flex-1" />
                            <div className="flex-shrink-0 flex gap-2">
                              <button type="button" onClick={() => addLink(idx)} className="px-3 py-1 text-sm bg-white border rounded">Thêm link</button>
                              <button type="button" onClick={() => removeColumn(idx)} className="px-3 py-1 text-sm bg-red-100 rounded">Xóa cột</button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {(col.links || []).map((link, li) => (
                              <div key={li} className="flex gap-2 items-center">
                                <input className="px-2 py-1 border rounded flex-1 min-w-0" value={link.name} onChange={(e) => updateLink(idx, li, 'name', e.target.value)} placeholder="Tên link" />
                                <input className="px-2 py-1 border rounded flex-1 min-w-0" value={link.url} onChange={(e) => updateLink(idx, li, 'url', e.target.value)} placeholder="URL" />
                                <button type="button" onClick={() => removeLink(idx, li)} className="px-2 py-1 bg-red-100 rounded text-sm">X</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(!formData.payload || formData.payload.length === 0) && <div className="text-sm text-gray-500">Chưa có cột nào. Thêm cột để xây dựng mega menu.</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon (class or filename)</label>
                        <div className="flex gap-2 items-center">
                          <input type="text" name="icon" value={formData.icon || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) handleUpload(e.target.files[0], 'icon'); }} />
                        </div>
                        {preview.icon && <img src={resolveAssetUrl(preview.icon)} alt="icon preview" className="h-8 mt-2" />}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image filename (uploads/menus)</label>
                        <div className="flex gap-2 items-center">
                          <input type="text" name="image" value={formData.image || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) handleUpload(e.target.files[0], 'image'); }} />
                        </div>
                        {preview.image && <img src={resolveAssetUrl(preview.image)} alt="image preview" className="h-20 mt-2 object-cover rounded" />}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Promo title (optional)</label>
                        <input type="text" name="promo_title" value={formData.promo_title || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Tiêu đề hiển thị bên phải mega menu" />
                        <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Promo CTA URL (optional)</label>
                        <input type="text" name="promo_cta" value={formData.promo_cta || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="/san-pham/epoxy" />
                        <div className="mt-3 flex gap-2 items-center">
                          <input type="file" accept="image/*" onChange={async (e) => {
                            if (!e.target.files[0]) return;
                            try {
                              const processed = await cropAndResize(e.target.files[0], 600, 400);
                              await handleUpload(processed, 'promo_image');
                            } catch (err) {
                              console.error('Crop/upload failed', err);
                              // fallback to direct upload
                              await handleUpload(e.target.files[0], 'promo_image');
                            }
                          }} />
                        </div>
                        {formData.promo_image && <img src={resolveAssetUrl(formData.promo_image.startsWith('http') ? formData.promo_image : `/storage/menus/${formData.promo_image}`)} alt="promo preview" className="h-28 mt-2 object-cover rounded" />}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thứ tự</label>
                  <input type="number" name="order" value={formData.order} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>

                <div>
                  <label className="flex items-center"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="mr-2" /> <span className="text-sm font-medium text-gray-700">Kích hoạt</span></label>
                </div>
              </div>

              <div className="px-6 py-3 border-t bg-white flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">{editingMenu ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Menu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menu cha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thứ tự
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMenus.map((menu) => (
              <tr key={menu.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {menu.icon || menu.icon_url ? (
                    <img src={resolveAssetUrl(menu.icon_url || (menu.icon ? `/storage/menus/${menu.icon}` : null))} alt="icon" className="h-6 w-6 object-contain" />
                  ) : <div className="text-xs text-gray-400">-</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {menu.image || menu.image_url ? (
                    <img src={resolveAssetUrl(menu.image_thumb_url || menu.image_url || (menu.image ? `/storage/menus/${menu.image}` : null))} alt="thumb" className="h-12 w-20 object-cover rounded" />
                  ) : <div className="text-xs text-gray-400">-</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{menu.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {menu.url}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {menu.parent ? menu.parent.name : '--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {menu.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${menu.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {menu.is_active ? 'Kích hoạt' : 'Tắt'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(menu)}
                    className="text-brand-600 hover:text-brand-900 mr-3"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {menus.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có menu nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;