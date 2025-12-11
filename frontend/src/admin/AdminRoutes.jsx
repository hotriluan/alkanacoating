import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import SliderManagement from './pages/SliderManagement';
import AdvancedMenuBuilder from './pages/AdvancedMenuBuilder';
import ProjectManagement from './pages/ProjectManagement';
import PostManagement from './pages/PostManagement';
import PostCategoryManagement from './pages/PostCategoryManagement';
import PostTagManagement from './pages/PostTagManagement';
import RecruitmentManagement from './pages/RecruitmentManagement';
import ApplicationManagement from './pages/ApplicationManagement';
import SettingsManagement from './pages/SettingsManagement';
import ContactManagement from './pages/ContactManagement';
import UserManagement from './pages/UserManagement';
import ImageCleanup from './pages/ImageCleanupFixed';
import CategoryManagementEnhanced from '../pages/admin/CategoryManagementEnhanced';
import ProductManagement from './pages/ProductManagement';
import AdminDashboard from '../pages/AdminDashboard';
import Analytics from './pages/Analytics';
import BackupManagement from './pages/BackupManagement';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/sliders" element={<SliderManagement />} />
        {/* Redirect old basic menu path to advanced builder to avoid duplication */}
        <Route path="/menus" element={<Navigate to="/admin/menus/advanced" replace />} />
        {/* Redirect legacy archived menus path to advanced builder */}
        <Route path="/menus/archived" element={<Navigate to="/admin/menus/advanced" replace />} />
        <Route path="/menus/advanced" element={<AdvancedMenuBuilder />} />
        <Route path="/projects" element={<ProjectManagement />} />
        <Route path="/posts" element={<PostManagement />} />
        <Route path="/post-categories" element={<PostCategoryManagement />} />
        <Route path="/post-tags" element={<PostTagManagement />} />
        <Route path="/recruitments" element={<RecruitmentManagement />} />
        <Route path="/applications" element={<ApplicationManagement />} />
        <Route path="/categories" element={<CategoryManagementEnhanced />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/settings" element={<SettingsManagement />} />
        <Route path="/backups" element={<BackupManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/contacts" element={<ContactManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/images/cleanup" element={<ImageCleanup />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;