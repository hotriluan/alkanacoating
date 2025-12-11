import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({})
  const [recentProducts, setRecentProducts] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [recentContacts, setRecentContacts] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [contentStatus, setContentStatus] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    
    if (!token) {
      navigate('/admin/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Set auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Load dashboard data
    loadDashboardData()
  }, [navigate])

  // Debug: log when stats change
  useEffect(() => {
    console.log('Stats updated:', stats)
  }, [stats])

  const loadDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...')
      const response = await api.get('/admin/dashboard')
      console.log('Dashboard response:', response.data)
      const data = response.data
      setStats(data.stats || {})
      setRecentProducts(data.recentProducts || [])
      setRecentProjects(data.recentProjects || [])
      setRecentPosts(data.recentPosts || [])
      setRecentContacts(data.recentContacts || [])
      setMonthlyData(data.monthlyData || [])
      setContentStatus(data.contentStatus || {})
      console.log('Stats set:', data.stats)
    } catch (error) {
      console.error('Dashboard error:', error)
      console.error('Error response:', error.response?.data)
      if (error.response?.status === 401) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      delete api.defaults.headers.common['Authorization']
      navigate('/admin/login')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                👋 Xin chào, {user?.name || 'Admin'}!
              </h1>
              <p className="text-brand-100">
                Chào mừng bạn quay lại hệ thống quản trị Alkana Coating
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm text-brand-100">Hôm nay</div>
              <div className="text-lg font-semibold">
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon="🎨"
            title="Sản phẩm"
            value={stats.products || 0}
            color="from-blue-500 to-blue-600"
            link="/admin/products"
            subtitle={`${contentStatus.published_products || 0} đã xuất bản`}
          />
          
          <StatCard
            icon="🏗️"
            title="Dự án"
            value={stats.projects || 0}
            color="from-green-500 to-green-600"
            link="/admin/projects"
            subtitle="Portfolio hoàn thành"
          />
          
          <StatCard
            icon="📝"
            title="Bài viết"
            value={stats.posts || 0}
            color="from-purple-500 to-purple-600"
            link="/admin/posts"
            subtitle={`${contentStatus.published_posts || 0} đã xuất bản`}
          />
          
          <StatCard
            icon="💼"
            title="Tuyển dụng"
            value={stats.jobs || 0}
            color="from-orange-500 to-orange-600"
            link="/admin/recruitments"
            subtitle="Vị trí đang tuyển"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Danh mục</p>
                <p className="text-2xl font-bold text-gray-800">{stats.categories || 0}</p>
              </div>
              <div className="text-2xl">📁</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Slider</p>
                <p className="text-2xl font-bold text-gray-800">{stats.sliders || 0}</p>
              </div>
              <div className="text-2xl">🖼️</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menu</p>
                <p className="text-2xl font-bold text-gray-800">{stats.menus || 0}</p>
              </div>
              <div className="text-2xl">🔗</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Liên hệ</p>
                <p className="text-2xl font-bold text-gray-800">{stats.contacts || 0}</p>
              </div>
              <div className="text-2xl">📬</div>
            </div>
          </div>
        </div>

        {/* Charts and Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              Thống kê 6 tháng gần đây
            </h3>
            <div className="space-y-3">
              {monthlyData.map((month, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-gray-600">{month.month}</div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">SP</span>
                        <span className="font-medium">{month.products}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${Math.min((month.products / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">DA</span>
                        <span className="font-medium">{month.projects}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${Math.min((month.projects / 5) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">BV</span>
                        <span className="font-medium">{month.posts}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${Math.min((month.posts / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-around text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Sản phẩm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Dự án</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-600">Bài viết</span>
              </div>
            </div>
          </div>

          {/* Content Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📈</span>
              Trạng thái nội dung
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Sản phẩm</span>
                  <span className="text-sm text-gray-600">
                    {contentStatus.published_products || 0} / {(contentStatus.published_products || 0) + (contentStatus.draft_products || 0)}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ 
                      width: `${((contentStatus.published_products || 0) / Math.max((contentStatus.published_products || 0) + (contentStatus.draft_products || 0), 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>✅ {contentStatus.published_products || 0} đã xuất bản</span>
                  <span>📝 {contentStatus.draft_products || 0} nháp</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Bài viết</span>
                  <span className="text-sm text-gray-600">
                    {contentStatus.published_posts || 0} / {(contentStatus.published_posts || 0) + (contentStatus.draft_posts || 0)}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                    style={{ 
                      width: `${((contentStatus.published_posts || 0) / Math.max((contentStatus.published_posts || 0) + (contentStatus.draft_posts || 0), 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>✅ {contentStatus.published_posts || 0} đã xuất bản</span>
                  <span>📝 {contentStatus.draft_posts || 0} nháp</span>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-6 p-4 bg-gradient-to-br from-brand-50 to-purple-50 rounded-lg border border-brand-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Mẹo hữu ích</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Thường xuyên cập nhật nội dung để website luôn mới mẻ. 
                      Xuất bản bài viết nháp để tăng tương tác với khách hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Products */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>🎨</span>
                Sản phẩm mới
              </h3>
              <Link to="/admin/products" className="text-sm text-brand-600 hover:text-brand-700">
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-3">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(product.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có sản phẩm nào</p>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>🏗️</span>
                Dự án mới
              </h3>
              <Link to="/admin/projects" className="text-sm text-brand-600 hover:text-brand-700">
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{project.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(project.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có dự án nào</p>
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>📝</span>
                Bài viết mới
              </h3>
              <Link to="/admin/posts" className="text-sm text-brand-600 hover:text-brand-700">
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-3">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có bài viết nào</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Contacts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Contacts */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>📬</span>
                Liên hệ gần đây
              </h3>
              <Link to="/admin/contacts" className="text-sm text-brand-600 hover:text-brand-700">
                Xem tất cả →
              </Link>
            </div>
            <div className="space-y-3">
              {recentContacts.length > 0 ? (
                recentContacts.map((contact) => (
                  <div key={contact.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{contact.name}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(contact.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có liên hệ nào</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚡</span>
              Thao tác nhanh
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/products"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🎨</span>
                  <p className="text-sm font-medium text-gray-700">Sản phẩm</p>
                </div>
              </Link>
              
              <Link
                to="/admin/projects"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🏗️</span>
                  <p className="text-sm font-medium text-gray-700">Dự án</p>
                </div>
              </Link>
              
              <Link
                to="/admin/posts"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">📝</span>
                  <p className="text-sm font-medium text-gray-700">Bài viết</p>
                </div>
              </Link>
              
              <Link
                to="/admin/sliders"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🖼️</span>
                  <p className="text-sm font-medium text-gray-700">Slider</p>
                </div>
              </Link>
              
              <Link
                to="/admin/menus"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🔗</span>
                  <p className="text-sm font-medium text-gray-700">Menu</p>
                </div>
              </Link>
              
              <Link
                to="/admin/settings"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all group"
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">⚙️</span>
                  <p className="text-sm font-medium text-gray-700">Cài đặt</p>
                </div>
              </Link>
            </div>

            <Link
              to="/"
              target="_blank"
              className="mt-3 block p-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg hover:from-brand-700 hover:to-purple-700 transition-all text-center font-medium"
            >
              🌐 Xem Website
            </Link>
          </div>
        </div>
      </div>
  )
}

// StatCard Component
function StatCard({ icon, title, value, color, link, subtitle }) {
  console.log(`StatCard ${title}:`, value)
  return (
    <Link to={link} className="block group">
      <div className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-4xl">{icon}</div>
          <div className="text-white/80 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div>
          <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
          <p className="text-white text-3xl font-bold mb-1">{value}</p>
          <p className="text-white/70 text-xs">{subtitle}</p>
        </div>
      </div>
    </Link>
  )
}