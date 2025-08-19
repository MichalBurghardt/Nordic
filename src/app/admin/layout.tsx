'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';

export default function AdminLayout({
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
      {/* Global Admin Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard">
                <h1 className="text-3xl font-bold text-gray-900 cursor-pointer">Nordic GmbH</h1>
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-indigo-600 font-medium">
                Benutzer
              </Link>
              <Link href="/admin/clients" className="text-gray-600 hover:text-indigo-600 font-medium">
                Kunden
              </Link>
              <Link href="/admin/employees" className="text-gray-600 hover:text-indigo-600 font-medium">
                Mitarbeiter
              </Link>
              <Link href="/admin/assignments" className="text-gray-600 hover:text-indigo-600 font-medium">
                Einsätze
              </Link>
              <Link href="/admin/schedule" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Terminplan
              </Link>
              <Link href="/admin/chat" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </Link>
              <Link href="/admin/audit-logs" className="text-gray-600 hover:text-indigo-600 font-medium">
                Audit Logs
              </Link>
              <Link href="/admin/database" className="text-gray-600 hover:text-indigo-600 font-medium">
                Datenbank
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
