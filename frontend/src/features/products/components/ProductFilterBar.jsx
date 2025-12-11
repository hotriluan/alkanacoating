import { useEffect, useState } from 'react';

export default function ProductFilterBar({ categories, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between animate-in fade-in duration-700">
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
        />
      </div>
      <div className="md:w-64">
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
