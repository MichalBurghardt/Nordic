'use client';

import { useState } from 'react';

interface DatabaseStatus {
  users: number;
  usersByRole: {
    admin: number;
    hr: number;
    employee: number;
    client: number;
  };
  clients: number;
  employees: number;
  assignments: number;
  total: number;
}

export default function DatabaseAdminPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkDatabase = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/clear-database', {
        method: 'GET',
      });
      
      const data = await response.json();
      if (response.ok) {
        setStatus(data.collections);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to check database');
    } finally {
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    if (!confirm('⚠️ UWAGA: To usunie WSZYSTKIE dane z bazy! Czy na pewno chcesz kontynuować?')) {
      return;
    }
    
    if (!confirm('To jest nieodwracalne! Wpisz "USUŃ" aby potwierdzić:')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/clear-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: 'DELETE_ALL_DATA' }),
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(`Usunięto ${data.deletedDocuments.total} dokumentów`);
        checkDatabase(); // Odśwież status
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to clear database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🗄️ Database Administration
          </h1>
          
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Database Status */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">📊 Database Status</h2>
              
              <button
                onClick={checkDatabase}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Database'}
              </button>

              {status && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Collections:</h3>
                  <ul className="space-y-1">
                    <li>👥 Users: {status.users}</li>
                    <li className="ml-4 text-sm text-gray-600">
                      └ Admin: {status.usersByRole.admin} | HR: {status.usersByRole.hr} | Employees: {status.usersByRole.employee} | Clients: {status.usersByRole.client}
                    </li>
                    <li>🏢 Clients: {status.clients}</li>
                    <li>👷 Employees: {status.employees}</li>
                    <li>📋 Assignments: {status.assignments}</li>
                    <li className="font-bold border-t pt-1">📊 Total: {status.total}</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-red-800">⚠️ Danger Zone</h2>
              
              <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Clear All Data</h3>
                <p className="text-red-700 text-sm mb-4">
                  This will permanently delete ALL data from the database. This action cannot be undone!
                </p>
                
                <button
                  onClick={clearDatabase}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Clearing...' : '🗑️ CLEAR ALL DATA'}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-blue-50 border border-blue-300 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">💡 Alternative Methods</h3>
            <div className="text-blue-700 text-sm space-y-2">
              <p><strong>MongoDB Atlas Dashboard:</strong> Browse Collections → Delete Collection</p>
              <p><strong>MongoDB Compass:</strong> Connect → Select Database → Delete Collections</p>
              <p><strong>MongoDB Shell:</strong> <code className="bg-blue-100 px-1 rounded">db.dropDatabase()</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
