import { useState, useEffect, useRef } from 'react';
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

  const renderDesktopMenuItem = (item) => {
    const isActive = window.location.pathname === item.url;
    const isMega = item.menu_type === 'mega' || item.has_mega_menu;
    const isDropdown = item.menu_type === 'dropdown' || (item.children && item.children.length > 0);

    if (isMega) {
      return (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => setOpenMenu(item.id)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${
              isActive
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: (item.animation_duration || 200) / 1000 }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                style={{
                  width: item.max_width || 'min(1000px, calc(100vw - 2rem))',
                  maxHeight: 'calc(100vh - 120px)',
                }}
              >
                <div className="overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
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
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${
              isActive
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
          `px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${
            isActive
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
      <nav ref={menuRef} className="hidden lg:flex items-center gap-1">
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <MobileMenuItem
                      key={item.id}
                      item={item}
                      categories={categories}
                      onClose={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </>
  );
};

// Mega Menu Content Component
const MegaMenuContent = ({ item, categories, featuredProducts, onClose }) => {
  const columns = item.layout_columns || 3;
  const showCategories = item.show_categories !== false;
  const showFeatured = item.show_featured_items && featuredProducts.length > 0;

  return (
    <div className={`grid gap-6 ${showFeatured ? 'grid-cols-1 lg:grid-cols-[1fr_300px]' : 'grid-cols-1'}`}>
      {/* Categories Grid */}
      {showCategories && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Danh mục sản phẩm
          </h3>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/san-pham?category=${cat.id}`}
                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-brand-50 hover:to-blue-50 transition-all duration-200 border border-transparent hover:border-brand-200"
                onClick={onClose}
              >
                {cat.icon && <span className="text-2xl flex-shrink-0">{cat.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors text-sm">
                    {cat.name}
                  </div>
                  {cat.products_count > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">{cat.products_count} sản phẩm</div>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
          <Link
            to="/san-pham"
            className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg mt-4"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-sm">Xem tất cả sản phẩm</span>
          </Link>
        </div>
      )}

      {/* Featured Products */}
      {showFeatured && (
        <div className="lg:border-l lg:pl-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Sản phẩm nổi bật
          </h3>
          <div className="space-y-3">
            {featuredProducts.slice(0, item.featured_items_count || 4).map((product) => (
              <Link
                key={product.id}
                to={`/san-pham/${product.slug}`}
                className="block group"
                onClick={onClose}
              >
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-brand-300">
                  {product.images && product.images.length > 0 && (
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-32 object-cover transform group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <h4 className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 line-clamp-2 transition-colors">
                    {product.name}
                  </h4>
                  {product.category && (
                    <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Menu Item Component
const MobileMenuItem = ({ item, categories, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMega = item.menu_type === 'mega' || item.has_mega_menu;
  const hasChildren = item.children && item.children.length > 0;

  if (!isMega && !hasChildren) {
    return (
      <Link
        to={item.url}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={onClose}
      >
        {item.icon && <span className="text-xl">{item.icon}</span>}
        <span className="font-medium text-gray-800">{item.name}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {item.icon && <span className="text-xl">{item.icon}</span>}
          <span className="font-medium text-gray-800">{item.name}</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pr-3 py-2 space-y-1">
              {isMega ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/san-pham?category=${cat.id}`}
                    className="block p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                    onClick={onClose}
                  >
                    {cat.name}
                  </Link>
                ))
              ) : (
                item.children?.map((child) => (
                  <Link
                    key={child.id}
                    to={child.url}
                    className="block p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                    onClick={onClose}
                  >
                    {child.name}
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
