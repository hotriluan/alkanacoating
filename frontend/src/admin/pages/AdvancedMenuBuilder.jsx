import { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../services/api';
import MenuPreview from '../components/MenuPreview';
import EmojiInputField from '../components/EmojiInputField';

// Tree helpers
function buildTree(items, parentId = null) {
  return (items || [])
    .filter(it => (it.parent_id ?? null) === parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(it => ({ ...it, children: buildTree(items, it.id) }));
}

function flattenTree(nodes, depth = 0, acc = []) {
  nodes.forEach(n => {
    acc.push({ ...n, _depth: depth });
    if (n.children && n.children.length) flattenTree(n.children, depth + 1, acc);
  });
  return acc;
}

function findNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    const inChild = findNode(n.children || [], id);
    if (inChild) return inChild;
  }
  return null;
}

function collectDescendantIds(node) {
  const ids = [];
  if (!node) return ids;
  for (const c of node.children || []) {
    ids.push(c.id, ...collectDescendantIds(c));
  }
  return ids;
}

// Sortable Menu Item Component
function SortableMenuItem({ id, menu, depth = 0, parentName = null, childCount = 0, onEdit, onDelete, onToggleMega, onDuplicate, onAddChild }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: `${depth * 2}rem`,
  };

  const getMenuTypeIcon = (type) => {
    switch (type) {
      case 'mega': return '📊';
      case 'dropdown': return '📁';
      default: return '📄';
    }
  };

  // Normalize menu type to reflect backend flags (menu_type + has_mega_menu + children)
  const getDisplayType = (menu) => {
    if (menu.menu_type === 'mega' || menu.has_mega_menu) return 'mega';
    if (menu.menu_type === 'dropdown') return 'dropdown';
    if (menu.children && menu.children.length > 0) return 'dropdown';
    return 'simple';
  };
  const displayType = getDisplayType(menu);
  const typeBadge = {
    mega: { bg: 'bg-purple-100', text: 'text-purple-700' },
    dropdown: { bg: 'bg-green-100', text: 'text-green-700' },
    simple: { bg: 'bg-gray-100', text: 'text-gray-700' },
  }[displayType];

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-brand-300">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div {...listeners} {...attributes} className="cursor-move hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          {/* Menu Info */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-2xl">{menu.icon || getMenuTypeIcon(displayType)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">{menu.name}</h3>
                <span className={`text-xs px-2 py-1 ${typeBadge.bg} ${typeBadge.text} rounded-full font-medium capitalize`}>
                  {displayType}
                </span>
                {parentName && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Cha: {parentName}</span>
                )}
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Con: {childCount}</span>
                {menu.is_highlighted && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">⭐ Nổi bật</span>
                )}
                {menu.badge_text && (
                  <span className={`text-xs px-2 py-1 bg-${menu.badge_color}-100 text-${menu.badge_color}-700 rounded-full`}>
                    {menu.badge_text}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{menu.url}</p>
              {menu.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{menu.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <NestDropTarget parentId={menu.id} />
            <button
              onClick={() => onAddChild(menu)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Thêm menu con"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
            </button>
            <button
              onClick={() => onToggleMega(menu)}
              className={`p-2 rounded-lg transition-all ${
                menu.menu_type === 'mega' || menu.has_mega_menu
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Toggle Mega Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onDuplicate(menu)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Nhân bản"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(menu)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(menu.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
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

function NestDropTarget({ parentId }) {
  const { isOver, setNodeRef } = useDroppable({ id: `child-${parentId}` });
  return (
    <div
      ref={setNodeRef}
      className={`px-2 py-1 rounded text-xs border transition-colors ${isOver ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
      title="Kéo-thả mục khác vào đây để đặt làm menu con"
    >
      Thả để làm con
    </div>
  );
}

export default function AdvancedMenuBuilder() {
  const [menus, setMenus] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: '',
    parent_id: null,
    menu_type: 'simple',
    style_preset: 'modern',
    layout_columns: 3,
    show_icon: true,
    show_description: false,
    description: '',
    badge_text: '',
    badge_color: 'blue',
    is_highlighted: false,
    animation_type: 'fade',
    animation_duration: 200,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchMenus();
    fetchTemplates();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await api.get('/admin/menus');
      setMenus(response.data);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/admin/menus/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    // Nesting drop target
    if (String(over.id).startsWith('child-')) {
      const newParentId = Number(String(over.id).replace('child-',''));
      const dragged = menus.find(m => m.id === active.id);
      if (!dragged || dragged.id === newParentId) return;

      // Prevent making it a child of its own descendant
      const tree = buildTree(menus);
      const draggedNode = findNode(tree, dragged.id);
      const descendants = collectDescendantIds(draggedNode);
      if (descendants.includes(newParentId)) return;

      try {
        // Send full menu data with updated parent_id
        const updateData = {
          name: dragged.name,
          url: dragged.url,
          parent_id: newParentId,
          icon: dragged.icon || '',
          menu_type: dragged.menu_type || 'simple',
          style_preset: dragged.style_preset || 'modern',
          layout_columns: dragged.layout_columns || 3,
          show_icon: dragged.show_icon !== false,
          show_description: dragged.show_description || false,
          description: dragged.description || '',
          badge_text: dragged.badge_text || '',
          badge_color: dragged.badge_color || 'blue',
          is_highlighted: dragged.is_highlighted || false,
          animation_type: dragged.animation_type || 'fade',
          animation_duration: dragged.animation_duration || 200,
        };
        await api.put(`/admin/menus/${dragged.id}`, updateData);
        await fetchMenus();
      } catch (e) {
        console.error('Error nesting menu:', e);
        alert('Lỗi khi chuyển menu con: ' + (e.response?.data?.message || e.message));
      }
      return;
    }

    // Reorder using flattened list
    if (active.id !== over.id) {
      const tree = buildTree(menus);
      const flat = flattenTree(tree);
      const oldIndex = flat.findIndex(m => m.id === active.id);
      const newIndex = flat.findIndex(m => m.id === over.id);
      const newFlat = arrayMove(flat, oldIndex, newIndex);
      const updates = newFlat.map((m, idx) => ({ id: m.id, order: idx }));
      try {
        await api.post('/admin/menus/reorder', { updates });
        await fetchMenus();
      } catch (e) {
        console.error('Error reordering menus:', e);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await api.put(`/admin/menus/${editingMenu.id}`, formData);
      } else {
        await api.post('/admin/menus', formData);
      }
      fetchMenus();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving menu:', error);
      alert('Lỗi khi lưu menu!');
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name || '',
      url: menu.url || '',
      icon: menu.icon || '',
      parent_id: menu.parent_id ?? null,
      menu_type: menu.menu_type || 'simple',
      style_preset: menu.style_preset || 'modern',
      layout_columns: menu.layout_columns || 3,
      show_icon: menu.show_icon !== false,
      show_description: menu.show_description || false,
      description: menu.description || '',
      badge_text: menu.badge_text || '',
      badge_color: menu.badge_color || 'blue',
      is_highlighted: menu.is_highlighted || false,
      animation_type: menu.animation_type || 'fade',
      animation_duration: menu.animation_duration || 200,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa menu này?')) {
      try {
        await api.delete(`/admin/menus/${id}`);
        fetchMenus();
      } catch (error) {
        console.error('Error deleting menu:', error);
      }
    }
  };

  const handleToggleMega = async (menu) => {
    try {
      await api.post(`/admin/menus/${menu.id}/toggle-mega`);
      fetchMenus();
    } catch (error) {
      console.error('Error toggling mega menu:', error);
    }
  };

  const handleDuplicate = async (menu) => {
    try {
      await api.post(`/admin/menus/${menu.id}/duplicate`);
      fetchMenus();
    } catch (error) {
      console.error('Error duplicating menu:', error);
    }
  };

  const applyTemplate = (template) => {
    setFormData({ ...formData, ...template.config });
  };

  const resetForm = () => {
    setEditingMenu(null);
    setFormData({
      name: '',
      url: '',
      icon: '',
      parent_id: null,
      menu_type: 'simple',
      style_preset: 'modern',
      layout_columns: 3,
      show_icon: true,
      show_description: false,
      description: '',
      badge_text: '',
      badge_color: 'blue',
      is_highlighted: false,
      animation_type: 'fade',
      animation_duration: 200,
    });
  };

  // Quickly open form to add a submenu under a parent
  const handleAddChild = (parent) => {
    setEditingMenu(null);
    setFormData({
      name: '',
      url: '',
      icon: '',
      parent_id: parent?.id || null,
      menu_type: 'dropdown',
      style_preset: 'modern',
      layout_columns: 3,
      show_icon: true,
      show_description: false,
      description: '',
      badge_text: '',
      badge_color: 'blue',
      is_highlighted: false,
      animation_type: 'fade',
      animation_duration: 200,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-4xl">🎨</span>
              Menu Builder Pro
            </h1>
            <p className="text-gray-600 mt-2">Quản lý menu chuyên nghiệp với drag & drop</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm Menu Mới
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Tổng Menu</div>
            <div className="text-2xl font-bold text-blue-700">{menus.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Mega Menu</div>
            <div className="text-2xl font-bold text-purple-700">
              {menus.filter(m => m.menu_type === 'mega' || m.has_mega_menu).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="text-sm text-green-600 font-medium">Dropdown</div>
            <div className="text-2xl font-bold text-green-700">
              {menus.filter(m => m.menu_type === 'dropdown' || (m.children && m.children.length > 0)).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium">Active</div>
            <div className="text-2xl font-bold text-yellow-700">
              {menus.filter(m => m.is_active).length}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8 overflow-visible">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Xem trước (Live Preview)</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMenus}
              className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              title="Tải lại dữ liệu"
            >
              Làm mới
            </button>
          </div>
        </div>
        <MenuPreview menuItems={menus} />
      </div>

      {/* Menu List (hierarchical with nesting drop targets) */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách Menu</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {(() => {
            const tree = buildTree(menus);
            const flat = flattenTree(tree);
            return (
              <SortableContext items={flat.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {flat.map((menu) => (
                    <SortableMenuItem
                      key={menu.id}
                      id={menu.id}
                      menu={menu}
                      depth={menu._depth || 0}
                      parentName={(menus.find(m => m.id === (menu.parent_id ?? null)) || {}).name}
                      childCount={(menu.children && menu.children.length) || 0}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleMega={handleToggleMega}
                      onDuplicate={handleDuplicate}
                      onAddChild={handleAddChild}
                    />
                  ))}
                </div>
              </SortableContext>
            );
          })()}
        </DndContext>
        {menus.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <p>Chưa có menu nào. Hãy tạo menu đầu tiên!</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingMenu ? '✏️ Chỉnh sửa Menu' : '➕ Thêm Menu Mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Templates */}
              {!editingMenu && templates.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">📋 Áp dụng Template</label>
                  <div className="grid grid-cols-3 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-all text-left"
                      >
                        <div className="font-semibold text-gray-800 mb-1">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Menu *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Ví dụ: Sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL *</label>
                  <input
                    type="text"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    placeholder="/san-pham"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <EmojiInputField
                  value={formData.icon}
                  onChange={(newIcon) => setFormData({ ...formData, icon: newIcon })}
                  label="Icon (Emoji hoặc class)"
                  placeholder="🎨"
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loại Menu</label>
                  <select
                    value={formData.menu_type}
                    onChange={(e) => setFormData({ ...formData, menu_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="simple">Simple</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="mega">Mega Menu</option>
                  </select>
                </div>
              </div>

              {/* Parent selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thuộc menu cha</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">— Không (menu gốc) —</option>
                  {menus
                    .filter(m => !editingMenu || m.id !== editingMenu.id)
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                {formData.parent_id && (
                  <div className="text-xs text-gray-500 mt-1">Sẽ tạo dưới menu: {menus.find(m => m.id === formData.parent_id)?.name || formData.parent_id}</div>
                )}
              </div>

              {/* Advanced Options */}
              {formData.menu_type === 'mega' && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-3">Cấu hình Mega Menu</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Số cột</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={formData.layout_columns}
                        onChange={(e) => setFormData({ ...formData, layout_columns: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Style</label>
                      <select
                        value={formData.style_preset}
                        onChange={(e) => setFormData({ ...formData, style_preset: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="minimal">Minimal</option>
                        <option value="cards">Cards</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Animation</label>
                      <select
                        value={formData.animation_type}
                        onChange={(e) => setFormData({ ...formData, animation_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="scale">Scale</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Badge & Highlight */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="NEW, HOT, ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Color</label>
                  <select
                    value={formData.badge_color}
                    onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="blue">Blue</option>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_highlighted}
                      onChange={(e) => setFormData({ ...formData, is_highlighted: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">⭐ Nổi bật</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="show_description"
                    checked={formData.show_description}
                    onChange={(e) => setFormData({ ...formData, show_description: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-brand-600"
                  />
                  <label htmlFor="show_description" className="text-sm font-semibold text-gray-700">
                    Hiển thị mô tả
                  </label>
                </div>
                {formData.show_description && (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    rows="3"
                    placeholder="Mô tả ngắn cho menu item..."
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg font-medium"
                >
                  {editingMenu ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
