'use client';

import { useState, useEffect } from 'react';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import ResponsiveCard from '../../components/ResponsiveCard';
import ResponsiveButton from '../../components/ResponsiveButton';

interface User {
  name: string;
  role: string;
}

export default function EmployeePage() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // W przyszłości pobierzemy dane użytkownika z API
    setUser({ name: 'Jan Müller', role: 'employee' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <ResponsiveContainer maxWidth="full" padding="md">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light">Nordic GmbH</h1>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Mitarbeiter Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-gray-600 dark:text-gray-300">Willkommen, {user?.name}</span>
              <ResponsiveButton 
                variant="secondary" 
                size="sm"
                onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/')}
              >
                Abmelden
              </ResponsiveButton>
            </div>
          </div>
        </ResponsiveContainer>
      </header>

      <main>
        <ResponsiveContainer maxWidth="2xl" padding="lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-nordic-dark dark:text-nordic-light mb-4">Mitarbeiter Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Hier können Sie Ihre Einsätze und Arbeitszeiten verwalten.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResponsiveCard padding="lg" shadow="lg" hover>
                <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-4">Meine Einsätze</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Aktuelle und geplante Arbeitseinsätze</p>
                <ResponsiveButton variant="primary" size="md" fullWidth>
                  Einsätze anzeigen
                </ResponsiveButton>
              </ResponsiveCard>

              <ResponsiveCard padding="lg" shadow="lg" hover>
                <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-4">Arbeitszeiten</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Zeiterfassung und Stundenzettel</p>
                <ResponsiveButton variant="primary" size="md" fullWidth>
                  Zeit erfassen
                </ResponsiveButton>
              </ResponsiveCard>

              <ResponsiveCard padding="lg" shadow="lg" hover>
                <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-4">Mein Profil</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Persönliche Daten und Qualifikationen</p>
                <ResponsiveButton variant="primary" size="md" fullWidth>
                  Profil bearbeiten
                </ResponsiveButton>
              </ResponsiveCard>
            </div>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  );
}
