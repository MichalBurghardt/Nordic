'use client';

import React from 'react';

interface AdminPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminPageContainer({ children, className = '' }: AdminPageContainerProps) {
  return (
    <div className={`h-full w-full overflow-y-auto overflow-x-hidden ${className}`}>
      <div className="p-4 lg:p-6">
        {children}
      </div>
    </div>
  );
}
