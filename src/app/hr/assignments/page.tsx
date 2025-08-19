'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Search, Plus, Eye, Edit2 } from 'lucide-react';

interface Assignment {
  _id: string;
  clientId: {
    _id: string;
    name: string;
  };
  employeeId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  position: string;
  startDate: string;
  endDate: string;
  workLocation: string;
  hourlyRate: number;
  maxHours: number;
  description: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AssignmentsManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search, statusFilter]);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/assignments?${params}`);
      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  const handleStatusChange = async (assignmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktywny' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Zakończony' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Anulowany' },
      paused: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Wstrzymany' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800 mr-4">
                ← Zurück zum Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Einsätze Verwaltung</h1>
            </div>
            <button 
              onClick={() => window.location.href = '/admin/assignments/create'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Neuen Einsatz hinzufügen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filtry */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Szukaj po kliencie, pracowniku, pozycji..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Wszystkie statusy</option>
                  <option value="active">Aktywne</option>
                  <option value="completed">Zakończone</option>
                  <option value="paused">Wstrzymane</option>
                  <option value="cancelled">Anulowane</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Alle Einsätze</h3>
            </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie einsätze...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klient & Pozycja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pracownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Okres & Lokalizacja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stawka & Godziny
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {assignment.clientId.name}
                          </div>
                          <div className="text-sm text-gray-600">{assignment.position}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {assignment.employeeId.userId.firstName} {assignment.employeeId.userId.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            {assignment.workLocation}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculateDays(assignment.startDate, assignment.endDate)} dni
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            €{assignment.hourlyRate}/godz
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            max {assignment.maxHours}h
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={assignment.status}
                          onChange={(e) => handleStatusChange(assignment._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="active">Aktywny</option>
                          <option value="completed">Zakończony</option>
                          <option value="paused">Wstrzymany</option>
                          <option value="cancelled">Anulowany</option>
                        </select>
                        <div className="mt-1">
                          {getStatusBadge(assignment.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => window.location.href = `/admin/assignments/${assignment._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Podgląd"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => window.location.href = `/admin/assignments/${assignment._id}/edit`}
                            className="text-green-600 hover:text-green-900"
                            title="Edytuj"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginacja */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Wyświetlanie {((pagination.page - 1) * pagination.limit) + 1} do{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total} wyników
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Poprzednia
                    </button>
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                      {pagination.page} / {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Następna
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </main>
</div>
);
}
