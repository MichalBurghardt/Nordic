import React from 'react';

interface ResponsiveInputProps {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  label?: string;
  error?: string;
  helpText?: string;
}

export default function ResponsiveInput({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  label,
  error,
  helpText
}: ResponsiveInputProps) {
  const inputClasses = `
    w-full 
    px-3 py-2 sm:px-4 sm:py-2.5 
    text-sm sm:text-base 
    border rounded-md 
    bg-white dark:bg-gray-700 
    text-nordic-dark dark:text-nordic-light 
    placeholder-gray-500 dark:placeholder-gray-400 
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-nordic-primary focus:border-nordic-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
      : 'border-nordic-light dark:border-nordic-dark'
    }
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1 sm:mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={inputClasses}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
}
