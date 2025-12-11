import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getPrimaryImageUrl } from '../../utils/imageUtils';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products/featured').then(res => {
      setProducts(res.data || []);
    }).catch(err => {
      console.error('Error fetching featured products:', err);
      // Fallback to regular products if featured endpoint fails
      api.get('/products?limit=6').then(res => {
        setProducts(res.data.data || res.data);
      });
    });
  }, []);

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-brand-50 to-white">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-800 mb-6 text-center animate-in fade-in duration-700">Sản phẩm nổi bật</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
        {products.map(product => (
          <Link
            to={`/san-pham/${product.slug}`}
            key={product.id}
            className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-100 p-3 sm:p-4 flex flex-col transition-all duration-300 hover:-translate-y-1 animate-in fade-in duration-700"
          >
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 mb-3 flex items-center justify-center">
              {getPrimaryImageUrl(product) ? (
                <img
                  src={getPrimaryImageUrl(product)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <span className="text-brand-600 text-4xl">🎨</span>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-base sm:text-lg font-semibold text-brand-800 mb-1 group-hover:text-brand-600 transition-colors line-clamp-2">{product.name}</h3>
              <div
                className="text-slate-600 text-xs sm:text-sm mb-2 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: product.excerpt }}
              />
              <span className="mt-auto text-brand-600 font-medium hover:text-brand-700 transition-colors text-xs sm:text-sm">Xem chi tiết →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
