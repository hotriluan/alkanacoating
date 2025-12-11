import { useState } from 'react';

export default function StatsBuilder({ value, onChange }) {
  const [stats, setStats] = useState(() => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : (value || []);
    } catch {
      return [];
    }
  });

  const updateStats = (newStats) => {
    setStats(newStats);
    onChange(JSON.stringify(newStats, null, 2));
  };

  const addStat = () => {
    updateStats([...stats, { label: 'Tiêu đề mới', value: '0+' }]);
  };

  const removeStat = (index) => {
    updateStats(stats.filter((_, i) => i !== index));
  };

  const updateStat = (index, field, newValue) => {
    const newStats = [...stats];
    newStats[index][field] = newValue;
    updateStats(newStats);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">📊 Quản lý thống kê</h3>
        <button
          type="button"
          onClick={addStat}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          + Thêm thống kê
        </button>
      </div>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    placeholder="VD: Năm kinh nghiệm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Giá trị
                  </label>
                  <input
                    type="text"
                    value={stat.value || ''}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    placeholder="VD: 15+"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeStat(index)}
                className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Xóa"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {stats.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>Chưa có thống kê nào. Click "Thêm thống kê" để bắt đầu.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-800 mb-2">👁️ Xem trước:</p>
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-brand-600">{stat.value}</div>
              <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
