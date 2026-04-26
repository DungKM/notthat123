import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="group block">
      <div className="relative h-55 sm:h-65 xl:h-75 overflow-hidden rounded-xl bg-gray-200 animate-pulse">
      </div>
      <div className="mt-5 text-center flex flex-col items-center">
        <div className="h-2 w-16 mb-2 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
        <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded"></div>
        <div className="mt-3 flex justify-center gap-1 opacity-20">
          <span className="w-8 h-0.5 bg-gray-300"></span>
          <span className="w-2 h-0.5 bg-gray-300"></span>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
