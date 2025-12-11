import React from 'react';
import EmojiInputField from './EmojiInputField';

const BenefitsBuilder = ({ value, onChange }) => {
  const benefits = Array.isArray(value) ? value : [];

  const addBenefit = () => {
    onChange([
      ...benefits,
      {
        icon: '⚡',
        title: '',
        description: ''
      }
    ]);
  };

  const removeBenefit = (index) => {
    onChange(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index, field, newValue) => {
    const updated = [...benefits];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  const moveBenefit = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= benefits.length) return;
    
    const updated = [...benefits];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {benefits.map((benefit, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">Lợi ích #{index + 1}</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveBenefit(index, -1)}
                disabled={index === 0}
                className="p-1.5 text-gray-600 hover:text-brand-600 disabled:opacity-30"
                title="Di chuyển lên"
              >
                ⬆️
              </button>
              <button
                type="button"
                onClick={() => moveBenefit(index, 1)}
                disabled={index === benefits.length - 1}
                className="p-1.5 text-gray-600 hover:text-brand-600 disabled:opacity-30"
                title="Di chuyển xuống"
              >
                ⬇️
              </button>
              <button
                type="button"
                onClick={() => removeBenefit(index)}
                className="p-1.5 text-red-600 hover:text-red-800"
                title="Xóa"
              >
                🗑️
              </button>
            </div>
          </div>

          <EmojiInputField
            value={benefit.icon || ''}
            onChange={(newIcon) => updateBenefit(index, 'icon', newIcon)}
            label="Icon (emoji hoặc ký tự)"
            placeholder="⚡"
            maxLength={10}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề
            </label>
            <input
              type="text"
              value={benefit.title || ''}
              onChange={(e) => updateBenefit(index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Môi trường năng động"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={benefit.description || ''}
              onChange={(e) => updateBenefit(index, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              placeholder="Làm việc với công nghệ hiện đại và đội ngũ chuyên nghiệp"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addBenefit}
        className="w-full px-4 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-lg hover:from-brand-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <span className="text-lg">➕</span>
        Thêm lợi ích mới
      </button>

      {benefits.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-2xl mb-2">📝</p>
          <p>Chưa có lợi ích nào. Nhấn nút trên để thêm.</p>
        </div>
      )}
    </div>
  );
};

export default BenefitsBuilder;
