import { useEffect, useState } from 'react';
import ModernMenu from '../../components/ModernMenu';
import api from '../../services/api';

/**
 * MenuPreview - Lightweight live preview for admin
 * Props:
 * - menuItems?: array (optional) - if not provided, fetch from /menus
 */
export default function MenuPreview({ menuItems: incomingMenuItems }) {
  const [menuItems, setMenuItems] = useState(incomingMenuItems || []);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMenuItems(incomingMenuItems || []);
  }, [incomingMenuItems]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [menusRes, catsRes, productsRes] = await Promise.all([
          incomingMenuItems ? Promise.resolve({ data: incomingMenuItems }) : api.get('/menus'),
          api.get('/categories'),
          api.get('/products/featured'),
        ]);
        if (!incomingMenuItems) setMenuItems(menusRes.data);
        setCategories(catsRes.data.data || catsRes.data || []);
        const products = productsRes.data.data || productsRes.data || [];
        setFeaturedProducts(products.slice(0, 6));
      } catch (e) {
        console.error('Preview fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rootCats = categories.filter((c) => !c.parent_id);

  // Normalize flat list to a tree (children[]) using parent_id
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
      nodes.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
      nodes.forEach(n => n.children && sortRec(n.children));
    };
    sortRec(roots);
    return roots;
  };
  const normalizedMenu = buildTree(menuItems);

  return (
    <div className="border rounded-xl overflow-visible min-h-[200px]">
      {/* Simulated header for preview */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white flex items-center justify-between rounded-t-xl">
        <div className="font-bold">Xem trước menu</div>
        <div className="text-xs opacity-80">Dữ liệu thật từ API</div>
      </div>
      <div className="bg-white p-4 rounded-b-xl relative z-10">
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải dữ liệu…</div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-lg text-brand-700">ALKANA COATING</div>
            <ModernMenu menuItems={normalizedMenu} categories={rootCats} featuredProducts={featuredProducts} />
          </div>
        )}
      </div>
    </div>
  );
}
