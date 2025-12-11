import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../features/products/components/ProductCard';
import useSettingsStore from '../stores/settingsStore';
import PageSkeleton from '../components/PageSkeleton';
import Breadcrumb from '../components/Breadcrumb';
import DOMPurify from 'dompurify';
import Pagination from '../components/Pagination';

export default function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12); // Hoặc số sản phẩm mặc định mỗi trang
  const [totalProducts, setTotalProducts] = useState(0);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      // Get category info first
      api.get(`/categories/${slug}`)
        .then((categoryRes) => {
          console.log('Category Response:', categoryRes.data);
          
          const categoryData = categoryRes.data.data || categoryRes.data;
          setCategory(categoryData);
          
          // Get subcategories if this category has children
          if (categoryData.children && categoryData.children.length > 0) {
            setSubcategories(categoryData.children);
          }
          
          // Get products by category slug with pagination
          return api.get(`/products`, {
            params: {
              category: slug,
              page: currentPage,
              limit: productsPerPage,
            },
          });
        })
        .then((productsRes) => {
          console.log('Products Response:', productsRes.data);
          setProducts(productsRes.data.data || productsRes.data);
          // Assuming API returns total products in 'meta.total' or directly in 'total'
          setTotalProducts(productsRes.data.meta?.total || productsRes.data.total || 0);
        })
        .catch(error => {
          console.error('Category Detail Error:', error);
          if (error.response && error.response.status === 404) {
            setError('Danh mục không tồn tại hoặc đã bị xóa.');
          } else {
            setError('Đã xảy ra lỗi khi tải danh mục. Vui lòng thử lại sau.');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug, currentPage, productsPerPage]);

  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings('contact');
  }, [fetchSettings]);


  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-red-600">{error || 'Không tìm thấy danh mục'}</div>
        <div className="text-center mt-4">
          <Link to="/san-pham" className="text-brand-600 hover:text-brand-700">
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Trang chủ', link: '/' },
    { label: 'Sản phẩm', link: '/san-pham' },
  ];

  if (category.parent) {
    breadcrumbItems.push({ label: category.parent.name, link: `/san-pham/danh-muc/${category.parent.slug}` });
  }
  breadcrumbItems.push({ label: category.name });

  const categoryColor = category.color || '#0066cc';

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="relative py-20 px-4"
        style={{
          background: `linear-gradient(135deg, ${categoryColor}15 0%, ${categoryColor}05 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Category Info */}
          <div className="flex items-center gap-6" data-aos="fade-up">
            {category.icon && (
              <div 
                className="text-6xl w-24 h-24 flex items-center justify-center rounded-full shadow-lg"
                style={{ backgroundColor: `${categoryColor}20` }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(category.icon) }}
              ></div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">{category.name}</h1>
              {category.description && (
                <div 
                  className="text-lg text-gray-600 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(category.description) }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-12" data-aos="fade-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh mục con</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/san-pham/danh-muc/${sub.slug}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl p-4 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-center"
                  style={{ borderTop: `3px solid ${sub.color || categoryColor}` }}
                >
                  {sub.icon && (
                    <div 
                      className="text-4xl mb-2"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sub.icon) }}
                    ></div>
                  )}
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">
                    {sub.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div data-aos="fade-up" data-aos-delay="200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Sản phẩm {category.name}
              <span className="ml-3 text-sm font-normal text-gray-500">
                ({products.length} sản phẩm)
              </span>
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 text-lg">Chưa có sản phẩm nào trong danh mục này</p>
              <Link 
                to="/san-pham" 
                className="inline-block mt-4 text-brand-600 hover:text-brand-700"
              >
                Xem tất cả sản phẩm →
              </Link>
            </div>
          )}
          {totalProducts > productsPerPage && (
            <Pagination
              currentPage={currentPage}
              productsPerPage={productsPerPage}
              totalProducts={totalProducts}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl p-8" data-aos="zoom-in">
          <h2 className="text-2xl font-bold text-brand-800 mb-4">
            Cần tư vấn về {category.name}?
          </h2>
          <p className="text-gray-600 mb-6">
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
    </div>
  );
}
