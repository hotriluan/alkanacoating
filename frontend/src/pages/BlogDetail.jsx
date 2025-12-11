import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { Card } from '../components/UI'

export default function BlogDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({})

  useEffect(() => {
    if (slug) {
      setLoading(true)
      api.get(`/posts/${slug}`)
        .then(response => {
          console.log('Post Detail Response:', response.data)
          const postData = response.data.post || response.data
          setPost(postData)
          setRelatedPosts(response.data.related_posts || [])
        })
        .catch(error => {
          console.error('Post Detail Error:', error)
          setError('Không tìm thấy bài viết')
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

  const shareOnFacebook = () => {
    const url = window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')
  }

  const shareOnZalo = () => {
    const url = window.location.href
    window.open(`https://sp.zalo.me/share_inline?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải bài viết...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-slate-600 mb-6">{error || 'Bài viết này không tồn tại hoặc đã bị xóa'}</p>
        </div>
        <div className="text-center mt-4">
          <Link to="/bai-viet" className="text-brand-600 hover:text-brand-700 font-medium">
            ← Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Image with Overlay */}
      {(post.featured_image || post.thumbnail) && (
        <div className="relative h-64 sm:h-80 md:h-[60vh] mb-8 overflow-hidden">
          <img 
            src={post.featured_image_url || post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display='none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="max-w-4xl mx-auto">
              {post.category && (
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                  style={{
                    backgroundColor: post.category.color,
                    color: 'white'
                  }}
                >
                  {post.category.icon} {post.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}
                </span>
                {post.reading_time > 0 && (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.reading_time} phút đọc
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {post.view_count || 0} lượt xem
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-600 mb-8">
          <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
          {' > '}
          <Link to="/bai-viet" className="hover:text-brand-600">Bài viết</Link>
          {' > '}
          <span className="text-slate-800">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1 max-w-4xl">
            {/* Header (only if no hero image) */}
            {!post.featured_image && !post.thumbnail && (
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-brand-800 mb-4">{post.title}</h1>
                
                <div className="flex items-center gap-6 text-sm text-slate-600 mb-6">
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  {post.author && (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {post.author.name}
                    </span>
                  )}
                  {post.reading_time > 0 && (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {post.reading_time} phút đọc
                    </span>
                  )}
                </div>
              </header>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div className="text-lg text-slate-700 leading-relaxed mb-8 p-6 bg-slate-50 rounded-lg border-l-4 border-brand-500">
                {post.excerpt}
              </div>
            )}

            {/* Tags */}
            {post.post_tags && post.post_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.post_tags.map(tag => (
                  <span 
                    key={tag.id} 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            {post.content && (
              <div className="prose max-w-none mb-12">
                <div 
                  className="text-slate-700 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                />
              </div>
            )}

            {/* Share Buttons */}
            <div className="border-t border-b border-slate-200 py-6 mb-12">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Chia sẻ bài viết</h3>
              <div className="flex gap-3">
                <button
                  onClick={shareOnFacebook}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                
                <button
                  onClick={shareOnZalo}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.5c-.405.488-1.788 1.66-2.982 2.294-.219.116-.458.175-.697.175-.656 0-1.283-.406-1.533-1.05l-.844-2.175h-3.675c-.656 0-1.219-.562-1.219-1.218V8.062c0-.656.563-1.218 1.219-1.218h8.25c.656 0 1.218.562 1.218 1.218v4.463c0 .713-.25 1.4-.737 1.975z"/>
                  </svg>
                  Zalo
                </button>
                
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? 'Đã copy!' : 'Copy link'}
                </button>
              </div>
            </div>

            {/* Author Card */}
            {post.author && (
              <Card className="p-6 mb-12 bg-gradient-to-r from-brand-50 to-blue-50">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 text-2xl font-bold">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-800 text-lg">Tác giả: {post.author.name}</h3>
                    <p className="text-slate-600 text-sm">Chuyên gia tư vấn kỹ thuật sơn phủ công nghiệp</p>
                  </div>
                </div>
              </Card>
            )}

            {/* CTA */}
            <Card className="p-6 bg-gradient-to-r from-brand-500 to-brand-600 text-white mb-12">
              <h3 className="text-xl font-semibold mb-3">
                Cần tư vấn kỹ thuật?
              </h3>
              <p className="mb-4 opacity-90">
                Đội ngũ chuyên gia của Alkana Coating sẵn sàng hỗ trợ bạn với mọi thắc mắc về công nghệ sơn phủ
              </p>
              <div className="flex gap-3">
                {settings.contact_phone && (
                  <a 
                    href={`tel:${settings.contact_phone}`} 
                    className="bg-white text-brand-600 px-6 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                  >
                    📞 Hotline tư vấn
                  </a>
                )}
                <Link 
                  to="/lien-he" 
                  className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-lg hover:bg-white hover:text-brand-600 transition-colors font-medium"
                >
                  ✉️ Liên hệ
                </Link>
              </div>
            </Card>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-brand-800 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Bài viết liên quan
                </h3>
                <div className="space-y-4">
                  {relatedPosts.slice(0, 3).map(relatedPost => (
                    <Link 
                      key={relatedPost.id}
                      to={`/bai-viet/${relatedPost.slug}`}
                      className="group block"
                    >
                      <div className="flex gap-3">
                        {relatedPost.thumbnail && (
                          <img 
                            src={relatedPost.thumbnail_url}
                            alt={relatedPost.title}
                            className="w-20 h-20 object-cover rounded flex-shrink-0 group-hover:opacity-75 transition-opacity"
                            onError={(e) => { e.currentTarget.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📝%3C/text%3E%3C/svg%3E' }}
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 text-sm group-hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                            {relatedPost.title}
                          </h4>
                          <div className="flex items-center text-xs text-slate-500 gap-2">
                            <span>{new Date(relatedPost.published_at || relatedPost.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                            {relatedPost.reading_time > 0 && (
                              <>
                                <span>•</span>
                                <span>{relatedPost.reading_time} phút</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Latest Posts */}
            <Card className="p-6 bg-slate-50">
              <h3 className="font-bold text-brand-800 mb-4 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bài viết mới nhất
              </h3>
              <Link 
                to="/bai-viet" 
                className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1"
              >
                Xem tất cả
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Card>
          </aside>
        </div>

        {/* Back button */}
        <div className="mt-12">
          <Link 
            to="/bai-viet" 
            className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium"
          >
            ← Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    </div>
  )
}
