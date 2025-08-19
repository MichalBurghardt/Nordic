'use client';

import { useState, useEffect } from 'react';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      // Clear the URL parameter
      window.history.replaceState({}, '', '/admin/clients');
      setTimeout(() => setShowSuccess(false), 5000);
    } else if (urlParams.get('updated') === 'true') {
      setShowSuccess(true);
      setSuccessMessage('Klient został zaktualizowany pomyślnie');
      window.history.replaceState({}, '', '/admin/clients');
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        search: search,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });
      
      if (industryFilter) params.append('industry', industryFilter);
      if (statusFilter) params.append('isActive', statusFilter);
      
      const response = await fetch(`/api/clients?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError('Failed to load clients');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sortBy, sortOrder, industryFilter, statusFilter]);

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
    setPage(1);
  };

  const toggleClientStatus = async (clientId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchClients();
      } else {
        setError('Failed to update client status');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kundenverwaltung</h1>
        <Link 
          href="/admin/clients/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Neuen Kunden hinzufügen
        </Link>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-green-700 hover:text-green-900"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Szukaj klientów (nazwa, kontakt, email, branża)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FilterIcon className="h-4 w-4" />
              Filtry
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Wyczyść
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branża
                </label>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Wszystkie branże</option>
                  <option value="IT">IT</option>
                  <option value="Gastronomia">Gastronomia</option>
                  <option value="Handel">Handel</option>
                  <option value="Produkcja">Produkcja</option>
                  <option value="Usługi">Usługi</option>
                  <option value="Logistyka">Logistyka</option>
                  <option value="Budownictwo">Budownictwo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Wszystkie</option>
                  <option value="true">Aktywni</option>
                  <option value="false">Nieaktywni</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sortuj według
                </label>
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('_');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="name_asc">Nazwa (A-Z)</option>
                  <option value="name_desc">Nazwa (Z-A)</option>
                  <option value="contactPerson_asc">Kontakt (A-Z)</option>
                  <option value="contactPerson_desc">Kontakt (Z-A)</option>
                  <option value="industry_asc">Branża (A-Z)</option>
                  <option value="industry_desc">Branża (Z-A)</option>
                  <option value="createdAt_desc">Najnowsze</option>
                  <option value="createdAt_asc">Najstarsze</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Alle Kunden</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Lade Kunden...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Firma
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? 
                            <ChevronUpIcon className="h-4 w-4" /> : 
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('nordicClientNumber')}
                    >
                      <div className="flex items-center gap-1">
                        Nordic Nr.
                        {sortBy === 'nordicClientNumber' && (
                          sortOrder === 'asc' ? 
                            <ChevronUpIcon className="h-4 w-4" /> : 
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kunden-Nr.
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('contactPerson')}
                    >
                      <div className="flex items-center gap-1">
                        Ansprechpartner
                        {sortBy === 'contactPerson' && (
                          sortOrder === 'asc' ? 
                            <ChevronUpIcon className="h-4 w-4" /> : 
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontakt
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('industry')}
                    >
                      <div className="flex items-center gap-1">
                        Branche
                        {sortBy === 'industry' && (
                          sortOrder === 'asc' ? 
                            <ChevronUpIcon className="h-4 w-4" /> : 
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Standort
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('hourlyRateMultiplier')}
                    >
                      <div className="flex items-center gap-1">
                        Stundensatz Multiplikator
                        {sortBy === 'hourlyRateMultiplier' && (
                          sortOrder === 'asc' ? 
                            <ChevronUpIcon className="h-4 w-4" /> : 
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-blue-600">{client.nordicClientNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-600">
                          {client.clientReferenceNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.contactPerson}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.email}</div>
                        <div className="text-sm text-gray-500">{client.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.industry}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.address.city}, {client.address.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(client.hourlyRateMultiplier * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Multiplikator: {client.hourlyRateMultiplier}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {client.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/clients/${client._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Bearbeiten
                        </Link>
                        <button
                          onClick={() => toggleClientStatus(client._id, client.isActive)}
                          className={`${
                            client.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {client.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Zurück
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Weiter
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Seite <span className="font-medium">{page}</span> von{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        page === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
