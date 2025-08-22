'use client';

import { useState, useEffect } from 'react';
import AdminPageContainer from '@/components/AdminPageContainer';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import ResponsiveCard from '@/components/ResponsiveCard';
import ResponsiveButton from '@/components/ResponsiveButton';
import ResponsiveInput from '@/components/ResponsiveInput';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  X
} from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Check for success message from URL params
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('created') === 'true') {
      setShowSuccess(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', '/admin/users');
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } else if (urlParams.get('deleted') === 'true') {
      setShowSuccess(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', '/admin/users');
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
        limit: '1000', // Pobierz wszystkich użytkowników
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError('Failed to load users');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, sortOrder, roleFilter, statusFilter]);

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
    setRoleFilter('');
    setStatusFilter('');
    setSortBy('lastName');
    setSortOrder('asc');
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <AdminPageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light">Benutzerverwaltung</h1>
        <Link 
          href="/admin/users/create"
          className="bg-nordic-primary text-white px-4 py-2 rounded-lg hover:bg-nordic-dark transition-colors"
        >
          + Neuen Benutzer hinzufügen
        </Link>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-6 relative">
          <span className="block sm:inline">
            {new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('deleted') === 'true' 
              ? 'Benutzer wurde erfolgreich gelöscht!' 
              : 'Benutzer wurde erfolgreich erstellt!'
            }
          </span>
          <button
            onClick={() => setShowSuccess(false)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search bar */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Benutzer suchen (Nachname, Vorname, E-Mail)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50 transition-colors text-nordic-dark dark:text-nordic-light"
            >
              <Filter className="w-4 h-4" />
              Filter
              {(roleFilter || statusFilter) && (
                <span className="bg-nordic-light text-nordic-primary dark:bg-nordic-dark dark:text-nordic-light text-xs px-2 py-1 rounded-full">
                  {[roleFilter, statusFilter].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Clear filters */}
            {(search || roleFilter || statusFilter || sortBy !== 'lastName' || sortOrder !== 'asc') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-nordic-dark dark:hover:text-nordic-light transition-colors"
              >
                <X className="w-4 h-4" />
                Zurücksetzen
              </button>
            )}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Role filter */}
                <div>
                  <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-2">
                    Rolle
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
                  >
                    <option value="">Alle Rollen</option>
                    <option value="admin">Administrator</option>
                    <option value="hr">HR Manager</option>
                    <option value="employee">Mitarbeiter</option>
                    <option value="client">Kunde</option>
                  </select>
                </div>

                {/* Status filter */}
                <div>
                  <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
                  >
                    <option value="">Alle Status</option>
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                  </select>
                </div>

                {/* Sort options */}
                <div>
                  <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-2">
                    Sortierung
                  </label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
                  >
                    <option value="lastName-asc">Nachname (A-Z)</option>
                    <option value="lastName-desc">Nachname (Z-A)</option>
                    <option value="firstName-asc">Vorname (A-Z)</option>
                    <option value="firstName-desc">Vorname (Z-A)</option>
                    <option value="email-asc">E-Mail (A-Z)</option>
                    <option value="email-desc">E-Mail (Z-A)</option>
                    <option value="role-asc">Rolle (A-Z)</option>
                    <option value="role-desc">Rolle (Z-A)</option>
                    <option value="createdAt-desc">Neueste zuerst</option>
                    <option value="createdAt-asc">Älteste zuerst</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">Alle Benutzer</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {users.length > 0 && (
                <span>
                  Insgesamt {users.length} Benutzer
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nordic-primary mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Lade Benutzer...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('lastName')}
                    >
                      <div className="flex items-center gap-2">
                        Name (Nachname, Vorname)
                        {getSortIcon('lastName')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        E-Mail
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-2">
                        Rolle
                        {getSortIcon('role')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Erstellt
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-nordic-dark dark:text-nordic-light">
                          {user.lastName}, {user.firstName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-nordic-dark dark:text-nordic-light">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-nordic-dark/10 text-nordic-dark dark:bg-nordic-light/20 dark:text-nordic-light' :
                          user.role === 'hr' ? 'bg-nordic-primary/10 text-nordic-primary dark:bg-nordic-primary/20 dark:text-nordic-primary' :
                          user.role === 'client' ? 'bg-nordic-light text-nordic-dark dark:bg-nordic-dark/50 dark:text-nordic-light' :
                          'bg-nordic-primary/20 text-nordic-dark dark:bg-nordic-primary/30 dark:text-nordic-light'
                        }`}>
                          {user.role === 'admin' ? 'Administrator' :
                           user.role === 'hr' ? 'HR Manager' :
                           user.role === 'client' ? 'Kunde' : 'Mitarbeiter'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }`}>
                          {user.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/users/${user._id}/edit`}
                          className="text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light"
                        >
                          Bearbeiten
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Active filters summary */}
          {(search || roleFilter || statusFilter || sortBy !== 'lastName' || sortOrder !== 'asc') && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Aktive Filter:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-nordic-light text-nordic-dark dark:bg-nordic-dark/50 dark:text-nordic-light text-xs rounded-full">
                    Suche: &ldquo;{search}&rdquo;
                    <button onClick={() => setSearch('')} className="hover:bg-nordic-primary/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {roleFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-nordic-primary/20 text-nordic-primary dark:bg-nordic-primary/30 dark:text-nordic-light text-xs rounded-full">
                    Rolle: {roleFilter === 'admin' ? 'Administrator' : 
                            roleFilter === 'hr' ? 'HR Manager' : 
                            roleFilter === 'client' ? 'Kunde' : 'Mitarbeiter'}
                    <button onClick={() => setRoleFilter('')} className="hover:bg-nordic-primary/30 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-nordic-dark/10 text-nordic-dark dark:bg-nordic-light/20 dark:text-nordic-light text-xs rounded-full">
                    Status: {statusFilter === 'active' ? 'Aktiv' : 'Inaktiv'}
                    <button onClick={() => setStatusFilter('')} className="hover:bg-nordic-dark/20 dark:hover:bg-nordic-light/30 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(sortBy !== 'lastName' || sortOrder !== 'asc') && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-nordic-primary/10 text-nordic-primary dark:bg-nordic-primary/20 dark:text-nordic-light text-xs rounded-full">
                    Sortiert: {sortBy} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                    <button onClick={() => { setSortBy('lastName'); setSortOrder('asc'); }} className="hover:bg-nordic-primary/20 dark:hover:bg-nordic-primary/30 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
    </AdminPageContainer>
  );
}
