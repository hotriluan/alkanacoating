import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../services/api';
import EmojiInputField from '../components/EmojiInputField';

function SortableMenuItem({ id, menu, depth = 0, onEdit, onDelete, onAddChild }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: `${depth * 2}rem`,
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'link': return '🔗';
      case 'category': return '📁';
      case 'mega': return '📊';
      case 'page': return '📄';
      default: return '📌';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...listeners}
            {...attributes}
            className="cursor-move hover:bg-gray-100 p-2 rounded-md"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          {/* Menu Info */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-2xl">{menu.icon || getTypeIcon(menu.type)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{menu.name}</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {menu.type || 'link'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{menu.url || 'No URL'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddChild(menu)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Add submenu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(menu)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(menu.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuBuilderEnhanced() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'link',
    icon: '',
    parent_id: null,
    order: 0,
    is_active: true,
    has_mega_menu: false,
    mega_menu_config: {
      show_categories: true,
      show_featured_products: true,
      columns: 3,
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/menus');
      setMenus(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => item.parent_id === parentId)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  const flattenTree = (tree, depth = 0) => {
    let result = [];
    tree.forEach(item => {
      result.push({ ...item, depth });
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenTree(item.children, depth + 1));
      }
    });
    return result;
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const flatMenus = flattenTree(buildTree(menus));
      const oldIndex = flatMenus.findIndex(m => m.id === active.id);
      const newIndex = flatMenus.findIndex(m => m.id === over.id);
      
      const newOrder = arrayMove(flatMenus, oldIndex, newIndex);
      
      // Update order for all items
      const updates = newOrder.map((menu, index) => ({
        id: menu.id,
        order: index,
      }));

      // Optimistically update UI
      const updatedMenus = menus.map(menu => {
        const update = updates.find(u => u.id === menu.id);
        return update ? { ...menu, order: update.order } : menu;
      });
      setMenus(updatedMenus);

      // Send to backend
      try {
        await api.post('/admin/menus/reorder', { updates });
      } catch (error) {
        console.error('Error reordering menus:', error);
        fetchMenus(); // Revert on error
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Submitting menu data:', formData);
    
    try {
      let response;
      if (currentMenu) {
        response = await api.put(`/admin/menus/${currentMenu.id}`, formData);
        alert('✅ Cập nhật menu thành công!');
      } else {
        response = await api.post('/admin/menus', formData);
        alert('✅ Tạo menu thành công!');
      }
      console.log('Response:', response.data);
      fetchMenus();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving menu:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      const errors = error.response?.data?.errors;
      let errorText = 'Lỗi khi lưu menu: ' + errorMessage;
      if (errors) {
        errorText += '\n\nChi tiết:\n' + Object.entries(errors).map(([field, msgs]) => `${field}: ${msgs.join(', ')}`).join('\n');
      }
      alert(errorText);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa menu này?')) {
      try {
        await api.delete(`/admin/menus/${id}`);
        fetchMenus();
      } catch (error) {
        console.error('Error deleting menu:', error);
        alert('Lỗi khi xóa menu: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (menu) => {
    setCurrentMenu(menu);
    setFormData({
      name: menu.name || '',
      url: menu.url || '',
      type: menu.type || 'link',
      icon: menu.icon || '',
      parent_id: menu.parent_id || null,
      order: menu.order || 0,
      is_active: menu.is_active !== false,
      has_mega_menu: menu.has_mega_menu || false,
      mega_menu_config: menu.mega_menu_config || {
        show_categories: true,
        show_featured_products: true,
        columns: 3,
      },
    });
    setShowModal(true);
  };

  const handleAddChild = (parentMenu) => {
    setCurrentMenu(null);
    setFormData({
      name: '',
      url: '',
      type: 'link',
      icon: '',
      parent_id: parentMenu.id,
      order: 0,
      is_active: true,
      has_mega_menu: false,
      mega_menu_config: {
        show_categories: true,
        show_featured_products: true,
        columns: 3,
      },
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentMenu(null);
    setFormData({
      name: '',
      url: '',
      type: 'link',
      icon: '',
      parent_id: null,
      order: 0,
      is_active: true,
      has_mega_menu: false,
      mega_menu_config: {
        show_categories: true,
        show_featured_products: true,
        columns: 3,
      },
    });
  };

  const menuTree = buildTree(menus);
  const flatMenus = flattenTree(menuTree);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Menu Builder</h1>
          <p className="text-gray-600 mt-1">Drag & drop để sắp xếp menu</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Preview Mode */}
      {showPreview && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Preview</h2>
          <nav className="bg-gray-800 text-white p-4 rounded-lg">
            <ul className="flex gap-6">
              {menuTree.map(item => (
                <li key={item.id} className="relative group">
                  <a href={item.url} className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.name}</span>
                  </a>
                  {item.children && item.children.length > 0 && (
                    <ul className="absolute top-full left-0 mt-2 bg-white text-gray-800 shadow-xl rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {item.children.map(child => (
                        <li key={child.id}>
                          <a href={child.url} className="block px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                            {child.icon && <span>{child.icon}</span>}
                            <span>{child.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Menu Tree */}
      <div className="bg-gray-50 rounded-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          </div>
        ) : flatMenus.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Chưa có menu nào. Click "Add Menu Item" để tạo mới.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={flatMenus.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {flatMenus.map(menu => (
                <SortableMenuItem
                  key={menu.id}
                  id={menu.id}
                  menu={menu}
                  depth={menu.depth}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddChild={handleAddChild}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentMenu ? 'Edit Menu Item' : 'Add Menu Item'}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Menu Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                >
                  <option value="link">Link</option>
                  <option value="category">Category</option>
                  <option value="mega">Mega Menu</option>
                  <option value="page">Page</option>
                </select>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  placeholder="/san-pham"
                />
              </div>

              {/* Icon */}
              <EmojiInputField
                value={formData.icon}
                onChange={(newIcon) => setFormData({ ...formData, icon: newIcon })}
                label="Icon (Emoji)"
                placeholder="🏠"
              />

              {/* Parent */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Menu</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">None (Root Level)</option>
                  {menus
                    .filter(m => !currentMenu || m.id !== currentMenu.id)
                    .map(menu => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-2 focus:ring-brand-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                  Active
                </label>
              </div>

              {/* Mega Menu Configuration */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="has_mega_menu"
                    checked={formData.has_mega_menu}
                    onChange={(e) => setFormData({ ...formData, has_mega_menu: e.target.checked })}
                    className="w-5 h-5 text-brand-600 rounded focus:ring-2 focus:ring-brand-500"
                  />
                  <label htmlFor="has_mega_menu" className="text-sm font-semibold text-gray-700">
                    📊 Bật Mega Menu (Hiển thị danh mục sản phẩm khi hover)
                  </label>
                </div>

                {formData.has_mega_menu && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-blue-900">Cấu hình Mega Menu</h4>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="show_categories"
                        checked={formData.mega_menu_config.show_categories}
                        onChange={(e) => setFormData({
                          ...formData,
                          mega_menu_config: { ...formData.mega_menu_config, show_categories: e.target.checked }
                        })}
                        className="w-4 h-4 text-brand-600 rounded"
                      />
                      <label htmlFor="show_categories" className="text-sm text-gray-700">
                        Hiển thị danh mục sản phẩm
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="show_featured_products"
                        checked={formData.mega_menu_config.show_featured_products}
                        onChange={(e) => setFormData({
                          ...formData,
                          mega_menu_config: { ...formData.mega_menu_config, show_featured_products: e.target.checked }
                        })}
                        className="w-4 h-4 text-brand-600 rounded"
                      />
                      <label htmlFor="show_featured_products" className="text-sm text-gray-700">
                        Hiển thị sản phẩm nổi bật
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Số cột hiển thị danh mục</label>
                      <select
                        value={formData.mega_menu_config.columns}
                        onChange={(e) => setFormData({
                          ...formData,
                          mega_menu_config: { ...formData.mega_menu_config, columns: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="2">2 cột</option>
                        <option value="3">3 cột</option>
                        <option value="4">4 cột</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors font-semibold"
                >
                  {currentMenu ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
