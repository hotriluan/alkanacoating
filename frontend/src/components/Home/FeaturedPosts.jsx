import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { resolveAssetUrl } from '../../utils/media';

export default function FeaturedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts/featured');
        setPosts((Array.isArray(response.data) ? response.data : (response.data.posts || [])).slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured posts:', error);
        setPosts([
          {
            id: 1,
            title: 'Hướng dẫn chọn sơn chống ăn mòn phù hợp',
            slug: 'huong-dan-chon-son-chong-an-mon',
            excerpt: 'Những tiêu chí quan trọng khi lựa chọn sơn chống ăn mòn cho các công trình',
            image: '/assets/blog1.jpg',
            created_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-6 md:py-10 bg-gradient-to-b from-white to-gray-50">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-800 mb-6 text-center">Tin tức & Bài viết</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-white to-gray-50" data-aos="fade-up">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-800 mb-6 text-center">Tin tức & Bài viết</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {posts.map((post, index) => {
          const imageUrl = resolveAssetUrl(post.thumbnail || post.featured_image || post.image);
          return (
            <Link
              to={`/bai-viet/${post.slug}`}
              key={post.id}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="aspect-video w-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { 
                      e.currentTarget.onerror = null;
                      e.currentTarget.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="48" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📝%3C/text%3E%3C/svg%3E' 
                    }}
                  />
                ) : (
                  <span className="text-green-600 text-6xl">📝</span>
                )}
              </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-brand-100 text-brand-700 text-xs rounded-full">
                  Mới
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(post.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h3 className="text-base font-semibold text-brand-800 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              <span className="text-brand-600 font-medium hover:text-brand-700 transition-colors text-sm">
                Đọc thêm →
              </span>
            </div>
          </Link>
          );
        })}
      </div>
      <div className="text-center mt-8">
        <Link
          to="/bai-viet"
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Xem tất cả bài viết
        </Link>
      </div>
    </section>
  );
}