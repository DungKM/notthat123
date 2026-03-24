import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  image,
  children,
  footer,
  className = '',
  hoverable = true
}) => {
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100  ${hoverable ? 'cursor-pointer' : ''} ${className}`}>
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover " />
        </div>
      )}
      <div className="p-5">
        {subtitle && <p className="text-showcase-primary text-xs font-semibold uppercase mb-2">{subtitle}</p>}
        {title && <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>}
        {children}
        {footer && <div className="mt-6 pt-4 border-t border-gray-100">{footer}</div>}
      </div>
    </div>
  );
};

export default Card;
