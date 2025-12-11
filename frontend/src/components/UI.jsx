import { useState } from 'react'

const LoadingSpinner = ({ size = 'md', color = 'brand-600', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-${color} ${sizes[size]} ${className}`} />
  )
}

const LoadingCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-200"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="h-3 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
)

const LoadingTable = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="border-b border-gray-200 py-4">
        <div className="flex space-x-4">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
)

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline: 'border border-brand-600 text-brand-600 hover:bg-brand-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-md transition-all duration-200
        transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

const Card = ({ children, hover = true, className = '', ...props }) => (
  <div 
    className={`
      bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300
      ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
      ${className}
    `} 
    {...props}
  >
    {children}
  </div>
)

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-brand-100 text-brand-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`
          inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all
          sm:my-8 sm:align-middle ${sizes[size]} sm:w-full animate-in zoom-in-95 duration-300
        `}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const Toast = ({ message, type = 'info', isVisible, onClose }) => {
  const types = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  }

  if (!isVisible) return null

  return (
    <div className={`
      fixed top-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg transition-all duration-300
      transform ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      ${types[type]}
    `}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const useToast = () => {
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' })

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ isVisible: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }))
    }, duration)
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return { toast, showToast, hideToast }
}

export {
  LoadingSpinner,
  LoadingCard,
  LoadingTable,
  Button,
  Card,
  Badge,
  Modal,
  Toast,
  useToast
}