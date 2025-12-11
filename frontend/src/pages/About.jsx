import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_ROOT } from '../services/api';
import api from '../services/api';

export default function About() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/group/about');
        // API returns object directly, not wrapped in data
        const settingsData = res.data.data || res.data;
        const settingsObj = {};

        // If it's an array, convert to object
        if (Array.isArray(settingsData)) {
          settingsData.forEach(setting => {
            settingsObj[setting.key] = setting.value;
          });
        } else {
          // If it's already an object, use it directly
          Object.assign(settingsObj, settingsData);
        }

        setSettings(settingsObj);
      } catch (error) {
        console.error('Error fetching about settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Parse stats - handle both string and array
  let stats = [];
  if (settings.about_stats) {
    try {
      stats = typeof settings.about_stats === 'string'
        ? JSON.parse(settings.about_stats)
        : settings.about_stats;
    } catch (e) {
      console.error('Error parsing about_stats:', e);
      stats = [];
    }
  }

  // Parse values - handle both string and array
  let values = [];
  if (settings.about_values) {
    try {
      values = typeof settings.about_values === 'string'
        ? JSON.parse(settings.about_values)
        : settings.about_values;
    } catch (e) {
      console.error('Error parsing about_values:', e);
      values = [];
    }
  }

  // Fallback values if not in settings
  if (values.length === 0) {
    values = [
      {
        icon: '🎯',
        title: 'Chất lượng hàng đầu',
        description: 'Cam kết cung cấp sản phẩm chất lượng cao, đạt tiêu chuẩn quốc tế'
      },
      {
        icon: '🌱',
        title: 'Thân thiện môi trường',
        description: 'Ưu tiên các giải pháp bền vững, giảm thiểu tác động đến môi trường'
      },
      {
        icon: '🤝',
        title: 'Đối tác tin cậy',
        description: 'Luôn đồng hành cùng khách hàng trong mọi dự án'
      }
    ];
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-br from-brand-600 to-brand-800 overflow-hidden">
        {settings.about_hero_image && (() => {
          const raw = settings.about_hero_image;
          const heroSrc = (raw && (raw.startsWith('data:') || /^https?:\/\//i.test(raw)))
            ? raw
            : (API_ROOT.replace(/\/$/, '') + (raw.startsWith('/') ? raw : '/' + raw));
          return (
            <img
              src={heroSrc}
              alt={settings.about_title || 'Giới thiệu'}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          );
        })()}

        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              {settings.about_title || 'Giới thiệu về chúng tôi'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl drop-shadow">
              {settings.about_intro || 'Hành trình phát triển và cam kết chất lượng của Alkana Coating'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="bg-white py-12 -mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl md:text-5xl font-bold text-brand-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: settings.about_content || '<p>Nội dung đang được cập nhật...</p>'
            }}
          />
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="bg-gradient-to-br from-brand-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12 text-gray-800"
          >
            Giá trị cốt lõi
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sẵn sàng hợp tác cùng chúng tôi?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Liên hệ ngay để nhận tư vấn và báo giá tốt nhất cho dự án của bạn
            </p>
            <a
              href="/lien-he"
              className="inline-block bg-white text-brand-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              Liên hệ ngay
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
