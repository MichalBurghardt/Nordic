'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Home, 
  Users, 
  Building2, 
  UserCheck, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Database
} from 'lucide-react';
import ResponsiveHeader from './ResponsiveHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title = "Nordic GmbH", subtitle = "" }: AdminLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Definicja menu items dla admin dashboard
  const adminMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Benutzer', icon: Users },
    { href: '/admin/clients', label: 'Kunden', icon: Building2 },
    { href: '/admin/employees', label: 'Mitarbeiter', icon: UserCheck },
    { href: '/admin/assignments', label: 'Einsätze', icon: Calendar },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/admin/audit-logs', label: 'Audit', icon: FileText },
    { href: '/admin/database', label: 'Datenbank', icon: Database },
  ];

  useEffect(() => {
    // Sprawdź autoryzację przez sprawdzenie czy można pobrać aktualnego użytkownika
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router przekieruje do logowania
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <ResponsiveHeader
        title={title}
        subtitle={subtitle}
        menuItems={adminMenuItems}
        onLogout={handleLogout}
        theme="admin"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
