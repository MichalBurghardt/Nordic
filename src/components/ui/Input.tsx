'use client';

import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-nordic-light';
  
  const variantClasses = {
    default: 'bg-white dark:bg-nordic-dark border-nordic-light focus:border-nordic-primary',
    minimal: 'bg-transparent border-nordic-primary focus:border-nordic-dark'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const errorClasses = error 
    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-200' 
    : '';

  const textColorClasses = 'text-nordic-dark dark:text-nordic-light placeholder-nordic-primary';

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-nordic-dark dark:text-nordic-light"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${textColorClasses} ${className}`}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-nordic-primary">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
