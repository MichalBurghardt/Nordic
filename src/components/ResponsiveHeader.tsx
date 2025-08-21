'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import AdvancedThemeToggle from './AdvancedThemeToggle';

interface ResponsiveHeaderProps {
  title: string;
  subtitle?: string;
  menuItems: Array<{
    href: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  onLogout: () => void;
  theme?: 'admin' | 'hr' | 'default';
}

export default function ResponsiveHeader({ 
  title, 
  subtitle, 
  menuItems, 
  onLogout,
  theme = 'default'
}: ResponsiveHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme-specific colors using Nordic palette
  const getThemeColors = () => {
    switch (theme) {
      case 'admin':
        return {
          headerBorder: 'border-b-4 border-nordic-primary',
          hoverColor: 'hover:text-nordic-primary',
          focusRing: 'focus:ring-nordic-primary',
          accentBg: 'bg-nordic-light dark:bg-nordic-primary'
        };
      case 'hr':
        return {
          headerBorder: 'border-b-4 border-nordic-dark',
          hoverColor: 'hover:text-nordic-dark dark:hover:text-nordic-light',
          focusRing: 'focus:ring-nordic-dark',
          accentBg: 'bg-nordic-light dark:bg-nordic-dark'
        };
      default:
        return {
          headerBorder: '',
          hoverColor: 'hover:text-nordic-primary',
          focusRing: 'focus:ring-nordic-primary',
          accentBg: 'bg-nordic-light dark:bg-nordic-primary'
        };
    }
  };

  const themeColors = getThemeColors();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    onLogout();
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`bg-white dark:bg-nordic-dark shadow-lg relative ${themeColors.headerBorder} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          {/* Logo/Title - zawsze widoczne */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-xl md:text-3xl font-bold text-nordic-dark dark:text-nordic-light cursor-pointer">
                {title}
              </h1>
              {subtitle && (
                <span className="ml-2 text-xs md:text-sm text-nordic-primary hidden sm:inline">
                  {subtitle}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation - ukryte na mobile */}
          <nav className="hidden lg:flex lg:space-x-6 items-center">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`text-nordic-primary ${themeColors.hoverColor} font-medium flex items-center gap-2 transition-colors`}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Theme Toggle */}
            <AdvancedThemeToggle />
            
            <button 
              onClick={handleLogout}
              className="bg-nordic-primary text-white px-4 py-2 rounded-lg hover:bg-nordic-dark transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Abmelden</span>
            </button>
          </nav>

          {/* Mobile Menu Button - widoczne tylko na mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <AdvancedThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-md text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light hover:bg-nordic-light dark:hover:bg-nordic-primary focus:outline-none focus:ring-2 ${themeColors.focusRing} transition-colors`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - slidedown */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen 
          ? 'max-h-screen opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 pt-2 pb-4 space-y-2 bg-nordic-light dark:bg-nordic-dark border-t border-nordic-primary">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMenuClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-nordic-dark dark:text-nordic-light ${themeColors.hoverColor} hover:bg-white dark:hover:bg-nordic-primary transition-colors`}
              >
                {IconComponent && <IconComponent className="w-5 h-5" />}
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light hover:bg-white dark:hover:bg-nordic-primary transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Abmelden
          </button>
        </div>
      </div>
    </header>
  );
}
