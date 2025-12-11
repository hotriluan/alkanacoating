import { useState, useEffect } from 'react';
import EmojiInputField from './EmojiInputField';

export default function ValuesBuilder({ value, onChange }) {
  const [values, setValues] = useState([]);

  useEffect(() => {
    if (value) {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        setValues(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Error parsing values:', e);
        setValues([]);
      }
    }
  }, [value]);

  const handleAdd = () => {
    const newValues = [...values, { icon: '⭐', title: '', description: '' }];
    setValues(newValues);
    onChange(JSON.stringify(newValues));
  };

  const handleRemove = (index) => {
    const newValues = values.filter((_, i) => i !== index);
    setValues(newValues);
    onChange(JSON.stringify(newValues));
  };

  const handleChange = (index, field, fieldValue) => {
    const newValues = [...values];
    newValues[index][field] = fieldValue;
    setValues(newValues);
    onChange(JSON.stringify(newValues));
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <button
        type="button"
        onClick={handleAdd}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Thêm giá trị
      </button>

      {/* Values List */}
      <div className="space-y-4">
        {values.map((valueItem, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <EmojiInputField
                  value={valueItem.icon || ''}
                  onChange={(newIcon) => handleChange(index, 'icon', newIcon)}
                  label="Icon (Emoji)"
                  placeholder="🎯"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={valueItem.title || ''}
                    onChange={(e) => handleChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: Chất lượng hàng đầu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={valueItem.description || ''}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả chi tiết về giá trị này..."
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {values.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-4">👁️ Xem trước:</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((valueItem, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-5xl mb-4">{valueItem.icon || '⭐'}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{valueItem.title || 'Tiêu đề'}</h3>
                <p className="text-gray-600">{valueItem.description || 'Mô tả...'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {values.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p>Chưa có giá trị nào. Nhấn nút "Thêm giá trị" để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
