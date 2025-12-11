import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(res => {
      const data = res.data.data || res.data;
      setCategories(data);
    });
  }, []);

  const handleCategoryClick = (catId) => {
    const target = `/san-pham?category=${catId}`;
    navigate(target);
  };

  return (
    <section className="py-6 md:py-10">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-800 mb-6 text-center animate-in fade-in duration-700">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
        {categories.map(cat => (
          <button
            type="button"
            onClick={() => handleCategoryClick(cat.id)}
            key={cat.id}
            className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-slate-100 p-4 sm:p-5 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 animate-in fade-in cursor-pointer"
            aria-label={`Danh mục ${cat.name}`}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden relative">
              {/* blurred small thumb as background for blur-up effect */}
              {cat.small_image_url ? (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
                  style={{ backgroundImage: `url(${cat.small_image_url})` }}
                />
              ) : null}

              {cat.image_url || cat.image ? (
                <img
                  src={cat.image_url || `/${cat.image}`}
                  alt={cat.name}
                  className="w-full h-full object-cover relative z-10"
                  loading="lazy"
                  style={{ opacity: 0, transition: 'opacity 500ms ease-out' }}
                  onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
                />
              ) : (
                <svg className="w-10 h-10 text-brand-500 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect width="24" height="24" rx="4" fill="#F3F4F6" />
                  <path d="M7 14l3-3 2 2 4-4 3 3v3H7v-1z" fill="#A78BFA" />
                </svg>
              )}

              {/* product count badge */}
              {cat.products_count > 0 && (
                <div className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                  {cat.products_count}
                </div>
              )}

              {/* subtle hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors duration-200 rounded-lg pointer-events-none" />
            </div>
            <span className="text-sm sm:text-base md:text-base font-semibold text-brand-800 text-center group-hover:text-brand-600 transition-colors">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
