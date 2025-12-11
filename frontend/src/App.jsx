import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import ProductsPage from './features/products/pages/ProductsPage.jsx'
import ProductDetailPage from './features/products/pages/ProductDetailPage.jsx'
import CategoryDetail from './pages/CategoryDetail.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Blog from './pages/Blog.jsx'
import BlogDetail from './pages/BlogDetail.jsx'
import Careers from './pages/Careers.jsx'
import CareerDetail from './pages/CareerDetail.jsx'
import Contact from './pages/Contact.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminRoutes from './admin/AdminRoutes.jsx'
import useGoogleAnalytics from './hooks/useGoogleAnalytics.js'

export default function App() {
  useGoogleAnalytics()
  
  return (
    <Routes>
      {/* Admin Routes (without Layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      
      {/* New Admin Management Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      
      {/* Public Routes (with Layout) */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gioi-thieu" element={<About />} />
            <Route path="/san-pham" element={<ProductsPage />} />
            <Route path="/san-pham/danh-muc/:slug" element={<CategoryDetail />} />
            <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
            <Route path="/du-an" element={<Projects />} />
            <Route path="/du-an/:slug" element={<ProjectDetail />} />
            <Route path="/bai-viet" element={<Blog />} />
            <Route path="/bai-viet/:slug" element={<BlogDetail />} />
            <Route path="/tuyen-dung" element={<Careers />} />
            <Route path="/tuyen-dung/:slug" element={<CareerDetail />} />
            <Route path="/lien-he" element={<Contact />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}
