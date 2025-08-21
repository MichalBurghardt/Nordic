'use client';

import { useState, useEffect } from 'react';
import AdminPageContainer from '@/components/AdminPageContainer';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'hr' | 'employee' | 'client';
}

interface DashboardStats {
  totalUsers: number;
  usersByRole: {
    admin: number;
    hr: number;
    employee: number;
    client: number;
  };
  totalClients: number;
  totalEmployees: number;
  totalAssignments: number;
  activeAssignments: number;
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    usersByRole: {
      admin: 0,
      hr: 0,
      employee: 0,
      client: 0
    },
    totalClients: 0,
    totalEmployees: 0,
    totalAssignments: 0,
    activeAssignments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Błąd pobierania użytkownika:', error);
      }
    };

    const getStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Błąd pobierania statystyk:', error);
      }
    };

    const loadData = async () => {
      await Promise.all([getCurrentUser(), getStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AdminPageContainer>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Błąd autoryzacji</h1>
          <p className="text-gray-600">Nie udało się załadować danych użytkownika.</p>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-nordic-light text-nordic-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Użytkownicy</h2>
              <p className="text-2xl font-semibold text-nordic-dark dark:text-nordic-light">{stats.totalUsers}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Admin: {stats.usersByRole.admin} | HR: {stats.usersByRole.hr} | Klienci: {stats.usersByRole.client}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-nordic-light text-nordic-dark">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Klienci</h2>
              <p className="text-2xl font-semibold text-nordic-dark dark:text-nordic-light">{stats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-nordic-primary/20 text-nordic-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pracownicy</h2>
              <p className="text-2xl font-semibold text-nordic-dark dark:text-nordic-light">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-nordic-dark/10 text-nordic-dark dark:bg-nordic-light/20 dark:text-nordic-light">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Zlecenia</h2>
              <p className="text-2xl font-semibold text-nordic-dark dark:text-nordic-light">{stats.totalAssignments}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Aktywne: {stats.activeAssignments}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ostatnie aktywności */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
          <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-4">Ostatnie aktywności</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-nordic-primary rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-nordic-dark dark:text-nordic-light">Nowy użytkownik się zarejestrował</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 godziny temu</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-nordic-dark rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-nordic-dark dark:text-nordic-light">Projekt został ukończony</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">5 godzin temu</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-nordic-light rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-nordic-dark dark:text-nordic-light">Nowe zadanie zostało przypisane</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 dzień temu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
          <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-4">Szybkie akcje</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-nordic-light hover:bg-nordic-primary/20 dark:bg-nordic-dark/20 dark:hover:bg-nordic-primary/30 rounded-lg transition-colors">
              <span className="text-sm font-medium text-nordic-primary dark:text-nordic-light">Dodaj nowego użytkownika</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-nordic-light hover:bg-nordic-primary/20 dark:bg-nordic-dark/20 dark:hover:bg-nordic-primary/30 rounded-lg transition-colors">
              <span className="text-sm font-medium text-nordic-primary dark:text-nordic-light">Utwórz nowy projekt</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-nordic-light hover:bg-nordic-primary/20 dark:bg-nordic-dark/20 dark:hover:bg-nordic-primary/30 rounded-lg transition-colors">
              <span className="text-sm font-medium text-nordic-primary dark:text-nordic-light">Wyświetl raporty</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-nordic-light hover:bg-nordic-primary/20 dark:bg-nordic-dark/20 dark:hover:bg-nordic-primary/30 rounded-lg transition-colors">
              <span className="text-sm font-medium text-nordic-primary dark:text-nordic-light">Zarządzaj ustawieniami</span>
            </button>
          </div>
        </div>
      </div>
    </AdminPageContainer>
  );
}
