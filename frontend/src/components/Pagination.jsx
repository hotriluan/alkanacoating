import React from 'react';

const Pagination = ({ currentPage, productsPerPage, totalProducts, onPageChange }) => {
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Trước
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            currentPage === page
              ? 'text-white bg-brand-600'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Tiếp
      </button>
    </nav>
  );
};

export default Pagination;
