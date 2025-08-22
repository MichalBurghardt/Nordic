import React from 'react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  hover?: boolean;
}

export default function ResponsiveCard({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = true
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-4 sm:p-6',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10 lg:p-12'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl'
  };

  const hoverClass = hover ? 'hover:shadow-xl transition-all duration-200' : '';

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg sm:rounded-xl lg:rounded-2xl 
        border border-nordic-light dark:border-nordic-dark 
        ${paddingClasses[padding]} 
        ${shadowClasses[shadow]} 
        ${hoverClass} 
        ${className}
      `}
    >
      {children}
    </div>
  );
}
