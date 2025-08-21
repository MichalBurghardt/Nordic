'use client';

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'minimal';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  shadow = true,
  border = true
}) => {
  const baseClasses = 'rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'card',
    accent: 'bg-nordic-light dark:bg-nordic-dark border-nordic-primary',
    minimal: 'bg-transparent'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const shadowClasses = shadow ? 'shadow-sm hover:shadow-md' : '';
  const borderClasses = border && variant !== 'minimal' ? 'border' : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${shadowClasses} ${borderClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
