import axios from 'axios'

// Production API base URL - Update này khi deploy
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yourdomain.matbao.net/api'  // Thay yourdomain bằng domain thật
  : '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies
})

// Request interceptor để thêm auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor để handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired hoặc invalid
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api