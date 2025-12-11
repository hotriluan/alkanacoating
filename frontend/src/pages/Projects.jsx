import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { LoadingCard, Card, Badge } from '../components/UI'
import { resolveAssetUrl } from '../utils/media'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [settings, setSettings] = useState({})

  useEffect(() => {
    loadProjects()
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
  }, [])

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data.data || response.data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    // Search in title, short_description, location, and client
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Only show published projects
    const isPublished = project.is_published !== false
    
    return matchesSearch && isPublished
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-brand-800 mb-4 animate-in slide-in-from-top duration-700">
          Dự án tiêu biểu
        </h1>
        <p className="text-lg text-slate-600 animate-in slide-in-from-top duration-700 delay-200">
          Những công trình được thực hiện bởi đội ngũ chuyên gia của chúng tôi
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 animate-in slide-in-from-top duration-700 delay-300">
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-600 mb-4">
          Hiển thị {filteredProjects.length} dự án
          {searchTerm && (
            <Badge variant="default" className="ml-2">
              "{searchTerm}"
            </Badge>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <Card 
              key={project.id}
              className={`animate-in slide-in-from-bottom duration-500 delay-${index * 100}`}
            >
              <Link to={`/du-an/${project.slug}`} className="block">
                {/* Project Image */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden relative group">
                  {project.thumbnail || project.image ? (
                    <img 
                      src={resolveAssetUrl(project.thumbnail || project.image)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e0e7ff" width="400" height="300"/%3E%3Ctext fill="%233b82f6" font-family="sans-serif" font-size="48" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E%F0%9F%8F%97%EF%B8%8F%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-blue-600 text-6xl">🏗️</span>
                    </div>
                  )}
                  
                  {/* Progress Badge */}
                  {project.progress_percentage !== undefined && project.progress_percentage < 100 && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="warning" className="bg-amber-500 text-white font-semibold shadow-lg">
                        {project.progress_percentage}%
                      </Badge>
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  {project.project_type && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="primary" className="bg-brand-600 text-white shadow-lg">
                        {project.project_type}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-brand-800 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  
                  {/* Location & Client */}
                  <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-600">
                    {project.location && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{project.location}</span>
                      </div>
                    )}
                    {project.client && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{project.client}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {project.short_description || project.excerpt || project.content?.substring(0, 150) + '...'}
                  </p>

                  {/* Status & Date */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={project.progress_percentage === 100 ? "success" : "default"}>
                      {project.progress_percentage === 100 ? 'Hoàn thành' : 'Đang thực hiện'}
                    </Badge>
                    {project.end_date && (
                      <span className="text-xs text-slate-500">
                        {new Date(project.end_date).getFullYear()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
                      Xem chi tiết →
                    </span>
                    <div className="flex items-center space-x-1">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-xs text-slate-500">{project.view_count || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy dự án</h3>
          <p className="text-slate-500 mb-4">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc loại dự án
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-700 delay-500">
        {[
          { number: '50+', label: 'Dự án hoàn thành', icon: '🏆' },
          { number: '15+', label: 'Năm kinh nghiệm', icon: '⭐' },
          { number: '100%', label: 'Khách hàng hài lòng', icon: '😊' },
          { number: '24/7', label: 'Hỗ trợ kỹ thuật', icon: '🛠️' }
        ].map((stat, index) => (
          <div key={index} className="text-center p-6 bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-brand-800 mb-1">{stat.number}</div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl p-8 animate-in slide-in-from-bottom duration-700 delay-600">
        <h2 className="text-2xl font-bold text-brand-800 mb-4">
          Bạn có dự án cần thực hiện?
        </h2>
        <p className="text-slate-600 mb-6">
          Hãy để chúng tôi tư vấn và báo giá miễn phí cho dự án của bạn
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/lien-he"
            className="bg-brand-600 text-white px-8 py-3 rounded-lg hover:bg-brand-700 transition-all duration-200 transform hover:scale-105"
          >
            Yêu cầu báo giá
          </Link>
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
  )
}
