import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import ModernMenu from './ModernMenu';
import { useMemo } from 'react';

export default function Layout({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, categoriesRes, productsRes, settingsRes] = await Promise.all([
          api.get('/menus'),
          api.get('/categories'),
          api.get('/products/featured'),
          api.get('/settings/public'),
        ]);
        setMenuItems(menusRes.data);
        setCategories(categoriesRes.data.data || categoriesRes.data);
        setFeaturedProducts((productsRes.data.data || productsRes.data).slice(0, 6));
        setSettings(settingsRes.data || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const productCategories = categories.filter(c => !c.parent_id);

  // Parse footer columns from settings
  const footerColumns = useMemo(() => {
    try {
      if (settings.footer_columns) {
        return typeof settings.footer_columns === 'string'
          ? JSON.parse(settings.footer_columns)
          : settings.footer_columns;
      }
      return [];
    } catch {
      return [];
    }
  }, [settings.footer_columns]);

  // Normalize menus to a hierarchical tree for ModernMenu
  const buildTree = (items) => {
    if (!Array.isArray(items)) return [];
    const byId = new Map(items.map(i => [i.id, { ...i, children: Array.isArray(i.children) ? i.children : [] }]));
    const roots = [];
    for (const item of byId.values()) {
      const pid = item.parent_id ?? null;
      if (pid && byId.has(pid)) {
        byId.get(pid).children.push(item);
      } else {
        roots.push(item);
      }
    }
    const sortRec = (nodes) => {
      nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      nodes.forEach(n => n.children && sortRec(n.children));
    };
    sortRec(roots);
    return roots;
  };
  const normalizedMenus = buildTree(menuItems);

  // JSON-LD for Site Navigation
  const navJsonLd = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const items = menuItems.map((m, idx) => ({
      '@type': 'SiteNavigationElement',
      position: idx + 1,
      name: m.name,
      url: (m.url?.startsWith('http') ? m.url : `${origin}${m.url || '/'}`)
    }));
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items
    };
  }, [menuItems]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-md z-[90] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Alkana Coating" className="h-10 transition-transform group-hover:scale-105" />
              <span className="font-extrabold text-xl text-brand-700 group-hover:text-brand-600 transition-colors">
                ALKANA COATING
              </span>
            </Link>
            <ModernMenu
              menuItems={normalizedMenus}
              categories={productCategories}
              featuredProducts={featuredProducts}
            />
          </div>
        </div>
      </header>
      {navJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(navJsonLd) }} />
      )}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-brand-900 via-brand-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Company Info - Takes 5 columns */}
            <div className="md:col-span-5">
              <Link to="/" className="inline-block mb-4">
                <h3 className="text-xl font-bold text-white">ALKANA COATING</h3>
              </Link>
              <p className="text-brand-100 mb-4 text-sm leading-relaxed">
                {settings.footer_about || 'Giải pháp sơn chuyên nghiệp'}
              </p>
              <div className="space-y-2 text-sm text-brand-100">
                {settings.contact_address && (
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{settings.contact_address}</span>
                  </div>
                )}
                {settings.contact_phone && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${settings.contact_phone}`} className="hover:text-brand-200 transition-colors">
                      {settings.contact_phone}
                    </a>
                  </div>
                )}
                {settings.contact_email && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-200 transition-colors">
                      {settings.contact_email}
                    </a>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-sm text-brand-200">Kết nối với chúng tôi</h4>
                <div className="flex gap-3">
                  {settings.social_facebook && (
                    <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 border border-white/20">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {settings.social_youtube && (
                    <a href={settings.social_youtube} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 border border-white/20">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  )}
                  {settings.social_zalo && (
                    <a href={settings.social_zalo} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 border border-white/20">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.35-3.83-.96l-.27-.16-2.83.48.48-2.83-.16-.27C4.35 14.68 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                    </a>
                  )}
                  {settings.social_linkedin && (
                    <a href={settings.social_linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 border border-white/20">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Footer Columns from Admin Settings - Takes 7 columns */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {footerColumns.map((column, index) => (
                <div key={index}>
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-brand-200">{column.title}</h4>
                  <ul className="space-y-2">
                    {column.links && column.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        {link.url.startsWith('http') ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-brand-100 hover:text-white transition-colors flex items-center gap-1"
                          >
                            {link.label}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <Link
                            to={link.url}
                            className="text-sm text-brand-100 hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-brand-200">
            <p>
              {settings.footer_copyright || `© ${new Date().getFullYear()} ALKANA COATING. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>

      <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-40">
        {settings.social_zalo && (
          <a href={settings.social_zalo} target="_blank" rel="noreferrer" className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg hover:scale-110" title="Chat Zalo">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.35-3.83-.96l-.27-.16-2.83.48.48-2.83-.16-.27C4.35 14.68 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" /></svg>
          </a>
        )}
        {settings.social_facebook && (
          <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="w-14 h-14 bg-[#1877f2] text-white rounded-full flex items-center justify-center hover:bg-[#0f5ec6] transition-all shadow-lg hover:scale-110" title="Facebook">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
        )}
      </div>
    </div>
  );
}
