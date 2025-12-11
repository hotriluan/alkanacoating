import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuthStore();

  // Protect the layout: if the user is not authenticated, redirect to login.
  useEffect(() => {
    // A small delay to allow the store to rehydrate from localStorage
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        navigate('/admin/login');
      }
    }, 100); // 100ms delay might need adjustment
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất.");
    navigate('/admin/login');
  };

  // Do not render children if not authenticated to prevent flicker
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
          }}
        />
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-800">
              Hệ thống quản trị Alkana Coating
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;