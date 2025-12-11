import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { resolveAssetUrl } from '../utils/media'
import { LoadingCard, Card, Badge } from '../components/UI'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadPosts()
    loadFeaturedPosts()
    loadCategories()
    loadTags()
  }, [])

  useEffect(() => {
    loadPosts()
  }, [selectedCategory, selectedTag, searchTerm, currentPage])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedTag) params.append('tag', selectedTag)
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', currentPage)
      
      const response = await api.get(`/posts?${params.toString()}`)
      const data = response.data.data || response.data
      setPosts(Array.isArray(data) ? data : (data.data || []))
      setTotalPages(data.last_page || 1)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFeaturedPosts = async () => {
    try {
      const response = await api.get('/posts/featured')
      setFeaturedPosts(response.data || [])
    } catch (error) {
      console.error('Error loading featured posts:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.get('/post-categories')
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadTags = async () => {
    try {
      const response = await api.get('/post-tags')
      setTags(response.data || [])
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedTag('')
    setCurrentPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-brand-800 mb-4 animate-in slide-in-from-top duration-700">
          Blog & Tin tức
        </h1>
        <p className="text-lg text-slate-600 animate-in slide-in-from-top duration-700 delay-200">
          Cập nhật tin tức ngành sơn, kỹ thuật thi công và xu hướng mới
        </p>
      </div>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <div className="mb-12 animate-in slide-in-from-top duration-700 delay-300">
          <h2 className="text-2xl font-bold text-brand-800 mb-6 flex items-center">
            <span className="text-yellow-500 mr-2">⭐</span>
            Bài viết nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.slice(0, 4).map((post) => {
              const imageUrl = resolveAssetUrl(post.thumbnail || post.featured_image || post.image);
              return (
                <Link 
                  key={post.id} 
                  to={`/bai-viet/${post.slug}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <div className="w-full h-48 md:h-56 overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
                      {imageUrl ? (
                        <img 
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { 
                            e.currentTarget.onerror = null;
                            e.currentTarget.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"800\" height=\"450\"%3E%3Crect fill=\"%23f3f4f6\" width=\"800\" height=\"450\"/%3E%3Ctext fill=\"%239ca3af\" font-family=\"sans-serif\" font-size=\"48\" x=\"50%25\" y=\"50%25\" text-anchor=\"middle\" dominant-baseline=\"middle\"%3E⭐%3C/text%3E%3C/svg%3E' 
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                          <span className="text-yellow-600 text-6xl">⭐</span>
                        </div>
                      )}
                    </div>
                  
                    <div className="p-4 flex-1 flex flex-col">
                      {post.category && (
                        <span 
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                          style={{
                            backgroundColor: post.category.color + '20',
                            color: post.category.color
                          }}
                        >
                          {post.category.icon} {post.category.name}
                        </span>
                      )}
                      
                      <h3 className="text-base md:text-lg font-semibold text-brand-800 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 mb-3 text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                        <span>{new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}</span>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.view_count || 0}</span>
                          </span>
                          {post.reading_time > 0 && (
                            <span className="flex items-center space-x-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{post.reading_time} phút</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-80 space-y-6 animate-in slide-in-from-left duration-700 delay-400">
          {/* Search */}
          <Card className="p-6">
            <h3 className="font-bold text-brand-800 mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm kiếm
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập từ khóa..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Categories */}
          <Card className="p-6">
            <h3 className="font-bold text-brand-800 mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Danh mục
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory('')
                  setCurrentPage(1)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedCategory 
                    ? 'bg-brand-500 text-white font-medium' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                📚 Tất cả danh mục
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.slug)
                    setCurrentPage(1)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    selectedCategory === category.slug
                      ? 'text-white font-medium'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  style={selectedCategory === category.slug ? {
                    backgroundColor: category.color
                  } : {}}
                >
                  <span>
                    {category.icon} {category.name}
                  </span>
                  {category.posts_count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category.slug
                        ? 'bg-white bg-opacity-20'
                        : 'bg-slate-200'
                    }`}>
                      {category.posts_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Tags Cloud */}
          <Card className="p-6">
            <h3 className="font-bold text-brand-800 mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tags phổ biến
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 12).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTag(tag.slug)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTag === tag.slug
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  style={selectedTag === tag.slug ? {} : {
                    color: tag.color
                  }}
                >
                  #{tag.name}
                  {tag.usage_count > 0 && (
                    <span className="ml-1 opacity-75">({tag.usage_count})</span>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Active Filters */}
          {(selectedCategory || selectedTag || searchTerm) && (
            <Card className="p-6 bg-brand-50 border-brand-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-brand-800 text-sm">Bộ lọc đang áp dụng</h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="space-y-2">
                {searchTerm && (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded text-sm">
                    <span className="text-slate-700">🔍 "{searchTerm}"</span>
                    <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">×</button>
                  </div>
                )}
                {selectedCategory && (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded text-sm">
                    <span className="text-slate-700">
                      {categories.find(c => c.slug === selectedCategory)?.icon} {categories.find(c => c.slug === selectedCategory)?.name}
                    </span>
                    <button onClick={() => setSelectedCategory('')} className="text-slate-400 hover:text-slate-600">×</button>
                  </div>
                )}
                {selectedTag && (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded text-sm">
                    <span className="text-slate-700">
                      #{tags.find(t => t.slug === selectedTag)?.name}
                    </span>
                    <button onClick={() => setSelectedTag('')} className="text-slate-400 hover:text-slate-600">×</button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Results Header */}
          <div className="mb-6 animate-in slide-in-from-right duration-700 delay-400">
            <h2 className="text-xl font-bold text-brand-800 mb-2">
              Tất cả bài viết
            </h2>
            <p className="text-sm text-slate-600">
              Hiển thị {posts.length} bài viết
              {(selectedCategory || selectedTag || searchTerm) && ' (đã lọc)'}
            </p>
          </div>

      {/* Loading State */}
      {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      )}

      {/* Posts Grid */}
          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right duration-700 delay-500">
              {posts.map((post, index) => (
                <Link 
                  key={post.id} 
                  to={`/bai-viet/${post.slug}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                    {post.thumbnail || post.featured_image || post.image ? (
                      <div className="aspect-video overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
                        <img 
                          src={resolveAssetUrl(post.thumbnail || post.featured_image || post.image)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.currentTarget.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23f3f4f6" width="800" height="450"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="48" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📝%3C/text%3E%3C/svg%3E' }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <span className="text-green-600 text-6xl">📝</span>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        {post.category ? (
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: post.category.color + '20',
                              color: post.category.color
                            }}
                          >
                            {post.category.icon} {post.category.name}
                          </span>
                        ) : (
                          <Badge variant="success" className="text-xs">Mới</Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-brand-800 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt || post.content?.substring(0, 150) + '...'}
                      </p>

                      {post.post_tags && post.post_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.post_tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag.id} 
                              className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                            >
                              #{tag.name}
                            </span>
                          ))}
                          {post.post_tags.length > 3 && (
                            <span className="text-xs text-slate-400">+{post.post_tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-brand-600 font-medium hover:text-brand-700 transition-colors text-sm">
                          Đọc thêm →
                        </span>
                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.view_count || 0}</span>
                          </div>
                          {post.reading_time > 0 && (
                            <div className="flex items-center space-x-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{post.reading_time} phút</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                ← Trước
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-brand-500 text-white'
                            : 'border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2 text-slate-400">...</span>
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Sau →
              </button>
            </div>
          )}

      {/* No Results */}
          {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy bài viết</h3>
          <p className="text-slate-500 mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
          </p>
          <button
                onClick={resetFilters}
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
        </main>
      </div>


      {/* Newsletter Section */}
      <div className="mt-16 bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl p-8 text-center animate-in slide-in-from-bottom duration-700 delay-600">
        <h2 className="text-2xl font-bold text-brand-800 mb-4">
          Đăng ký nhận tin tức mới nhất
        </h2>
        <p className="text-slate-600 mb-6">
          Cập nhật thông tin kỹ thuật, sản phẩm mới và khuyến mãi đặc biệt
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <button className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-all duration-200 transform hover:scale-105">
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  )
}
