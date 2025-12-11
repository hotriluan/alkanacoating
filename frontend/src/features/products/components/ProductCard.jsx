import { Link } from 'react-router-dom';
import { getPrimaryImageUrl } from '../../../utils/imageUtils';
import DOMPurify from 'dompurify';

export default function ProductCard({ product, index, viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <Link
        to={`/san-pham/${product.slug}`}
        className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-100 p-6 flex gap-6 transition-all duration-300 hover:border-brand-300"
        data-aos="fade-up"
        data-aos-delay={index ? Math.min(index * 50, 300) : 0}
      >
        {/* Image */}
        <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
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

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-brand-800 group-hover:text-brand-600 transition-colors line-clamp-2 flex-1">
              {product.name}
            </h3>
            {product.category && (
              <span className="ml-4 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full whitespace-nowrap">
                {product.category.name}
              </span>
            )}
          </div>
          
          <div
            className="text-slate-600 text-sm mb-3 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.excerpt) }}
          />

          <div className="mt-auto flex items-center justify-between">
            <span className="text-brand-600 font-medium group-hover:text-brand-700 transition-colors">
              Xem chi tiết →
            </span>
            {product.view_count > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {product.view_count}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Grid view (default)
  return (
    <Link
      to={`/san-pham/${product.slug}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-100 p-4 flex flex-col transition-all duration-300 hover:-translate-y-1"
      data-aos="fade-up"
      data-aos-delay={index ? Math.min(index * 100, 400) : 0}
    >
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 mb-3 flex items-center justify-center relative">
        {getPrimaryImageUrl(product) ? (
          <img
            src={getPrimaryImageUrl(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <span className="text-brand-600 text-4xl">🎨</span>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded shadow-md">
              ⭐ FEATURED
            </span>
          )}
          {product.is_new && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded shadow-md">
              NEW
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {product.category && (
          <span className="text-xs text-brand-600 font-medium mb-1">
            {product.category.icon && (
              <span 
                className="mr-1"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.category.icon) }}
              ></span>
            )}
            {product.category.name}
          </span>
        )}
        
        <h3 className="text-lg font-semibold text-brand-800 mb-1 group-hover:text-brand-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <div
          className="text-slate-600 text-sm mb-2 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.excerpt) }}
        />
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-brand-600 font-medium group-hover:text-brand-700 transition-colors text-sm">
            Xem chi tiết →
          </span>
          {product.view_count > 0 && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {product.view_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
