import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'gold' | 'outline';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm inline-block';
  
  const variants = {
    primary: 'bg-showcase-primary text-white',
    gold: 'bg-showcase-primary text-white',
    outline: 'border border-gray-300 text-gray-600'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
