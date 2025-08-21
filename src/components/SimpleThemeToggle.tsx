'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SimpleThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nordic-theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const currentTheme = savedTheme || systemTheme;
    setTheme(currentTheme);
    setMounted(true);

    // Zastosuj motyw do document.documentElement
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');  
      root.classList.remove('dark');
    }
    
    console.log('Theme applied:', currentTheme, 'Classes:', root.classList.toString());
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('nordic-theme', newTheme);
    
    console.log('Theme toggled to:', newTheme, 'Classes:', root.classList.toString());
  };

  if (!mounted) {
    return <div className="w-9 h-9"></div>; // Placeholder to prevent layout shift
  }

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
