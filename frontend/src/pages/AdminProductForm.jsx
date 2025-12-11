import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import RichTextEditor from '../admin/components/RichTextEditor'
import MultiImageUpload from '../admin/components/MultiImageUpload'
import api, { API_ROOT } from '../services/api'

export default function AdminProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category_id: '',
    is_active: true,
    is_featured: false,
    meta_title: '',
    meta_description: '',
    features: '',
    applications: '',
    technical_specs: ''
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [productImages, setProductImages] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin/login')
      return
    }

    // Set auth header for all requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Load categories
    loadCategories()

    // Load product if editing
    if (isEdit) {
      loadProduct()
    }
  }, [navigate, id, isEdit])

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.data || response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
      if (error.response?.status === 401) {
        navigate('/admin/login')
      }
    }
  }

  const loadProduct = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/admin/products/${id}`)
      const product = response.data.data || response.data
      // normalize boolean-like values from backend (int/string) into proper booleans
      const coerceBool = (v, fallback = false) => {
        if (v === undefined || v === null) return fallback
        if (typeof v === 'boolean') return v
        if (typeof v === 'number') return v === 1
        if (typeof v === 'string') return v === '1' || v === 'true' || v === 'on'
        return Boolean(v)
      }

      const newForm = {
        name: product.name || '',
        description: product.excerpt || '',
        content: product.content || '',
        category_id: product.category_id || '',
        is_active: coerceBool(product.is_active, true),
        is_featured: coerceBool(product.is_featured, false),
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        features: product.features || '',
        applications: product.applications || '',
        technical_specs: product.technical_specs || ''
      }

      setFormData(newForm)

      // Set existing images preview if available
      if (product.images && product.images.length > 0) {
        const existingImages = product.images.map((img, index) => ({
          id: `existing_${index}`,
                url: `${API_ROOT}/${img.image_path}`,
          name: `existing_image_${index}`,
          file: null // Existing images don't have file objects
        }))
        setProductImages(existingImages)
      } else if (product.thumbnail) {
        // Fallback to old thumbnail system
        setProductImages([{
          id: 'existing_thumbnail',
          url: `${API_ROOT}/${product.thumbnail}`,
          name: 'existing_thumbnail',
          file: null
        }])
      }

      setError('') // Clear any previous errors
    } catch (error) {
      console.error('Error loading product:', error)
      if (error.response?.status === 401) {
        navigate('/admin/login')
      } else {
        setError('Không thể tải thông tin sản phẩm: ' + (error.response?.data?.message || error.message))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Prepare submit data

    try {
      // Create FormData for file upload
      const submitData = new FormData()

      // Append form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key]

        // Skip sending empty category_id to avoid sending an empty string to backend
        if (key === 'category_id' && (value === '' || value === null || value === undefined)) {
          // Intentionally omit category_id from FormData when no category is selected.
          return
        }

        if (value !== null && value !== undefined) {
          // Convert boolean to proper string for Laravel
          if (key === 'is_active' || key === 'is_featured') {
            const b = value
            submitData.append(key, (b === true || b === 'true' || b === '1') ? '1' : '0')
            // convert boolean to '1'/'0' for Laravel
          } else {
            submitData.append(key, value)
          }
        }
      })

      // Append multiple image files
      if (productImages.length > 0) {
        productImages.forEach((image, index) => {
          if (image.file) {
            submitData.append(`images[${index}]`, image.file)
            // appended image file
          }
        })
        submitData.append('primary_image_index', 0) // First image is primary
        // primary image index set to 0
      }

      // Don't set Content-Type manually for FormData - let browser handle it
      const config = {
        headers: {
          // Remove Content-Type to let browser set multipart boundary
        }
      }

      if (isEdit) {
        // For edit, use POST with _method override
        submitData.append('_method', 'PUT')
        // updating existing product

        const response = await api.post(`/admin/products/${id}`, submitData, config)
        console.log('Update response:', response.data)

        console.log('Product updated successfully, navigating back to products list')
        navigate('/admin/products')
      } else {
        await api.post('/admin/products', submitData, config)
        navigate('/admin/products')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <div>Đang tải...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/admin/products" className="text-brand-600 hover:text-brand-700">
                ← Quay lại
              </Link>
              <h1 className="text-2xl font-bold text-brand-800">
                {isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Thông tin cơ bản</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="VD: Alkana EpoFloor Pro 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Danh mục
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multiple Images Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hình ảnh sản phẩm
                </label>
                <MultiImageUpload
                  images={productImages}
                  onChange={setProductImages}
                  maxImages={8}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mô tả ngắn
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Mô tả ngắn gọn về sản phẩm..."
                height="150px"
              />
            </div>

            <div className="mt-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="ml-2 text-sm text-slate-700">Kích hoạt sản phẩm</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="ml-2 text-sm text-slate-700">🌟 Sản phẩm nổi bật</span>
              </label>
            </div>
          </div>

          {/* Detailed Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Nội dung chi tiết</h2>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nội dung chính
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  placeholder="Mô tả chi tiết về sản phẩm, thành phần, cách sử dụng..."
                  height="300px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tính năng nổi bật
                </label>
                <RichTextEditor
                  value={formData.features}
                  onChange={(value) => setFormData(prev => ({ ...prev, features: value }))}
                  placeholder="Liệt kê các tính năng nổi bật..."
                  height="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ứng dụng
                </label>
                <RichTextEditor
                  value={formData.applications}
                  onChange={(value) => setFormData(prev => ({ ...prev, applications: value }))}
                  placeholder="Các lĩnh vực ứng dụng của sản phẩm..."
                  height="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Thông số kỹ thuật
                </label>
                <RichTextEditor
                  value={formData.technical_specs}
                  onChange={(value) => setFormData(prev => ({ ...prev, technical_specs: value }))}
                  placeholder="Thông số kỹ thuật chi tiết..."
                  height="200px"
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Cài đặt SEO</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tiêu đề SEO
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Tiêu đề tối ưu cho SEO..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả SEO
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Mô tả ngắn gọn cho search engines..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Link
              to="/admin/products"
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}