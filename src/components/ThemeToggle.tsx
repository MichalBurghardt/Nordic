'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-nordic-light dark:bg-nordic-primary hover:bg-nordic-primary hover:dark:bg-nordic-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-nordic-primary"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100 text-nordic-dark' 
              : 'opacity-0 rotate-90 scale-75 text-nordic-primary'
          }`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100 text-white' 
              : 'opacity-0 rotate-90 scale-75 text-nordic-dark'
          }`} 
        />
      </div>
    </button>
  );
}
