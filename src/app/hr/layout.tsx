'use client';

import Link from 'next/link';
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

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade HR-System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router przekieruje do logowania
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Global HR Header */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/hr/dashboard">
                <h1 className="text-3xl font-bold text-gray-900 cursor-pointer">Nordic GmbH</h1>
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link href="/hr/dashboard" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/hr/employees" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mitarbeiter
              </Link>
              <Link href="/hr/recruitment" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Rekrutierung
              </Link>
              <Link href="/hr/assignments" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Einsätze
              </Link>
              <Link href="/hr/schedule" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Terminplan
              </Link>
              <Link href="/hr/performance" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Leistung
              </Link>
              <Link href="/hr/training" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Schulungen
              </Link>
              <Link href="/hr/reports" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Berichte
              </Link>
              <Link href="/hr/chat" className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Abmelden
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
