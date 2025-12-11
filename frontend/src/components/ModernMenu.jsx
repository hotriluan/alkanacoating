import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modern Menu Component - Professional, Responsive, and Beautiful
 * Features:
 * - Smart responsive design (desktop/mobile)
 * - Mega menu with intelligent layout
 * - Smooth animations
 * - Touch-friendly mobile drawer
 * - Auto-close on outside click
 * - Keyboard navigation support
 */
const ModernMenu = ({ menuItems = [], categories = [], featuredProducts = [] }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  // Dynamic positioning for mega menu to keep it centered and clamped within viewport
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMenu(null);
  }, [window.location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Update dropdown position on viewport resize while open
  useEffect(() => {
    if (!openMenu || !anchorRect) return;
    const handler = () => updateDropdownPosition(anchorRect);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [openMenu, anchorRect]);

  const updateDropdownPosition = (rect) => {
    if (!rect) return;
    const vw = window.innerWidth;
    const margin = 16; // 1rem margin each side
    const panelWidth = Math.min(900, vw - margin * 2);
    let left = rect.left + rect.width / 2 - panelWidth / 2;
    // clamp within viewport margins
    if (left < margin) left = margin;
    if (left + panelWidth > vw - margin) left = vw - margin - panelWidth;
    const top = rect.bottom + 12; // a little offset below the trigger
    setDropdownStyle({ left, top, width: panelWidth });
  };

  const renderDesktopMenuItem = (item) => {
    const isActive = window.location.pathname === item.url;
    const isMega = item.menu_type === 'mega' || item.has_mega_menu;
    const isDropdown = item.menu_type === 'dropdown' || (item.children && item.children.length > 0);

    if (isMega) {
      return (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setAnchorRect(rect);
            updateDropdownPosition(rect);
            setOpenMenu(item.id);
          }}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${isActive
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100 hover:text-brand-600'
              }`}
          >
            {item.show_icon !== false && item.icon && (
              <span className="text-lg">{item.icon}</span>
            )}
            <span>{item.name}</span>
            {item.badge_text && (
              <span className={`text-xs px-2 py-0.5 rounded-full bg-${item.badge_color || 'blue'}-100 text-${item.badge_color || 'blue'}-700`}>
                {item.badge_text}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${openMenu === item.id ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {openMenu === item.id && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                style={{
                  left: dropdownStyle?.left ?? 16,
                  top: dropdownStyle?.top ?? 80,
                  width: dropdownStyle?.width ?? Math.min(900, window.innerWidth - 32),
                  maxHeight: 480,
                }}
              >
                <div className="overflow-y-auto max-h-[480px] overscroll-contain custom-scrollbar">
                  <div className="p-6">
                    <MegaMenuContent
                      item={item}
                      categories={categories}
                      featuredProducts={featuredProducts}
                      onClose={() => setOpenMenu(null)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (isDropdown) {
      return (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => setOpenMenu(item.id)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${isActive
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100 hover:text-brand-600'
              }`}
          >
            {item.show_icon !== false && item.icon && (
              <span className="text-lg">{item.icon}</span>
            )}
            <span>{item.name}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${openMenu === item.id ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {openMenu === item.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[220px]"
              >
                <div className="py-2">
                  {item.children?.map((child) => (
                    <Link
                      key={child.id}
                      to={child.url}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setOpenMenu(null)}
                    >
                      {child.icon && <span className="text-lg">{child.icon}</span>}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{child.name}</div>
                        {child.show_description && child.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{child.description}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Simple menu item
    return (
      <NavLink
        key={item.id}
        to={item.url}
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${isActive
            ? 'bg-brand-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-brand-600'
          }`
        }
      >
        {item.show_icon !== false && item.icon && (
          <span className="text-lg">{item.icon}</span>
        )}
        <span>{item.name}</span>
        {item.badge_text && (
          <span className={`text-xs px-2 py-0.5 rounded-full bg-${item.badge_color || 'blue'}-100 text-${item.badge_color || 'blue'}-700`}>
            {item.badge_text}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Menu */}
      <nav ref={menuRef} className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main menu">
        {menuItems.map(renderDesktopMenuItem)}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[110] lg:hidden overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-br from-brand-600 to-brand-700 text-white p-6 shadow-lg z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Menu</h2>
                      <p className="text-sm text-brand-100">Khám phá sản phẩm của chúng tôi</p>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <MobileMenuItem
                        item={item}
                        categories={categories}
                        onClose={() => setMobileMenuOpen(false)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Footer */}
                <div className="p-6 bg-gray-50 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    © 2025 Alkana Coating. All rights reserved.
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #4f46e5);
          border-radius: 10px;
          border: 2px solid #f8f9fa;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #4338ca);
        }
        
        /* Smooth hover underline effect */
        @keyframes underline-grow {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

// Mega Menu Content Component - Compact & Optimized for Viewport
const MegaMenuContent = ({ item, categories, featuredProducts, onClose }) => {
  const columns = 3; // Giảm từ 4 xuống 3 cột
  const showCategories = item.show_categories !== false;
  const showFeatured = item.show_featured_items && featuredProducts.length > 0;

  // Hiển thị tất cả danh mục; panel đã có scroll nên không cần giới hạn số lượng
  const displayCategories = categories;

  return (
    <div className={`grid gap-6 ${showFeatured ? 'grid-cols-1 lg:grid-cols-[2fr_1fr]' : 'grid-cols-1'}`}>
      {/* Categories Grid - Compact */}
      {showCategories && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span>Danh mục sản phẩm</span>
            </h3>
            <span className="text-xs text-gray-500 font-medium">{categories.length} danh mục</span>
          </div>

          {/* Compact Grid Layout */}
          <div
            className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3"
          >
            {displayCategories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
              >
                <Link
                  to={`/san-pham?category=${cat.id}`}
                  className="group block h-full"
                  onClick={onClose}
                >
                  <div className="relative h-full rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-brand-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    {/* Compact Thumbnail */}
                    {cat.image_url || cat.image ? (
                      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={cat.image_url || `/${cat.image}`}
                          alt={cat.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {cat.products_count > 0 && (
                          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow">
                            <span className="text-xs font-bold text-brand-600">{cat.products_count}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-24 bg-gradient-to-br from-brand-50 via-blue-50 to-purple-50 flex items-center justify-center">
                        {cat.icon ? (
                          <span className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                            {cat.icon}
                          </span>
                        ) : (
                          <svg className="w-10 h-10 text-brand-300 group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        )}
                      </div>
                    )}

                    {/* Compact Info */}
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors text-sm line-clamp-2 mb-1">
                        {cat.name}
                      </h4>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {cat.products_count || 0} SP
                        </span>
                        <div className="flex items-center gap-1 text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="font-semibold">Xem</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* View All Button removed here; moved to sticky footer below */}
        </div>
      )}

      {/* Featured Products - Compact */}
      {showFeatured && (
        <div className="lg:border-l lg:border-gray-200 lg:pl-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span>Nổi bật</span>
          </h3>
          <div className="space-y-2">
            {featuredProducts.slice(0, 3).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  to={`/san-pham/${product.slug}`}
                  className="block group"
                  onClick={onClose}
                >
                  <div className="flex gap-2 bg-white rounded-lg p-2 hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-brand-300">
                    {product.images && product.images.length > 0 && (
                      <div className="relative overflow-hidden rounded w-16 h-16 flex-shrink-0 bg-gray-100">
                        <img
                          src={product.images[0].image_url}
                          alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-800 group-hover:text-brand-600 line-clamp-2 transition-colors">
                        {product.name}
                      </h4>
                      {product.category && (
                        <span className="inline-block text-xs bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded mt-1 font-medium">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {/* Sticky footer: View All categories */}
      {showCategories && (
        <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <Link
            to="/san-pham"
            className="w-full inline-flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 transition-all duration-300 font-semibold shadow-md text-sm group"
            onClick={onClose}
          >
            <span>Xem tất cả {categories.length} danh mục</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

// Mobile Menu Item Component - Enhanced with Better UX
const MobileMenuItem = ({ item, categories, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMega = item.menu_type === 'mega' || item.has_mega_menu;
  const hasChildren = item.children && item.children.length > 0;

  if (!isMega && !hasChildren) {
    return (
      <Link
        to={item.url}
        className="flex items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-brand-50 hover:to-blue-50 transition-all duration-200 group"
        onClick={onClose}
      >
        {item.icon && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-xl">{item.icon}</span>
          </div>
        )}
        <span className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">{item.name}</span>
        <svg className="w-5 h-5 ml-auto text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    );
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {item.icon && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-100 to-blue-100 flex items-center justify-center">
              <span className="text-xl">{item.icon}</span>
            </div>
          )}
          <span className="font-semibold text-gray-800">{item.name}</span>
        </div>
        <svg
          className={`w-6 h-6 text-brand-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-gradient-to-br from-gray-50 to-white"
          >
            <div className="px-4 pb-4 pt-2 space-y-1">
              {isMega ? (
                <>
                  {/* Mega Menu Categories in Mobile */}
                  <div className="mb-3">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2 px-3">Danh mục sản phẩm</div>
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/san-pham?category=${cat.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-sm text-gray-700 hover:text-brand-600 group"
                          onClick={onClose}
                        >
                          {cat.icon && <span className="text-lg">{cat.icon}</span>}
                          <span className="flex-1 font-medium">{cat.name}</span>
                          {cat.products_count > 0 && (
                            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                              {cat.products_count}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link
                    to="/san-pham"
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 transition-all font-semibold shadow-md"
                    onClick={onClose}
                  >
                    <span className="text-sm">Xem tất cả</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </>
              ) : (
                item.children?.map((child) => (
                  <Link
                    key={child.id}
                    to={child.url}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-sm text-gray-700 hover:text-brand-600"
                    onClick={onClose}
                  >
                    {child.icon && <span className="text-base">{child.icon}</span>}
                    <span className="flex-1 font-medium">{child.name}</span>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernMenu;
