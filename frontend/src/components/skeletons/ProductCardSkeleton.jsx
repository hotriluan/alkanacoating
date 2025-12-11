import React from 'react';
import Skeleton from '../common/Skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-1/2 h-4 mb-4" />
        <Skeleton className="w-full h-10" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
