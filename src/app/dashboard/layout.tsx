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
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Definicja menu items dla dashboard
  const dashboardMenuItems = [
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
    // Sprawdź autoryzację
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
    <div className="min-h-screen bg-gray-100">
      <ResponsiveHeader
        title="Nordic GmbH"
        subtitle="Admin Dashboard"
        menuItems={dashboardMenuItems}
        onLogout={handleLogout}
        theme="admin"
      />

      {/* Content */}
      {children}
    </div>
  );
}
