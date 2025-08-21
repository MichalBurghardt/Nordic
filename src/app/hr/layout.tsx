'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  UserPlus, 
  FileText, 
  Calendar, 
  TrendingUp, 
  GraduationCap, 
  FileSpreadsheet, 
  MessageSquare 
} from 'lucide-react';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Definicja menu items dla HR dashboard
  const hrMenuItems = [
    { href: '/hr/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/hr/employees', label: 'Mitarbeiter', icon: Users },
    { href: '/hr/recruitment', label: 'Rekrutierung', icon: UserPlus },
    { href: '/hr/assignments', label: 'Einsätze', icon: FileText },
    { href: '/hr/schedule', label: 'Terminplan', icon: Calendar },
    { href: '/hr/performance', label: 'Leistung', icon: TrendingUp },
    { href: '/hr/training', label: 'Schulungen', icon: GraduationCap },
    { href: '/hr/reports', label: 'Berichte', icon: FileSpreadsheet },
    { href: '/hr/chat', label: 'Chat', icon: MessageSquare },
  ];

  useEffect(() => {
    // Sprawdź autoryzację
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          // Sprawdź czy użytkownik ma rolę admin lub hr
          if (userData.user?.role === 'admin' || userData.user?.role === 'hr') {
            setIsAuthenticated(true);
          } else {
            router.push('/login');
            return;
          }
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nordic-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Lade HR-System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router przekieruje do logowania
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <ResponsiveHeader
        title="Nordic GmbH"
        menuItems={hrMenuItems}
        onLogout={handleLogout}
        theme="hr"
      />

      {/* Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
