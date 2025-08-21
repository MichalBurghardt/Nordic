'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function AdvancedThemeToggle() {
  // Próbuj użyć kontekstu, ale miej fallback
  let contextTheme = null;
  let contextToggleTheme = null;
  
  try {
    const context = useTheme();
    contextTheme = context.theme;
    contextToggleTheme = context.toggleTheme;
  } catch {
    // Kontekst nie jest dostępny
  }

  // Fallback state dla komponentów bez kontekstu
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Użyj kontekstu jeśli dostępny, w przeciwnym razie lokalny state
  const theme = contextTheme || localTheme;

  useEffect(() => {
    if (!contextTheme) {
      // Tylko jeśli nie ma kontekstu, zarządzaj lokalnie
      const savedTheme = localStorage.getItem('nordic-theme') as 'light' | 'dark' | null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      
      const currentTheme = savedTheme || systemTheme;
      setLocalTheme(currentTheme);
      
      // Zastosuj motyw do HTML
      const root = document.documentElement;
      if (currentTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');  
        root.classList.remove('dark');
      }
    }
    setMounted(true);
  }, [contextTheme]);

  const toggleTheme = () => {
    if (contextToggleTheme) {
      // Użyj funkcji z kontekstu
      contextToggleTheme();
    } else {
      // Lokalny toggle
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setLocalTheme(newTheme);
      
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      localStorage.setItem('nordic-theme', newTheme);
    }
  };

  if (!mounted) {
    return <div className="w-16 h-10"></div>; // Placeholder
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 h-10 flex items-center justify-center rounded-lg bg-nordic-primary text-white hover:bg-nordic-dark dark:bg-nordic-primary dark:text-nordic-dark dark:hover:bg-nordic-light transition-all duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Sun className="w-5 h-5 text-white dark:text-nordic-dark transition-colors duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-white dark:text-nordic-dark transition-colors duration-200" />
      )}
    </button>
  );
}
