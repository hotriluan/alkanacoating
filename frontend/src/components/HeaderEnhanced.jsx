import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function HeaderEnhanced({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, categoriesRes, productsRes] = await Promise.all([
          api.get('/menus'),
          api.get('/categories'),
          api.get('/products/featured'),
        ]);
        setMenuItems(menusRes.data);
        setCategories(categoriesRes.data.data || categoriesRes.data);
        setFeaturedProducts((productsRes.data.data || productsRes.data).slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Load contact settings
    api.get('/settings/group/contact').then(res => {
      const settingsData = res.data.data || res.data;
      const obj = {};
      if (Array.isArray(settingsData)) {
        settingsData.forEach(s => obj[s.key] = s.value);
      } else {
        Object.assign(obj, settingsData);
      }
      setSettings(obj);
    }).catch(()=>{});
  }, []);

  const productCategories = categories.filter(c => !c.parent_id);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Alkana Coating" className="h-8 sm:h-10 transition-transform group-hover:scale-105" />
              <span className="font-extrabold text-lg sm:text-xl text-brand-700 group-hover:text-brand-600 transition-colors">
                ALKANA COATING
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-1 items-center">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.url)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {item.url === '/san-pham' ? (
                    // Products with Mega Menu
                    <>
                      <button className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-brand-600 flex items-center gap-2">
                        {item.icon && <span className="text-lg">{item.icon}</span>}
                        {item.name}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {openMenu === item.url && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 top-full mt-2 w-[800px] bg-white rounded-xl shadow-2xl border border-gray-200 p-6"
                          >
                            <div className="grid grid-cols-3 gap-6">
                              {/* Categories Column */}
                              <div className="col-span-2">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Danh mục sản phẩm</h3>
                                <div className="grid grid-cols-2 gap-2">
                                  {productCategories.map((cat) => (
                                    <Link
                                      key={cat.id}
                                      to={`/san-pham/danh-muc/${cat.slug}`}
                                      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                      style={{ borderLeft: `3px solid ${cat.color || '#0066cc'}` }}
                                    >
                                      {cat.icon && (
                                        <span className="text-3xl">{cat.icon}</span>
                                      )}
                                      <div className="flex-1">
                                        <div className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">
                                          {cat.name}
                                        </div>
                                        {cat.products_count > 0 && (
                                          <div className="text-xs text-gray-500">{cat.products_count} sản phẩm</div>
                                        )}
                                      </div>
                                      <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </Link>
                                  ))}
                                  <Link
                                    to="/san-pham"
                                    className="flex items-center gap-2 p-3 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors font-semibold"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Xem tất cả sản phẩm
                                  </Link>
                                </div>
                              </div>

                              {/* Featured Products Column */}
                              <div className="bg-gradient-to-br from-brand-50 to-blue-50 p-4 rounded-lg">
                                <h3 className="text-sm font-bold text-gray-700 mb-3">Sản phẩm nổi bật</h3>
                                <div className="space-y-3">
                                  {featuredProducts.map((product) => (
                                    <Link
                                      key={product.id}
                                      to={`/san-pham/${product.slug}`}
                                      className="block group"
                                    >
                                      <div className="bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        {product.images && product.images.length > 0 && (
                                          <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-20 object-cover rounded mb-2"
                                          />
                                        )}
                                        <h4 className="text-xs font-semibold text-gray-800 group-hover:text-brand-600 line-clamp-2">
                                          {product.name}
                                        </h4>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    // Regular Menu Item
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                          isActive
                            ? 'bg-brand-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-brand-600'
                        }`
                      }
                    >
                      {item.icon && <span className="text-lg">{item.icon}</span>}
                      {item.name}
                    </NavLink>
                  )}
                </div>
              ))}
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

            {/* Contact Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Zalo
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#1877f2] text-white rounded-lg hover:bg-[#0f5ec6] transition-colors text-sm font-medium"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                  <div key={item.id}>
                    {item.url === '/san-pham' ? (
                      <details className="group">
                        <summary className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer font-medium">
                          <span className="flex items-center gap-2">
                            {item.icon && <span className="text-lg">{item.icon}</span>}
                            {item.name}
                          </span>
                          <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-2 pl-6 space-y-1">
                          {productCategories.map((cat) => (
                            <Link
                              key={cat.id}
                              to={`/san-pham/danh-muc/${cat.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm"
                            >
                              {cat.icon && <span>{cat.icon}</span>}
                              <span>{cat.name}</span>
                            </Link>
                          ))}
                          <Link
                            to="/san-pham"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-brand-50 text-brand-700 font-medium text-sm"
                          >
                            Xem tất cả →
                          </Link>
                        </div>
                      </details>
                    ) : (
                      <NavLink
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 p-3 rounded-lg font-medium ${
                            isActive ? 'bg-brand-600 text-white' : 'hover:bg-gray-100'
                          }`
                        }
                      >
                        {item.icon && <span className="text-lg">{item.icon}</span>}
                        {item.name}
                      </NavLink>
                    )}
                  </div>
                ))}
                <div className="pt-4 border-t flex gap-2">
                  <a
                    href="https://zalo.me"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-center font-medium"
                  >
                    Zalo
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-2 bg-[#1877f2] text-white rounded-lg text-center font-medium"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-12 border-t bg-gradient-to-br from-brand-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Alkana Coating" className="h-8" />
              <div className="font-bold text-xl text-brand-700">ALKANA COATING</div>
            </div>
            <p className="text-gray-600 mb-4">
              Giải pháp sơn và chất phủ bề mặt chuyên nghiệp cho công nghiệp.
              Chất lượng cao, bền vững và thân thiện với môi trường.
            </p>
            <div className="flex gap-3">
              <a href="https://zalo.me" target="_blank" rel="noreferrer" className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                Z
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-[#1877f2] text-white rounded-full flex items-center justify-center hover:bg-[#0f5ec6] transition-colors">
                F
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {menuItems.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <Link to={item.url} className="text-gray-600 hover:text-brand-600 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@alkanacoating.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {settings.contact_phone || '(028) 3823 4567'}
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                TP. Hồ Chí Minh, Việt Nam
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Alkana Coating. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
