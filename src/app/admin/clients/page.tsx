'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminPageContainer from '@/components/AdminPageContainer';
import Link from 'next/link';
import { ChevronUpIcon, ChevronDownIcon, FilterIcon, XIcon } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  nordicClientNumber: string;
  clientReferenceNumber?: string;
  industry: string;
  hourlyRateMultiplier: number;
  address: {
    city: string;
    country: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function ClientsManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Filtry
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sortowanie
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Success messages
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('created') === 'true') {
      setShowSuccess(true);
      setSuccessMessage('Klient został utworzony pomyślnie');
      window.history.replaceState({}, '', '/admin/clients');
      setTimeout(() => setShowSuccess(false), 5000);
    } else if (urlParams.get('updated') === 'true') {
      setShowSuccess(true);
      setSuccessMessage('Klient został zaktualizowany pomyślnie');
      window.history.replaceState({}, '', '/admin/clients');
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: search,
        sortBy: sortBy,
        sortOrder: sortOrder,
        limit: '1000' // Pobierz wszystkich klientów
      });
      
      if (industryFilter) params.append('industry', industryFilter);
      if (statusFilter) params.append('isActive', statusFilter);
      
      const response = await fetch(`/api/clients?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.data);
      } else {
        setError('Failed to load clients');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, industryFilter, statusFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
    setIndustryFilter('');
    setStatusFilter('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
      <ChevronDownIcon className="w-4 h-4 ml-1" />;
  };

  const toggleClientStatus = async (clientId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setClients(prev => prev.map(client => 
          client._id === clientId ? { ...client, isActive: !currentStatus } : client
        ));
      }
    } catch {
      setError('Failed to update client status');
    }
  };

  return (
    <AdminPageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light">Kundenverwaltung</h1>
        <Link 
          href="/admin/clients/create"
          className="bg-nordic-primary text-white px-4 py-2 rounded-lg hover:bg-nordic-dark transition-colors"
        >
          + Neuen Kunden hinzufügen
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

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Kunden suchen (Name, E-Mail, Branche)..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50 text-nordic-dark dark:text-nordic-light"
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Filter
          </button>

          {/* Clear Filters */}
          {(search || industryFilter || statusFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light"
            >
              Zurücksetzen
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                Branche
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
              >
                <option value="">Alle Branchen</option>
                <option value="Healthcare">Gesundheitswesen</option>
                <option value="Manufacturing">Produktion</option>
                <option value="Logistics">Logistik</option>
                <option value="Retail">Einzelhandel</option>
                <option value="Other">Andere</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
              >
                <option value="">Alle Status</option>
                <option value="true">Aktiv</option>
                <option value="false">Inaktiv</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">Alle Kunden</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {clients.length > 0 && (
              <span>
                Insgesamt {clients.length} Kunden
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nordic-primary mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Lade Kunden...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Name
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kontakt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('industry')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Branche
                      {getSortIcon('industry')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Standort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('isActive')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Status
                      {getSortIcon('isActive')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-nordic-dark dark:text-nordic-light">
                          {client.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {client.nordicClientNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-nordic-dark dark:text-nordic-light">
                          {client.contactPerson}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nordic-dark dark:text-nordic-light">
                      {client.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nordic-dark dark:text-nordic-light">
                      {client.address.city}, {client.address.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleClientStatus(client._id, client.isActive)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          client.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}
                      >
                        {client.isActive ? 'Aktiv' : 'Inaktiv'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/clients/${client._id}/edit`}
                        className="text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light mr-4"
                      >
                        Bearbeiten
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clients.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {search || industryFilter || statusFilter 
                    ? 'Keine Kunden gefunden, die den Suchkriterien entsprechen.'
                    : 'Noch keine Kunden erstellt.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminPageContainer>
  );
}
