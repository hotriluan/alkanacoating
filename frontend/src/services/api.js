import axios from 'axios';
import useAuthStore from '../stores/authStore';

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  ((typeof window !== 'undefined' && window.location?.origin)
    ? `${window.location.origin}/api`
    : '/api');

// Root URL (without trailing /api) useful for building public image URLs
const API_ROOT = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Development helper for auto-login
const tryDevAutoLogin = async () => {
  const { setToken, isAuthenticated } = useAuthStore.getState();
  const isDevAutoLoginEnabled = import.meta.env.VITE_DEV_AUTOLOGIN === 'true';
  
  // Only run in a browser, if enabled, and if not already authenticated.
  if (typeof window === 'undefined' || !isDevAutoLoginEnabled || isAuthenticated) {
    return;
  }
  
  const email = import.meta.env.VITE_DEV_ADMIN_EMAIL;
  const password = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('VITE_DEV_AUTOLOGIN is true, but VITE_DEV_ADMIN_EMAIL or VITE_DEV_ADMIN_PASSWORD are not set.');
    return;
  }

  try {
    const loginUrl = `${API_ROOT}/api/admin/login`;
    console.log(`Development auto-login enabled. Attempting login for ${email}`);
    
    const resp = await axios.post(loginUrl, { email, password });

    if (resp.data?.token) {
      // Use the store action to set the token, which will also handle localStorage and headers
      setToken(resp.data.token);
      console.log('Development auto-login successful.');
    }
  } catch (e) {
    console.error('Development auto-login failed. Please check backend and .env credentials.', e.message);
  }
};

// Fire-and-forget auto-login in dev environments.
const apiReady = tryDevAutoLogin();

// Interceptor to add the authentication token from the store to every request.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, let the browser handle it.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
export { apiReady, tryDevAutoLogin as ensureDevAuth, API_BASE_URL, API_ROOT };

