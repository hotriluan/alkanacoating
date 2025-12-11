import api from '../services/api'

/**
 * Build an absolute URL for assets stored as relative paths like 'uploads/...'
 * - Returns original value if it's already an absolute http(s) URL
 * - Falls back to current origin when API baseURL is not available
 */
export function resolveAssetUrl(path) {
  if (!path) return ''
  if (typeof path === 'string' && /^https?:\/\//i.test(path)) return path
  const base = (api?.defaults?.baseURL?.replace('/api', '')) || (typeof window !== 'undefined' ? window.location.origin : '')
  const normalized = String(path).replace(/^\/+/, '')
  return `${base}/${normalized}`
}
