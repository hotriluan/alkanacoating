import React, { useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datePickerOverrides.css';

// Utility: format to 'YYYY-MM-DD HH:mm:ss' (local time)
function formatLocal(date) {
  if (!date) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export default function DateTimePickerInline({
  value, // Date | null
  onChange, // (Date|null) => void
  onClear, // () => void
  label = 'Ngày xuất bản'
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const display = useMemo(() => {
    if (!value) return '';
    return new Date(value).toLocaleString('vi-VN');
  }, [value]);

  const handleChange = (d) => {
    onChange?.(d);
    // Auto-close immediately after a selection
    setOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        className="flex items-center"
      >
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={display}
          placeholder="dd/mm/yyyy --:--"
          onClick={() => setOpen(!open)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        />
        <button
          type="button"
          className="ml-2 px-3 py-2 text-sm bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200"
          onClick={() => setOpen((o) => !o)}
        >
          📅
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-[420px]">
          <DatePicker
            selected={value}
            onChange={handleChange}
            showTimeSelect
            timeIntervals={15}
            inline
            timeCaption="Giờ"
            dateFormat="Pp"
            calendarClassName="alkana-datepicker"
            shouldCloseOnSelect
            onClickOutside={() => setOpen(false)}
            className="w-full"
          />
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={() => { onClear?.(); onChange?.(null); setOpen(false); }}
            >
              Xóa
            </button>
            <div className="space-x-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200"
                onClick={() => { onChange?.(new Date()); }}
              >
                Hôm nay
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">Để trống để xuất bản ngay</p>
    </div>
  );
}

export { formatLocal };
