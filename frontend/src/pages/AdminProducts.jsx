import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../admin/components/AdminLayout'
import RichTextEditor from '../admin/components/RichTextEditor'
import api, { API_ROOT } from '../services/api'
import ConfirmationModal from '../components/common/ConfirmationModal'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // State for the confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productToDeleteId, setProductToDeleteId] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data.data || response.data)
    } catch (error) {
      console.error('Error loading products:', error)
      setError('Không thể tải danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  // Opens the modal and sets the product ID to delete
  const handleDeleteClick = (id) => {
    setProductToDeleteId(id)
    setIsModalOpen(true)
  }

  // Called when the user confirms the deletion in the modal
  const handleConfirmDelete = async () => {
    if (!productToDeleteId) return

    try {
      await api.delete(`/admin/products/${productToDeleteId}`)
      setProducts(products.filter(p => p.id !== productToDeleteId))
      toast.success('Xóa sản phẩm thành công!')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Xóa sản phẩm thất bại!')
    } finally {
      setIsModalOpen(false)
      setProductToDeleteId(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <div>Đang tải...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h2>
          <Link
            to="/admin/products/create"
            className="bg-brand-600 text-white px-4 py-2 rounded hover:bg-brand-700 transition-colors"
          >
            + Thêm sản phẩm
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Danh sách sản phẩm ({products.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          {(() => {
                            // Check for primary image first
                            const primaryImage = product.images?.find(img => img.is_primary)
                            const imageUrl = primaryImage
                              ? `${API_ROOT}/${primaryImage.image_path}`
                              : product.thumbnail
                                ? `${API_ROOT}/${product.thumbnail}`
                                : null

                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                                <span className="text-brand-600 text-xl">🎨</span>
                              </div>
                            )
                          })()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {product.description?.substring(0, 100)}
                        {product.description?.length > 100 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category?.name || 'Sơn Epoxy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {product.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                        {product.is_featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            🌟 Nổi bật
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="text-brand-600 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded transition-colors"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
              <p className="text-gray-500 mb-4">Bắt đầu bằng cách thêm sản phẩm đầu tiên</p>
              <Link
                to="/admin/products/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
              >
                + Thêm sản phẩm
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
      />
    </AdminLayout>
  )
}