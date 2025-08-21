'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminRightPanel from '@/components/AdminRightPanel';

interface User {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Sprawdź autoryzację i pobierz dane użytkownika
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const responseData = await response.json();
          setIsAuthenticated(true);
          setCurrentUser(responseData.user);
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Lade...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router przekieruje do logowania
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-nordic-primary text-white rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Left Sidebar */}
      <AdminSidebar 
        onLogout={handleLogout} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(false)}
        currentUser={currentUser}
      />
      
      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto lg:ml-80 lg:mr-80">
        {children}
      </main>
      
      {/* Right Panel - Fixed position */}
      <div className="hidden lg:block fixed right-0 top-0 w-80 h-screen z-20">
        <AdminRightPanel />
      </div>
    </div>
  );
}
