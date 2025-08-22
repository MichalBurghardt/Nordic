'use client';

import React from 'react';

interface AdminPageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function AdminPageContainer({ 
  children, 
  className = '',
  maxWidth = 'full',
  padding = 'md'
}: AdminPageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-none',
    full: 'w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4 lg:p-5',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12'
  };

  return (
    <div className={`h-full w-full overflow-y-auto overflow-x-hidden ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]}`}>
        {children}
      </div>
    </div>
  );
}
