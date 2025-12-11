import React from 'react';

const PageSkeleton = () => {
  return (
    <div>
      {/* Hero Section Skeleton */}
      <div className="relative py-20 px-4 animate-pulse bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>

          {/* Category Info Skeleton */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full shadow-lg"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Subcategories Skeleton */}
        <div className="mb-12 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group bg-white rounded-lg shadow-md p-4 h-24 flex flex-col items-center justify-center">
                <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
