import { useState } from 'react';

const EMOJI_CATEGORIES = {
  'Phổ biến': ['📰', '📝', '📄', '📋', '📌', '📍', '🏷️', '🔖', '💡', '⭐', '✨', '🌟'],
  'Công nghiệp': ['🏭', '🏗️', '🔧', '🔨', '⚙️', '🛠️', '⚒️', '🔩', '⚡', '🔬', '🧪', '🧰'],
  'Sơn & Màu': ['🎨', '🖌️', '🖍️', '✏️', '🖊️', '🖋️', '💧', '🌈', '🎭', '🖼️', '🏠', '🏘️'],
  'Tài liệu': ['📁', '📂', '📊', '📈', '📉', '📑', '📒', '📓', '📔', '📕', '📗', '📘'],
  'Biểu tượng': ['✅', '❌', '⚠️', '🔔', '🔕', '💬', '💭', '🗨️', '🗯️', '💫', '🎯', '🎪'],
  'Tự nhiên': ['🌿', '🍃', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌺', '🌻', '🌼', '🌷'],
};

export default function EmojiPicker({ value, onChange, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Phổ biến');

  const handleSelect = (emoji) => {
    onChange(emoji);
    if (onClose) onClose();
  };

  return (
    <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl w-80" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Chọn Icon</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 px-2 py-2 gap-1">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(emoji)}
              className={`text-2xl p-2 rounded-lg hover:bg-brand-50 transition-all transform hover:scale-110 ${
                value === emoji ? 'bg-brand-100 ring-2 ring-brand-500' : 'hover:shadow-md'
              }`}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Đã chọn:</span>
          <span className="text-2xl">{value || '🏷️'}</span>
        </div>
      </div>
    </div>
  );
}
