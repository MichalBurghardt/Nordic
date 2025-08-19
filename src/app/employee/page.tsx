'use client';

import { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Nordic GmbH</h1>
              <span className="ml-2 text-sm text-gray-500">Mitarbeiter Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Willkommen, {user?.name}</span>
              <button 
                onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mitarbeiter Dashboard</h2>
          <p className="text-gray-600 mb-8">Hier können Sie Ihre Einsätze und Arbeitszeiten verwalten.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meine Einsätze</h3>
              <p className="text-gray-600 mb-4">Aktuelle und geplante Arbeitseinsätze</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Einsätze anzeigen
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Arbeitszeiten</h3>
              <p className="text-gray-600 mb-4">Zeiterfassung und Stundenzettel</p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Zeit erfassen
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mein Profil</h3>
              <p className="text-gray-600 mb-4">Persönliche Daten und Qualifikationen</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Profil bearbeiten
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
