'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminPageContainer from '@/components/AdminPageContainer';
import Link from 'next/link';
import { ChevronUpIcon, ChevronDownIcon, XIcon } from 'lucide-react';

interface Employee {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  employeeId: string;
  skills: string[];
  qualifications: string[];
  hourlyRate: number;
  status: string;
  createdAt: string;
}

export default function EmployeesManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Sortowanie
  const [sortBy, setSortBy] = useState('userId.lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Success messages
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('created') === 'true') {
      setShowSuccess(true);
      setSuccessMessage('Mitarbeiter wurde erfolgreich erstellt');
      window.history.replaceState({}, '', '/admin/employees');
      setTimeout(() => setShowSuccess(false), 5000);
    } else if (urlParams.get('updated') === 'true') {
      setShowSuccess(true);
      setSuccessMessage('Mitarbeiter wurde erfolgreich aktualisiert');
      window.history.replaceState({}, '', '/admin/employees');
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: search,
        sortBy: sortBy,
        sortOrder: sortOrder,
        limit: '1000' // Alle Mitarbeiter laden
      });
      
      const response = await fetch(`/api/admin/employees?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
      } else {
        setError('Failed to load employees');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSortBy('userId.lastName');
    setSortOrder('asc');
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
      <ChevronDownIcon className="w-4 h-4 ml-1" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Inaktiv';
      case 'pending':
        return 'Ausstehend';
      default:
        return status;
    }
  };

  return (
    <AdminPageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light">Mitarbeiterverwaltung</h1>
        <Link 
          href="/admin/employees/create"
          className="bg-nordic-primary text-white px-4 py-2 rounded-lg hover:bg-nordic-dark transition-colors"
        >
          + Neuen Mitarbeiter hinzufügen
        </Link>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-6 relative">
          <span className="block sm:inline">{successMessage}</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Mitarbeiter suchen (Name, E-Mail, ID)..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
            />
          </div>

          {search && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">Alle Mitarbeiter</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {employees.length > 0 && (
              <span>
                Insgesamt {employees.length} Mitarbeiter
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nordic-primary mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Lade Mitarbeiter...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('userId.lastName')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Name
                      {getSortIcon('userId.lastName')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('employeeId')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Mitarbeiter-ID
                      {getSortIcon('employeeId')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('hourlyRate')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Stundenlohn
                      {getSortIcon('hourlyRate')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Status
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Qualifikationen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-nordic-dark dark:text-nordic-light">
                        {employee.userId.firstName} {employee.userId.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nordic-dark dark:text-nordic-light">
                      {employee.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {employee.userId.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nordic-dark dark:text-nordic-light">
                      €{employee.hourlyRate}/h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {getStatusText(employee.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-nordic-dark dark:text-nordic-light">
                      <div className="max-w-xs">
                        {employee.qualifications.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {employee.qualifications.slice(0, 2).map((qual, index) => (
                              <span key={index} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                {qual}
                              </span>
                            ))}
                            {employee.qualifications.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{employee.qualifications.length - 2} weitere
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-xs">Keine</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/employees/${employee._id}/edit`}
                        className="text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light"
                      >
                        Bearbeiten
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {employees.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {search 
                    ? 'Keine Mitarbeiter gefunden, die den Suchkriterien entsprechen.'
                    : 'Noch keine Mitarbeiter erstellt.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminPageContainer>
  );
}
