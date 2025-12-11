import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import api from '../../../services/api';

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data.data || res.data);
    });
    api.get('/settings/group/contact').then(res => {
      const settingsData = res.data.data || res.data;
      const settingsObj = {};
      if (Array.isArray(settingsData)) {
        settingsData.forEach(setting => { settingsObj[setting.key] = setting.value; });
      } else {
        Object.assign(settingsObj, settingsData);
      }
      setSettings(settingsObj);
    }).catch(()=>{});
  }, []);

  // Đồng bộ selectedCategory từ URL khi component mount hoặc URL thay đổi
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  // Khi selectedCategory thay đổi (từ UI), cập nhật URL
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const categoryId = selectedCategory ? Number(selectedCategory) : '';

  const handleRemoveFilter = (filterType) => {
    if (filterType === 'category') {
      handleCategoryChange('');
    } else if (filterType === 'search') {
      setSearchTerm('');
    }
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (searchTerm ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8" data-aos="fade-down">
        <h1 className="text-4xl font-bold text-brand-800 mb-4">Sản phẩm</h1>
        <p className="text-lg text-slate-600">Danh mục sơn công nghiệp, sơn epoxy, PU, chống ăn mòn, phủ bảo vệ...</p>
      </div>

      <div className="flex gap-6" data-aos="fade-up" data-aos-delay="200">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Categories Tree */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Danh mục sản phẩm</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    !selectedCategory
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(String(category.id))}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      selectedCategory === String(category.id)
                        ? 'bg-brand-50 text-brand-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category.icon && <span className="text-lg">{category.icon}</span>}
                    <span className="flex-1">{category.name}</span>
                    {selectedCategory === String(category.id) && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Count */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="font-medium">{activeFiltersCount} bộ lọc đang áp dụng</span>
                  <button
                    onClick={() => {
                      handleCategoryChange('');
                      setSearchTerm('');
                    }}
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-brand-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Bộ lọc</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Mobile */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Categories Mobile */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Danh mục sản phẩm</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { handleCategoryChange(''); setSidebarOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md ${!selectedCategory ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    Tất cả sản phẩm
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => { handleCategoryChange(String(category.id)); setSidebarOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                        selectedCategory === String(category.id) ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category.icon && <span className="text-lg">{category.icon}</span>}
                      <span className="flex-1">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { handleCategoryChange(''); setSearchTerm(''); setSidebarOpen(false); }}
                  className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Xóa tất cả bộ lọc ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar: Active Filters + Sort + View Toggle */}
          <div className="mb-6">
            {/* Active Filter Pills */}
            {(selectedCategory || searchTerm) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm">
                    <span className="font-medium">
                      {categories.find(c => String(c.id) === selectedCategory)?.name || 'Danh mục'}
                    </span>
                    <button
                      onClick={() => handleRemoveFilter('category')}
                      className="hover:bg-brand-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm">
                    <span className="font-medium">Tìm kiếm: "{searchTerm}"</span>
                    <button
                      onClick={() => handleRemoveFilter('search')}
                      className="hover:bg-brand-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Sort + View Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Phổ biến</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Xem dạng lưới"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Xem dạng danh sách"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid 
            categoryId={categoryId} 
            searchTerm={searchTerm} 
            sortBy={sortBy}
            viewMode={viewMode}
          />
        </div>
      </div>

      <div className="mt-16 text-center bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl p-8" data-aos="zoom-in" data-aos-delay="600">
        <h2 className="text-2xl font-bold text-brand-800 mb-4">
          Cần tư vấn sản phẩm phù hợp?
        </h2>
        <p className="text-slate-600 mb-6">
          Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn lựa chọn giải pháp tối ưu
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/lien-he"
            className="bg-brand-600 text-white px-8 py-3 rounded-lg hover:bg-brand-700 transition-all duration-200 transform hover:scale-105"
          >
            Liên hệ tư vấn
          </a>
          {settings.contact_phone && (
            <a
              href={`tel:${settings.contact_phone}`}
              className="bg-white border border-brand-600 text-brand-600 px-8 py-3 rounded-lg hover:bg-brand-50 transition-all duration-200 transform hover:scale-105"
            >
              📞 Hotline: {settings.contact_phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
