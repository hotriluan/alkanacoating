import React, { useState, useEffect } from 'react';
import api, { apiReady, ensureDevAuth } from '../../services/api';
import StatsBuilder from '../components/StatsBuilder';
import FooterColumnsBuilder from '../components/FooterColumnsBuilder';
import BenefitsBuilder from '../components/BenefitsBuilder';
import ImageUploader from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';
import ValuesBuilder from '../components/ValuesBuilder';
import JsonFileUploader from '../components/JsonFileUploader';

const SettingsManagement = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [analyticsJsonExists, setAnalyticsJsonExists] = useState(false);

  const tabs = [
    { id: 'about', label: 'Giới thiệu', icon: '📖' },
    { id: 'contact', label: 'Liên hệ', icon: '📞' },
    { id: 'footer', label: 'Footer', icon: '🦶' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'careers', label: 'Tuyển dụng', icon: '💼' },
    { id: 'analytics', label: 'Phân tích', icon: '📊' },
  ];

  const checkAnalyticsJson = async () => {
    try {
      const res = await api.get('/admin/settings/check-analytics-json');
      setAnalyticsJsonExists(res.data.exists);
    } catch (error) {
      console.error('Error checking analytics JSON:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { if (apiReady && typeof apiReady.then === 'function') await apiReady; } catch { }
      if (mounted) {
        fetchSettings();
        checkAnalyticsJson();
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      const grouped = response.data;

      if (!grouped.analytics) {
        grouped.analytics = [
          {
            key: 'ga_property_id',
            value: '',
            label: 'Google Analytics Property ID',
            description: 'Nhập Property ID của bạn (VD: 123456789).',
            type: 'text',
            group: 'analytics'
          },
        ];
      }

      setSettings(grouped);

      // Initialize formData from settings
      const initialFormData = {};
      Object.keys(grouped).forEach(group => {
        grouped[group].forEach(setting => {
          let value = setting.value;
          if (setting.type === 'json' && typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch (e) { }
          }
          initialFormData[setting.key] = value;
        });
      });
      setFormData(initialFormData);
    } catch (error) {
      if (error?.response?.status === 401) {
        try {
          await ensureDevAuth();
          fetchSettings();
        } catch (e2) {
          console.error('Auth retry failed:', e2);
        }
      }
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      // Prepare settings for bulk update
      const settingsToUpdate = [];

      Object.keys(settings).forEach(group => {
        settings[group].forEach(setting => {
          const value = formData[setting.key];

          // Force correct type for specific keys
          let type = setting.type;
          if (setting.key === 'about_hero_image') type = 'image';

          settingsToUpdate.push({
            key: setting.key,
            value: value,
            type: type,
            group: setting.group,
            label: setting.label,
            description: setting.description,
            order: setting.order,
          });
        });
      });

      // Ensure virtual settings are included
      if (formData.hasOwnProperty('ga_property_id') && !settingsToUpdate.some(s => s.key === 'ga_property_id')) {
        settingsToUpdate.push({
          key: 'ga_property_id',
          value: formData['ga_property_id'],
          type: 'text',
          group: 'analytics',
          label: 'Google Analytics Property ID',
        });
      }

      if (formData.hasOwnProperty('google_analytics_script') && !settingsToUpdate.some(s => s.key === 'google_analytics_script')) {
        settingsToUpdate.push({
          key: 'google_analytics_script',
          value: formData['google_analytics_script'],
          type: 'textarea',
          group: 'analytics',
          label: 'Mã Google Analytics (gtag.js)',
        });
      }

      await api.post('/admin/settings/bulk', { settings: settingsToUpdate });

      setSuccessMessage('✅ Đã lưu cài đặt thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);

      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Có lỗi xảy ra khi lưu cài đặt: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const renderField = (setting) => {
    const value = formData[setting.key] ?? '';

    // Helper để format JSON
    const formatJSON = () => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        const formatted = JSON.stringify(parsed, null, 2);
        handleInputChange(setting.key, formatted);
      } catch (e) {
        alert('JSON không hợp lệ! Không thể format.');
      }
    };

    // Validate JSON
    const isValidJSON = () => {
      try {
        const str = typeof value === 'string' ? value : JSON.stringify(value);
        JSON.parse(str);
        return true;
      } catch {
        return false;
      }
    };

    // Force specific keys to be specific types
    let renderType = setting.type;
    if (setting.key === 'about_hero_image') renderType = 'image';

    switch (renderType) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
            placeholder={setting.description || `Nhập ${setting.label.toLowerCase()}...`}
          />
        );

      case 'wysiwyg':
        return (
          <RichTextEditor
            value={value}
            onChange={(newValue) => handleInputChange(setting.key, newValue)}
            placeholder={setting.description || 'Nhập nội dung...'}
          />
        );

      case 'json':
        // Use visual builders for specific fields
        if (setting.key === 'about_stats') {
          return (
            <StatsBuilder
              value={value}
              onChange={(newValue) => handleInputChange(setting.key, newValue)}
            />
          );
        }

        if (setting.key === 'about_values') {
          return (
            <ValuesBuilder
              value={value}
              onChange={(newValue) => handleInputChange(setting.key, newValue)}
            />
          );
        }

        if (setting.key === 'footer_columns') {
          return (
            <FooterColumnsBuilder
              value={value}
              onChange={(newValue) => handleInputChange(setting.key, newValue)}
            />
          );
        }

        if (setting.key === 'careers_benefits') {
          return (
            <BenefitsBuilder
              value={value}
              onChange={(newValue) => handleInputChange(setting.key, newValue)}
            />
          );
        }

        // Fallback to raw JSON editor for other JSON fields
        const jsonValid = isValidJSON();
        const jsonStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);

        return (
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={formatJSON}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                ✨ Format đẹp
              </button>
              {jsonValid ? (
                <span className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg font-medium">
                  ✓ JSON hợp lệ
                </span>
              ) : (
                <span className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg font-medium">
                  ✗ Lỗi JSON format
                </span>
              )}
            </div>

            {/* JSON Helper */}
            {setting.key === 'about_stats' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">💡 Mẫu JSON cho Thống kê:</p>
                <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                  {`[
  {
    "label": "Năm kinh nghiệm",
    "value": "15+"
  },
  {
    "label": "Dự án hoàn thành",
    "value": "500+"
  },
  {
    "label": "Khách hàng",
    "value": "200+"
  }
]`}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    const template = [
                      { "label": "Năm kinh nghiệm", "value": "15+" },
                      { "label": "Dự án hoàn thành", "value": "500+" },
                      { "label": "Khách hàng", "value": "200+" }
                    ];
                    handleInputChange(setting.key, JSON.stringify(template, null, 2));
                  }}
                  className="mt-2 px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  📋 Dùng mẫu này
                </button>
              </div>
            )}

            {setting.key === 'footer_columns' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">💡 Mẫu JSON cho Footer:</p>
                <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                  {`[
  {
    "title": "Sản phẩm",
    "links": [
      {"text": "Sơn Epoxy", "url": "/san-pham?category=6"},
      {"text": "Sơn PU", "url": "/san-pham?category=7"}
    ]
  },
  {
    "title": "Hỗ trợ",
    "links": [
      {"text": "Liên hệ", "url": "/lien-he"},
      {"text": "Dự án", "url": "/du-an"}
    ]
  }
]`}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    const template = [
                      {
                        "title": "Sản phẩm",
                        "links": [
                          { "text": "Sơn Epoxy", "url": "/san-pham?category=6" },
                          { "text": "Sơn PU", "url": "/san-pham?category=7" }
                        ]
                      },
                      {
                        "title": "Hỗ trợ",
                        "links": [
                          { "text": "Liên hệ", "url": "/lien-he" }
                        ]
                      }
                    ];
                    handleInputChange(setting.key, JSON.stringify(template, null, 2));
                  }}
                  className="mt-2 px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  📋 Dùng mẫu này
                </button>
              </div>
            )}

            <textarea
              value={jsonStr}
              onChange={(e) => {
                handleInputChange(setting.key, e.target.value);
              }}
              rows={12}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm resize-y ${jsonValid
                  ? 'border-gray-300 focus:ring-brand-500'
                  : 'border-red-300 focus:ring-red-500 bg-red-50'
                }`}
              placeholder='{"key": "value"}'
            />
          </div>
        );

      case 'image':
        return (
          <ImageUploader
            value={value}
            onChange={(newValue) => handleInputChange(setting.key, newValue)}
            label={setting.label}
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
            placeholder={setting.description || `Nhập ${setting.label.toLowerCase()}...`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const currentSettings = settings[activeTab] || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cài đặt Website</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý thông tin giới thiệu, liên hệ, footer và mạng xã hội</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`${saving ? 'bg-gray-400' : 'bg-brand-500 hover:bg-brand-600'
            } text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Đang lưu...
            </>
          ) : (
            <>💾 Lưu tất cả</>
          )}
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 animate-pulse">
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'analytics' ? (
          <div className="space-y-6">
            <div>
              <label className="block mb-2">
                <span className="text-sm font-semibold text-gray-700">Google Analytics Property ID</span>
                <span className="block text-xs text-gray-500 mt-1">Nhập Property ID của bạn (VD: 123456789).</span>
              </label>
              <input
                type="text"
                value={formData['ga_property_id'] || ''}
                onChange={(e) => handleInputChange('ga_property_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
                placeholder="Nhập Property ID..."
              />
            </div>
            <div>
              <label className="block mb-2">
                <span className="text-sm font-semibold text-gray-700">Mã Google Analytics (gtag.js)</span>
                <span className="block text-xs text-gray-500 mt-1">Dán toàn bộ mã &lt;script&gt;...&lt;/script&gt; của Google Analytics vào đây.</span>
              </label>
              <textarea
                value={formData['google_analytics_script'] || ''}
                onChange={(e) => handleInputChange('google_analytics_script', e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y font-mono text-sm"
                placeholder={`<!-- Google tag (gtag.js) -->
<script async src="..."></script>
<script>
  ...
</script>`}
              />
            </div>
            <JsonFileUploader
              existing={analyticsJsonExists}
              onUploadSuccess={checkAnalyticsJson}
            />
          </div>
        ) : currentSettings.length > 0 ? (
          <div className="space-y-6">
            {currentSettings.map(setting => (
              <div key={setting.key} className="pb-6 border-b border-gray-100 last:border-0">
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-700">{setting.label}</span>
                  {setting.description && (
                    <span className="block text-xs text-gray-500 mt-1">{setting.description}</span>
                  )}
                </label>
                {renderField(setting)}
                <div className="mt-1 text-xs text-gray-400 font-mono">
                  Key: {setting.key} • Type: {setting.type}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">🔧</p>
            <p>Chưa có cài đặt nào trong nhóm này</p>
          </div>
        )}
      </div>

      {/* Quick Save Button at Bottom */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`${saving ? 'bg-gray-400' : 'bg-brand-500 hover:bg-brand-600'
            } text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg`}
        >
          {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
};

export default SettingsManagement;
