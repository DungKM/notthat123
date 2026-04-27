import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  containerClassName?: string;
  inactiveButtonClassName?: string;
}

const buildPaginationItems = (currentPage: number, totalPages: number): Array<number | string> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  containerClassName = 'mt-24 flex flex-wrap justify-center items-center gap-2',
  inactiveButtonClassName = 'bg-white text-gray-400 border-gray-200 hover:border-showcase-primary hover:text-showcase-primary',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const items = buildPaginationItems(currentPage, totalPages);

  return (
    <div className={containerClassName}>
      {items.map((item, index) => (
        <button
          key={`${item}-${index}`}
          onClick={() => typeof item === 'number' && onPageChange(item)}
          disabled={typeof item === 'string'}
          className={`w-10 h-10 flex items-center justify-center rounded-md border font-medium transition-all ${item === currentPage
            ? 'bg-showcase-primary text-white border-showcase-primary'
            : typeof item === 'string'
              ? 'bg-transparent border-transparent text-gray-500 cursor-default'
              : inactiveButtonClassName
            }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default PaginationControls;
