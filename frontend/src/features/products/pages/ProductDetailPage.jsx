import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../../services/api'

import ProductGallery from '../components/ProductGallery';

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('content')
  const [settings, setSettings] = useState({})

  useEffect(() => {
    if (slug) {
      setLoading(true)
      api.get(`/products/${slug}`)
        .then(response => {
          console.log('Product Detail Response:', response.data)
          setProduct(response.data)
        })
        .catch(error => {
          console.error('Product Detail Error:', error)
          setError('Không tìm thấy sản phẩm')
        })
        .finally(() => setLoading(false))
    }
  }, [slug])

  useEffect(() => {
    api.get('/settings/group/contact').then(res => {
      const settingsData = res.data.data || res.data;
      const settingsObj = {};
      if (Array.isArray(settingsData)) {
        settingsData.forEach(setting => { settingsObj[setting.key] = setting.value; });
      } else {
        Object.assign(settingsObj, settingsData);
      }
      setSettings(settingsObj);
    }).catch(()=>{});
  }, []);

  // Build tabs from available sections
  const tabs = useMemo(() => {
    if (!product) return []
    const items = []
    if (product.content) items.push({ key: 'content', label: 'Mô tả chi tiết', icon: '📝' })
    if (product.features) items.push({ key: 'features', label: 'Tính năng nổi bật', icon: '✨' })
    if (product.applications) items.push({ key: 'applications', label: 'Ứng dụng', icon: '🏷️' })
    if (product.technical_specs) items.push({ key: 'technical_specs', label: 'Thông số kỹ thuật', icon: '📊' })
    return items
  }, [product])

  useEffect(() => {
    if (tabs.length && !tabs.find(t => t.key === activeTab)) {
      setActiveTab(tabs[0].key)
    }
  }, [tabs, activeTab])

  // Early returns must come AFTER all hooks to keep hook order stable
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center text-red-600">{error || 'Không tìm thấy sản phẩm'}</div>
        <div className="text-center mt-4">
          <Link to="/san-pham" className="text-brand-600 hover:text-brand-700">
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}

      <nav className="text-sm text-slate-600 mb-6" data-aos="fade-down">
        <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
        {' > '}
        <Link to="/san-pham" className="hover:text-brand-600">Sản phẩm</Link>
        {' > '}
        <span className="text-slate-800">{product.name}</span>
      </nav>

  <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery Slider */}
        <div data-aos="fade-right">
          <ProductGallery product={product} />
        </div>

        {/* Content */}
        <div data-aos="fade-left" data-aos-delay="200">
          <h1 className="text-4xl font-extrabold text-brand-800 mb-3 leading-tight">{product.name}</h1>
          {product.category && (
            <div className="inline-block bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm mb-4">
              {product.category.name}
            </div>
          )}
          {product.excerpt && (
            <div
              className="text-slate-700 text-lg leading-relaxed mb-6"
              dangerouslySetInnerHTML={{ __html: product.excerpt }}
            />
          )}
          {/* Info cards (remove status, keep SKU/slug) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-white rounded-lg">
              <div className="text-slate-500 text-sm">Mã sản phẩm</div>
              <div className="font-semibold text-slate-800">{product.slug}</div>
            </div>
          </div>

          {/* Tabs for detailed sections */}
          {tabs.length > 0 && (
            <div className="mb-10">
              <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${activeTab === t.key ? 'bg-white text-brand-700 border-b-2 border-brand-600 -mb-px' : 'bg-transparent text-slate-700 hover:bg-slate-100'}`}
                    type="button"
                  >
                    <span className="mr-1">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5 bg-white rounded-lg prose max-w-none text-slate-800">
                {activeTab === 'content' && product.content && (
                  <div className="rich-content" dangerouslySetInnerHTML={{ __html: product.content }} />
                )}
                {activeTab === 'features' && product.features && (
                  <div className="rich-content" dangerouslySetInnerHTML={{ __html: product.features }} />
                )}
                {activeTab === 'applications' && product.applications && (
                  <div className="rich-content" dangerouslySetInnerHTML={{ __html: product.applications }} />
                )}
                {activeTab === 'technical_specs' && product.technical_specs && (
                  <div className="rich-content" dangerouslySetInnerHTML={{ __html: product.technical_specs }} />
                )}
              </div>
            </div>
          )}
          {/* Contact CTA */}
          <div className="mt-10 p-6 bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-100 rounded-xl" data-aos="zoom-in" data-aos-delay="400">
            <h4 className="font-semibold text-brand-800 mb-2">Liên hệ tư vấn</h4>
            <p className="text-sm text-slate-600 mb-3">
              Để biết thêm thông tin chi tiết về sản phẩm và nhận báo giá tốt nhất
            </p>
            <div className="flex gap-3">
              {settings.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="bg-brand-600 text-white px-5 py-2 rounded-lg hover:bg-brand-700 transition-colors text-sm shadow-sm"
                >
                  📞 Gọi ngay
                </a>
              )}
              <a
                href="https://zalo.me/alkanacoating"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
              >
                💬 Chat Zalo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="mt-10">
        <Link
          to="/san-pham"
          className="inline-flex items-center text-brand-600 hover:text-brand-700"
        >
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    </div>
  )
}