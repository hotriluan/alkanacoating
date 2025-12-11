import { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import api from '../../../services/api';
import ProductCardSkeleton from '../../../components/skeletons/ProductCardSkeleton';

export default function ProductGrid({ categoryId, searchTerm, sortBy = 'newest', viewMode = 'grid' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastUrlRef = useRef(null);
  const debounceTimer = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    let url = '/products';
    const params = [];
    if (categoryId) params.push(`category=${categoryId}`);
    if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
    if (sortBy) params.push(`sort=${sortBy}`);
    if (params.length) url += '?' + params.join('&');

    if (lastUrlRef.current === url) {
      console.debug('ProductGrid: URL unchanged, skipping fetch', url);
      setLoading(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch (e) { }
      }
      abortControllerRef.current = new AbortController();

      console.debug('ProductGrid: fetching products from', url, 'categoryId=', categoryId, 'searchTerm=', searchTerm, 'sortBy=', sortBy);

      api.get(url, { signal: abortControllerRef.current.signal })
        .then(res => {
          console.debug('ProductGrid: response', res.status, res.data && (res.data.data || res.data).length);
          let productsData = res.data.data || res.data;
          
          // Client-side sorting if backend doesn't handle it
          if (sortBy === 'name-asc') {
            productsData = [...productsData].sort((a, b) => a.name.localeCompare(b.name));
          } else if (sortBy === 'name-desc') {
            productsData = [...productsData].sort((a, b) => b.name.localeCompare(a.name));
          } else if (sortBy === 'newest') {
            productsData = [...productsData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
          
          setProducts(productsData);
          lastUrlRef.current = url;
        })
        .catch(err => {
          if (err && err.response && err.response.status === 429) {
            console.warn('ProductGrid: server rate-limited (429). Throttling client requests.');
          } else if (err && (err.name === 'CanceledError' || err.name === 'AbortError')) {
            console.debug('ProductGrid: request cancelled');
            return;
          } else {
            console.error('ProductGrid: fetch error', err && err.toString());
          }
          setProducts([]);
        })
        .finally(() => setLoading(false));
    }, 200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch (e) { }
        abortControllerRef.current = null;
      }
    };
  }, [categoryId, searchTerm, sortBy]);

  if (loading) {
    const skeletonCount = 8;
    return (
        <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'space-y-4'
        }>
            {Array.from({ length: skeletonCount }, (_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp.</p>
        <p className="text-gray-400 text-sm mt-2">Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
        : 'space-y-4'
    }>
      {products.map((product, idx) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          index={idx}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
