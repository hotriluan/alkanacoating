import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Careers() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [settings, setSettings] = useState({})

  useEffect(() => {
    loadJobs()
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings/public')
      const settingsObj = {}
      response.data.forEach(setting => {
        settingsObj[setting.key] = setting.value
      })
      setSettings(settingsObj)
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadJobs = async () => {
    try {
      const response = await api.get('/recruitments')
      setJobs(response.data.data || response.data)
    } catch (error) {
      console.error('Error loading recruitments:', error)
    } finally {
      setLoading(false)
    }
  }

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Get unique locations
  const locations = [...new Set(jobs.map(job => job.location).filter(Boolean))]

  const filteredJobs = jobs.filter(job => {
    const matchesLocation = !selectedLocation || job.location === selectedLocation
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stripHtml(job.description).toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesLocation && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              {settings.careers_hero_title || 'Cơ Hội Nghề Nghiệp'}
            </h1>
            <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
              {settings.careers_hero_subtitle || 'Tham gia đội ngũ chuyên gia hàng đầu trong ngành sơn công nghiệp tại Việt Nam'}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">
                  {settings.careers_stat_positions || jobs.length + '+'}
                </div>
                <div className="text-brand-100">
                  {settings.careers_stat_positions_label || 'Vị trí tuyển dụng'}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">
                  {settings.careers_stat_experience || '15+'}
                </div>
                <div className="text-brand-100">
                  {settings.careers_stat_experience_label || 'Năm kinh nghiệm'}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">
                  {settings.careers_stat_employees || '500+'}
                </div>
                <div className="text-brand-100">
                  {settings.careers_stat_employees_label || 'Nhân viên'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Location Filter */}
            <div className="md:w-64">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">Tất cả địa điểm</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Clear Button */}
            {(searchTerm || selectedLocation) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedLocation('')
                }}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Tìm thấy <span className="font-semibold text-brand-600">{filteredJobs.length}</span> vị trí phù hợp
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">Không tìm thấy vị trí phù hợp</h3>
            <p className="mt-2 text-gray-600">Vui lòng thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const daysRemaining = getDaysRemaining(job.deadline);
              const isUrgent = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;

              return (
                <div key={job.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 flex-1">
                          {job.title}
                        </h3>
                        <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full whitespace-nowrap">
                          Mới
                        </span>
                      </div>
                      
                      {/* Meta Info */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {job.location && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{job.salary}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
                      {stripHtml(job.description) || 'Xem chi tiết để biết thêm thông tin...'}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {job.deadline && (
                        <div className={`text-sm flex items-center ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {daysRemaining !== null && daysRemaining >= 0 ? (
                            <span>Còn {daysRemaining} ngày</span>
                          ) : (
                            <span>{formatDate(job.deadline)}</span>
                          )}
                        </div>
                      )}
                      
                      <Link 
                        to={`/tuyen-dung/${job.slug}`}
                        className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        Ứng tuyển
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>

                    {/* Urgent Badge */}
                    {isUrgent && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Sắp hết hạn
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Why Join Us Section */}
        <div className="mt-20 bg-white rounded-xl shadow-sm p-12">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {settings.careers_why_title || 'Tại sao chọn Alkana Coating?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(() => {
              let benefits = [];
              try {
                benefits = typeof settings.careers_benefits === 'string' 
                  ? JSON.parse(settings.careers_benefits) 
                  : settings.careers_benefits || [];
              } catch (e) {
                console.error('Error parsing benefits:', e);
                benefits = [
                  { icon: '⚡', title: 'Môi trường năng động', description: 'Làm việc với công nghệ hiện đại và đội ngũ chuyên nghiệp' },
                  { icon: '📚', title: 'Đào tạo chuyên sâu', description: 'Chương trình đào tạo nội bộ và quốc tế thường xuyên' },
                  { icon: '📈', title: 'Thăng tiến rõ ràng', description: 'Lộ trình phát triển sự nghiệp minh bạch' },
                  { icon: '💰', title: 'Thu nhập hấp dẫn', description: 'Lương thưởng cạnh tranh và phúc lợi toàn diện' },
                ];
              }

              if (!Array.isArray(benefits) || benefits.length === 0) {
                benefits = [
                  { icon: '⚡', title: 'Môi trường năng động', description: 'Làm việc với công nghệ hiện đại và đội ngũ chuyên nghiệp' },
                  { icon: '📚', title: 'Đào tạo chuyên sâu', description: 'Chương trình đào tạo nội bộ và quốc tế thường xuyên' },
                  { icon: '📈', title: 'Thăng tiến rõ ràng', description: 'Lộ trình phát triển sự nghiệp minh bạch' },
                  { icon: '💰', title: 'Thu nhập hấp dẫn', description: 'Lương thưởng cạnh tranh và phúc lợi toàn diện' },
                ];
              }

              return benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    {benefit.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
