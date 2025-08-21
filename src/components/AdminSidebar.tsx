'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Building2, 
  UserCheck, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Database,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  currentUser?: {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
  } | null;
}

export default function AdminSidebar({ onLogout, isOpen = true, onToggle, currentUser }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      // On mobile, use parent toggle
      onToggle?.();
    } else {
      // On desktop, use internal collapse
      setIsCollapsed(!isCollapsed);
    }
  };

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Benutzer', icon: Users },
    { href: '/admin/clients', label: 'Kunden', icon: Building2 },
    { href: '/admin/employees', label: 'Mitarbeiter', icon: UserCheck },
    { href: '/admin/assignments', label: 'Einsätze', icon: Calendar },
    { href: '/admin/chat', label: 'Chat', icon: MessageSquare },
    { href: '/admin/audit-logs', label: 'Audit', icon: FileText },
    { href: '/admin/database', label: 'Datenbank', icon: Database },
    { href: '/admin/settings', label: 'Einstellungen', icon: Settings },
  ];

  const isActive = (href: string) => {
    return pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`
        fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-nordic-light/30 dark:border-nordic-dark/30 
        shadow-lg transition-all duration-300 z-40
        ${isCollapsed ? 'w-16' : 'w-80'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-80'}
        ${!isOpen ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
      `}>
      {/* Header */}
      <div className="p-4 border-b border-nordic-light/30 dark:border-nordic-dark/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-nordic-dark dark:text-nordic-light">Nordic GmbH</h1>
              {currentUser && (
                <p className="text-sm text-nordic-primary dark:text-nordic-light font-medium mt-1">
                  Witaj, {currentUser?.firstName}!
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">Admin Panel</p>
            </div>
          )}
          <button
            onClick={handleToggle}
            className="p-1 rounded-lg hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-nordic-primary" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-nordic-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Current User Info */}
      {currentUser && (
        <div className="p-4 border-b border-nordic-light/30 dark:border-nordic-dark/30">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nordic-primary text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-nordic-dark dark:text-nordic-light truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-nordic-primary text-white rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200
                ${active 
                  ? 'bg-nordic-primary text-white' 
                  : 'text-nordic-dark dark:text-nordic-light hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-nordic-light/30 dark:border-nordic-dark/30">
        <button
          onClick={onLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200
            text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Abmelden' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium">Abmelden</span>
          )}
        </button>
      </div>
    </div>
    </>
  );
}
