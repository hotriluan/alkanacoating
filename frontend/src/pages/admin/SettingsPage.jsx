import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/settings');
      // Flatten settings into a key-value pair object for easier state management
      const flattenedSettings = Object.values(response.data).flat().reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      setSettings(flattenedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Không thể tải cài đặt.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (group) => {
    const settingsToSave = Object.keys(settings)
      .filter(key => key.startsWith(group))
      .map(key => ({ key, value: settings[key] }));

    if (settingsToSave.length === 0) {
      toast.success('Không có gì để lưu.');
      return;
    }
    
    const promise = api.post('/admin/settings/bulk', { settings: settingsToSave });

    toast.promise(promise, {
      loading: 'Đang lưu...',
      success: 'Đã lưu cài đặt!',
      error: 'Lỗi khi lưu cài đặt.',
    });
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  const tabs = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'general', label: 'Chung' },
    { key: 'contact', label: 'Liên hệ' },
    { key: 'social', label: 'Mạng xã hội' },
    { key: 'footer', label: 'Footer' },
  ];

  return (
    <div className="p-6">
      <Toaster position="bottom-right" />
      <h1 className="text-2xl font-bold mb-4">Cài đặt</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'analytics' && (
          <SettingsCard title="Google Analytics" onSave={() => handleSave('google_analytics')}>
            <InputField
              label="Mã đo lường (Measurement ID)"
              name="google_analytics_tracking_id"
              value={settings.google_analytics_tracking_id || ''}
              onChange={handleInputChange}
              helpText="Lấy từ Google Analytics, có dạng G-XXXXXXXXXX"
            />
          </SettingsCard>
        )}

        {/* Add other tabs content here */}
        
      </div>
    </div>
  );
};

const SettingsCard = ({ title, children, onSave }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
    <div className="mt-6 flex justify-end">
      <button
        onClick={onSave}
        className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
      >
        Lưu thay đổi
      </button>
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, helpText, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
    />
    {helpText && <p className="mt-2 text-sm text-gray-500">{helpText}</p>}
  </div>
);

export default SettingsPage;
