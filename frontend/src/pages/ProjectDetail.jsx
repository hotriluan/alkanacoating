import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { Badge } from '../components/UI'
import { resolveAssetUrl } from '../utils/media'

export default function ProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [settings, setSettings] = useState({})

  useEffect(() => {
    if (slug) {
      setLoading(true)
      api.get(`/projects/${slug}`)
        .then(response => {
          const data = response.data || {}
          let features = []
          try {
            features = Array.isArray(data.features)
              ? data.features
              : (data.features ? JSON.parse(data.features) : [])
          } catch (_) {
            features = []
          }

          const normalized = {
            ...data,
            features,
            images: Array.isArray(data.images) ? data.images : [],
            testimonials: Array.isArray(data.testimonials) ? data.testimonials : []
          }

          setProject(normalized)
        })
        .catch(error => {
          console.error('Project Detail Error:', error)
          setError('Không tìm thấy dự án')
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

  const gallery = useMemo(() => (project?.images || []).sort((a,b) => (a.sort_order||0) - (b.sort_order||0)), [project])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center text-red-600">{error || 'Không tìm thấy dự án'}</div>
        <div className="text-center mt-4">
          <Link to="/du-an" className="text-brand-600 hover:text-brand-700">
            ← Quay lại danh sách dự án
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-brand-700 to-brand-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-brand-100 mb-6 animate-in slide-in-from-left duration-500">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            {' > '}
            <Link to="/du-an" className="hover:text-white transition-colors">Dự án</Link>
            {' > '}
            <span className="text-white font-medium">{project.title}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Title & Info */}
            <div className="animate-in slide-in-from-left duration-700">
              <div className="flex flex-wrap gap-2 mb-4">
                {project.project_type && (
                  <Badge variant="primary" className="bg-white/20 text-white border-white/30">
                    {project.project_type}
                  </Badge>
                )}
                <Badge 
                  variant={project.progress_percentage === 100 ? "success" : "warning"}
                  className={project.progress_percentage === 100 ? "bg-green-500/20 text-green-100 border-green-400/30" : "bg-amber-500/20 text-amber-100 border-amber-400/30"}
                >
                  {project.progress_percentage === 100 ? 'Hoàn thành' : `Đang thực hiện ${project.progress_percentage}%`}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
              
              <p className="text-xl text-brand-100 mb-6">
                {project.short_description || project.excerpt}
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                {project.client && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-brand-200 text-sm">Chủ đầu tư</div>
                      <div className="font-semibold">{project.client}</div>
                    </div>
                  </div>
                )}
                
                {project.location && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-brand-200 text-sm">Địa điểm</div>
                      <div className="font-semibold">{project.location}</div>
                    </div>
                  </div>
                )}
                
                {(project.start_date || project.end_date) && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-brand-200 text-sm">Thời gian</div>
                      <div className="font-semibold">
                        {project.start_date && new Date(project.start_date).toLocaleDateString('vi-VN')}
                        {project.start_date && project.end_date && ' - '}
                        {project.end_date && new Date(project.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                )}
                
                {project.budget_range && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-brand-200 text-sm">Quy mô</div>
                      <div className="font-semibold">{project.budget_range}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Image */}
            <div className="animate-in slide-in-from-right duration-700">
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                {project.thumbnail ? (
                  <img 
                    src={resolveAssetUrl(project.thumbnail)}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23e0e7ff" width="800" height="600"/%3E%3Ctext fill="%233b82f6" font-family="sans-serif" font-size="64" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E%F0%9F%8F%97%EF%B8%8F%3C/text%3E%3C/svg%3E'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-600 text-8xl">🏗️</span>
                  </div>
                )}
              </div>
              
              {/* View Count */}
              <div className="flex items-center justify-end gap-2 mt-3 text-brand-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{project.view_count || 0} lượt xem</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200 animate-in slide-in-from-bottom duration-500">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Tổng quan', icon: '📋' },
              { id: 'gallery', label: 'Hình ảnh', icon: '🖼️', count: project.images?.length },
              { id: 'features', label: 'Tính năng', icon: '⚡', count: project.features?.length },
              { id: 'testimonials', label: 'Đánh giá', icon: '⭐', count: project.testimonials?.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-brand-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-8">
                {/* Description */}
                {(project.content || project.description) && (
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-brand-800 mb-6 flex items-center gap-3">
                      <span className="text-3xl">📖</span>
                      Chi tiết dự án
                    </h2>
                    <div 
                      className="prose max-w-none text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: project.content || project.description }}
                    />
                  </div>
                )}

                {/* Video */}
                {project.video_url && project.is_video_visible == 1 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-brand-800 mb-6 flex items-center gap-3">
                      <span className="text-3xl">🎥</span>
                      Video giới thiệu
                    </h2>
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                      {(() => {
                        let embedUrl = project.video_url;
                        
                        if (embedUrl.includes('youtube.com/watch?v=')) {
                          embedUrl = embedUrl.replace('watch?v=', 'embed/');
                        } else if (embedUrl.includes('youtu.be/')) {
                          embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
                        } else if (!embedUrl.includes('embed')) {
                          const videoId = embedUrl.split('/').pop().split('?')[0];
                          embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                        
                        return (
                          <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Video giới thiệu dự án"
                          />
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Progress */}
                {project.progress_percentage !== undefined && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-brand-800 mb-4">Tiến độ dự án</h3>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Hoàn thành</span>
                        <span className="font-bold text-brand-600">{project.progress_percentage}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                          style={{ width: `${project.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl p-6 border border-brand-200">
                  <h3 className="font-semibold text-brand-800 mb-2">Quan tâm đến dự án này?</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Liên hệ với chúng tôi để được tư vấn chi tiết về giải pháp tương tự
                  </p>
                  <div className="space-y-2">
                    {settings.contact_phone ? (
                      <a 
                        href={`tel:${settings.contact_phone}`} 
                        className="flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-3 rounded-lg hover:bg-brand-700 transition-all transform hover:scale-105 shadow-md"
                      >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Gọi ngay
                      </a>
                    ) : null}
                    <Link 
                      to="/lien-he"
                      className="flex items-center justify-center gap-2 bg-white text-brand-600 border border-brand-600 px-4 py-3 rounded-lg hover:bg-brand-50 transition-all transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Yêu cầu báo giá
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab with Slider */}
          {activeTab === 'gallery' && (
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              {gallery.length > 0 ? (
                <GallerySlider images={gallery} onOpenLightbox={setLightboxImage} />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🖼️</div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có hình ảnh</h3>
                  <p className="text-slate-500">Hình ảnh dự án sẽ được cập nhật sớm</p>
                </div>
              )}
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="bg-white rounded-xl p-8 shadow-sm">
              {project.features && project.features.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {project.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                        ✓
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có tính năng</h3>
                  <p className="text-slate-500">Thông tin tính năng sẽ được cập nhật sớm</p>
                </div>
              )}
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div>
              {project.testimonials && project.testimonials.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {project.testimonials.map(testimonial => (
                    <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i}
                            className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-slate-600">
                          {testimonial.rating}/5
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-slate-700 mb-4 italic">"{testimonial.testimonial || testimonial.content}"</p>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.client_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-brand-800">{testimonial.client_name}</div>
                          {testimonial.client_position && (
                            <div className="text-sm text-slate-600">{testimonial.client_position}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có đánh giá</h3>
                  <p className="text-slate-500">Đánh giá từ khách hàng sẽ được cập nhật sớm</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-12 animate-in slide-in-from-bottom duration-500 delay-300">
          <Link 
            to="/du-an" 
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách dự án
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-5xl w-full" onClick={(e)=>e.stopPropagation()}>
            <img 
              src={resolveAssetUrl(lightboxImage.image_url)}
              alt={lightboxImage.caption}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            {lightboxImage.caption && (
              <p className="text-white text-center mt-4">{lightboxImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function GallerySlider({ images, onOpenLightbox }) {
  const [index, setIndex] = useState(0)
  const count = images.length
  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count])
  const next = useCallback(() => go(index + 1), [index, go])
  const prev = useCallback(() => go(index - 1), [index, go])

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  return (
    <div className="w-full flex flex-col items-center">
      {/* Main Slide */}
      <div className="relative w-full max-w-2xl aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 mx-auto shadow-lg">
        <img
          key={images[index].id || index}
          src={resolveAssetUrl(images[index].image_url)}
          alt={images[index].caption || `Hình ${index + 1}`}
          className="w-full h-full object-contain cursor-pointer bg-white"
          onClick={() => onOpenLightbox?.(images[index])}
        />

        {/* Arrows */}
        <button
          aria-label="Ảnh trước"
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow-md"
        >
          ‹
        </button>
        <button
          aria-label="Ảnh tiếp theo"
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow-md"
        >
          ›
        </button>

        {/* Counter */}
        <div className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {index + 1}/{count}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {images.map((img, i) => (
          <button
            key={img.id || i}
            onClick={() => setIndex(i)}
            className={`relative w-16 h-10 sm:w-20 sm:h-12 rounded-md overflow-hidden border ${i === index ? 'border-brand-600 ring-2 ring-brand-200' : 'border-slate-200'}`}
            aria-label={`Xem hình ${i+1}`}
            style={{ flex: '0 0 auto' }}
          >
            <img
              src={resolveAssetUrl(img.image_url)}
              alt={img.caption || `Hình ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {i === index && (
              <div className="absolute inset-0 ring-2 ring-brand-500/60 pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}