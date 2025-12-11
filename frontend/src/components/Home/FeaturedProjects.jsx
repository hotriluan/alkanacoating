import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { resolveAssetUrl } from '../../utils/media';

export default function FeaturedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/featured');
        const all = Array.isArray(response.data) ? response.data : (response.data.projects || []);
        const featured = all.filter(p => p.is_featured);
        setProjects(featured.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured projects:', error);
        setProjects([
          {
            id: 1,
            title: 'Dự án sơn nhà máy thép',
            slug: 'du-an-son-nha-may-thep',
            description: 'Thi công sơn chống mòn cho nhà máy thép tại Đồng Nai',
            image: '/assets/project1.jpg'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="py-6 md:py-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-800 mb-6 text-center">Dự án tiêu biểu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-10" data-aos="fade-up">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-800 mb-6 text-center">Dự án tiêu biểu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {projects.map((project, index) => (
          <Link
            to={`/du-an/${project.slug}`}
            key={project.id}
            className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              {project.thumbnail || project.image ? (
                <img
                  src={resolveAssetUrl(project.thumbnail || project.image)}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <span className="text-blue-600 text-6xl">🏗️</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-brand-800 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                {project.title}
              </h3>
              <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                {project.description ? project.description.replace(/<[^>]+>/g, '') : ''}
              </p>
              <span className="text-brand-600 font-medium hover:text-brand-700 transition-colors text-sm">
                Xem chi tiết →
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          to="/du-an"
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Xem tất cả dự án
        </Link>
      </div>
    </section>
  );
}