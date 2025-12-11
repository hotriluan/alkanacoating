import { useState } from 'react';

export default function FooterColumnsBuilder({ value, onChange }) {
  const [columns, setColumns] = useState(() => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : (value || []);
    } catch {
      return [];
    }
  });

  const updateColumns = (newColumns) => {
    setColumns(newColumns);
    onChange(JSON.stringify(newColumns, null, 2));
  };

  const addColumn = () => {
    updateColumns([...columns, { title: 'Cột mới', links: [] }]);
  };

  const removeColumn = (columnIndex) => {
    updateColumns(columns.filter((_, i) => i !== columnIndex));
  };

  const updateColumn = (columnIndex, field, newValue) => {
    const newColumns = [...columns];
    newColumns[columnIndex][field] = newValue;
    updateColumns(newColumns);
  };

  const addLink = (columnIndex) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links.push({ label: 'Link mới', url: '/' });
    updateColumns(newColumns);
  };

  const removeLink = (columnIndex, linkIndex) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex);
    updateColumns(newColumns);
  };

  const updateLink = (columnIndex, linkIndex, field, newValue) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links[linkIndex][field] = newValue;
    updateColumns(newColumns);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">🦶 Quản lý cột Footer</h3>
        <button
          type="button"
          onClick={addColumn}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          + Thêm cột
        </button>
      </div>

      <div className="space-y-4">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                value={column.title || ''}
                onChange={(e) => updateColumn(columnIndex, 'title', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent font-bold"
                placeholder="Tiêu đề cột"
              />
              <button
                type="button"
                onClick={() => addLink(columnIndex)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                + Link
              </button>
              <button
                type="button"
                onClick={() => removeColumn(columnIndex)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Xóa cột"
              >
                🗑️
              </button>
            </div>

            <div className="space-y-2 ml-4">
              {column.links && column.links.map((link, linkIndex) => (
                <div key={linkIndex} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => updateLink(columnIndex, linkIndex, 'label', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                      placeholder="Tên link"
                    />
                    <input
                      type="text"
                      value={link.url || ''}
                      onChange={(e) => updateLink(columnIndex, linkIndex, 'url', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm font-mono"
                      placeholder="/duong-dan"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(columnIndex, linkIndex)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors text-sm"
                    title="Xóa link"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {(!column.links || column.links.length === 0) && (
                <p className="text-xs text-gray-400 italic py-2">Chưa có link nào. Click "+ Link" để thêm.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {columns.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>Chưa có cột nào. Click "Thêm cột" để bắt đầu.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-800 mb-2">👁️ Xem trước Footer:</p>
        <div className="bg-white rounded-lg p-6 grid grid-cols-3 gap-6">
          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{column.title}</h3>
              <ul className="space-y-1">
                {column.links && column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.url} className="text-xs text-gray-600 hover:text-brand-600">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
