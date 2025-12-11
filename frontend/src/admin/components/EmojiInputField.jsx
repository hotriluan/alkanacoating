import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

const EmojiInputField = ({ 
  value, 
  onChange, 
  label = "Icon (emoji hoặc ký tự)",
  placeholder = "⚡",
  maxLength = 10,
  className = ""
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData) => {
    onChange(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder={placeholder}
            maxLength={maxLength}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 border border-gray-300"
            title="Chọn emoji"
          >
            {value || '😊'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showEmojiPicker && (
          <div 
            ref={pickerRef}
            className="absolute z-50 right-0 mt-2 shadow-2xl rounded-lg overflow-hidden"
          >
            <EmojiPicker 
              onEmojiClick={handleEmojiClick}
              width={350}
              height={400}
              searchPlaceHolder="Tìm emoji..."
              previewConfig={{
                showPreview: false
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiInputField;
