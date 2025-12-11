import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '📦' },
    { path: '/admin/categories', label: 'Danh mục', icon: '📁' },
    { path: '/admin/sliders', label: 'Slider', icon: '🖼️' },
    { path: '/admin/menus/advanced', label: 'Menu', icon: '📋' },
    { path: '/admin/projects', label: 'Dự án', icon: '🏗️' },
    { path: '/admin/posts', label: 'Bài viết', icon: '📝' },
    { path: '/admin/post-categories', label: 'Danh mục Bài viết', icon: '📑' },
    { path: '/admin/post-tags', label: 'Tags Bài viết', icon: '🏷️' },
    { path: '/admin/recruitments', label: 'Tuyển dụng', icon: '👥' },
    { path: '/admin/applications', label: 'Hồ sơ ứng tuyển', icon: '📄' },
    { path: '/admin/contacts', label: 'Tin nhắn Liên hệ', icon: '📧' },
    { path: '/admin/users', label: 'Quản lý User', icon: '👤' },
    { path: '/admin/images/cleanup', label: 'Quản lý Hình ảnh', icon: '🖼️' },
    { path: '/admin/settings', label: 'Cài đặt Website', icon: '⚙️' },
    { path: '/admin/backups', label: 'Sao lưu & Khôi phục', icon: '💾' },
    { path: '/admin/analytics', label: 'Phân tích Website', icon: '📈' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-brand-300">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-sm hover:bg-gray-700 transition-colors ${isActive(item.path) ? 'bg-brand-600 border-r-4 border-brand-400' : ''
              }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;