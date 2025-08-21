'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-nordic-light';
  
  const variantClasses = {
    primary: 'btn-primary text-white',
    secondary: 'bg-nordic-light text-nordic-dark hover:bg-nordic-primary hover:text-white border border-nordic-primary',
    outline: 'bg-transparent text-nordic-primary border border-nordic-primary hover:bg-nordic-primary hover:text-white',
    ghost: 'bg-transparent text-nordic-primary hover:bg-nordic-light'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';

  const iconClasses = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={`${iconClasses} ${children ? 'mr-2' : ''}`} />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className={`${iconClasses} ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  );
};

export default Button;
