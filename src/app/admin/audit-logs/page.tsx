'use client';

import { useState, useEffect } from 'react';
import { Filter, Eye, User, Activity } from 'lucide-react';

interface AuditLog {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_RESET' | 'EMAIL_VERIFY' | 'ACCESS_DENIED' | 'SYSTEM_ACTION';
  resource: string;
  resourceId?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    field?: string;
    details?: Record<string, { before: unknown; after: unknown }>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: string;
}

interface AuditStats {
  byAction: { _id: string; count: number }[];
  byResource: { _id: string; count: number }[];
  daily: { _id: string; count: number }[];
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Paginacja
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(50);
  
  // Filtry
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Audit logs response:', data);
        setAuditLogs(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        const errorData = await response.json();
        console.error('Audit logs error:', errorData);
        setError(errorData.error || 'Nie udało się załadować audit logs');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ type: 'stats' })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Stats response:', data);
        setStats(data.stats);
      } else {
        const errorData = await response.json();
        console.error('Stats error:', errorData);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const createTestAudits = async () => {
    try {
      const response = await fetch('/api/admin/create-test-audits', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}`);
        // Odśwież listę audit logów
        fetchAuditLogs();
      } else {
        const errorData = await response.json();
        alert(`❌ Błąd: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating test audits:', error);
      alert('❌ Błąd podczas tworzenia testowych audit logów');
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset do pierwszej strony przy zmianie filtrów
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      case 'REGISTER': return 'bg-emerald-100 text-emerald-800';
      case 'PASSWORD_RESET': return 'bg-orange-100 text-orange-800';
      case 'EMAIL_VERIFY': return 'bg-cyan-100 text-cyan-800';
      case 'ACCESS_DENIED': return 'bg-rose-100 text-rose-800';
      case 'SYSTEM_ACTION': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={createTestAudits}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Test Audits
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtry
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statystyki */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Akcje (30 dni)</h3>
              <div className="space-y-2">
                {stats.byAction.map(item => (
                  <div key={item._id} className="flex justify-between">
                    <span className={`px-2 py-1 rounded text-xs ${getActionColor(item._id)}`}>
                      {item._id}
                    </span>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zasoby (30 dni)</h3>
              <div className="space-y-2">
                {stats.byResource.slice(0, 5).map(item => (
                  <div key={item._id} className="flex justify-between">
                    <span className="text-gray-700">{item._id}</span>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktywność dzienna</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {stats.daily.slice(-7).map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item._id}</span>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filtry */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Akcja
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Wszystkie</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="LOGOUT">LOGOUT</option>
                  <option value="REGISTER">REGISTER</option>
                  <option value="PASSWORD_RESET">PASSWORD_RESET</option>
                  <option value="EMAIL_VERIFY">EMAIL_VERIFY</option>
                  <option value="ACCESS_DENIED">ACCESS_DENIED</option>
                  <option value="SYSTEM_ACTION">SYSTEM_ACTION</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zasób
                </label>
                <select
                  value={filters.resource}
                  onChange={(e) => handleFilterChange('resource', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Wszystkie</option>
                  <option value="User">User</option>
                  <option value="Client">Client</option>
                  <option value="Employee">Employee</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Schedule">Schedule</option>
                  <option value="Message">Message</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data od
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ action: '', resource: '', userId: '', dateFrom: '', dateTo: '' });
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Wyczyść
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tabela audit logs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Historia aktywności ({auditLogs.length} z {totalPages > 0 ? (totalPages - 1) * limit + auditLogs.length : 0})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Ładowanie audit logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Czas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Użytkownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zasób
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Szczegóły
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.userId.firstName} {log.userId.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{log.userId.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-900">
                        {log.details || 'Brak szczegółów'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Zobacz
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginacja */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Strona {page} z {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Następna
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal szczegółów */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Szczegóły audit log</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Czas</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Akcja</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Użytkownik</label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.userId.firstName} {selectedLog.userId.lastName} ({selectedLog.userId.email})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rola</label>
                  <p className="text-sm text-gray-900">{selectedLog.userId.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zasób</label>
                  <p className="text-sm text-gray-900">{selectedLog.resource}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID zasobu</label>
                  <p className="text-sm text-gray-900">{selectedLog.resourceId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adres IP</label>
                  <p className="text-sm text-gray-900">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="text-sm text-gray-900 truncate">{selectedLog.userAgent || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Szczegóły</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  {selectedLog.details || 'Brak szczegółów'}
                </p>
              </div>

              {selectedLog.changes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zmiany</label>
                  <div className="bg-gray-50 p-3 rounded">
                    {selectedLog.changes.details ? (
                      // Nowy format - tylko zmienione pola
                      <div className="space-y-3">
                        {Object.entries(selectedLog.changes.details).map(([field, change]) => (
                          <div key={field} className="border-l-4 border-blue-500 pl-3">
                            <div className="font-medium text-gray-900 mb-1">
                              Pole: <span className="text-blue-600">{field}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="text-sm font-medium text-red-700 mb-1">Przed:</div>
                                <div className="text-sm bg-red-50 p-2 rounded border border-red-200">
                                  {change.before === null ? (
                                    <span className="text-gray-500 italic">null</span>
                                  ) : typeof change.before === 'object' ? (
                                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                      {JSON.stringify(change.before, null, 2)}
                                    </pre>
                                  ) : (
                                    <span className="text-gray-900">{String(change.before)}</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-green-700 mb-1">Po:</div>
                                <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                                  {change.after === null ? (
                                    <span className="text-gray-500 italic">null</span>
                                  ) : typeof change.after === 'object' ? (
                                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                      {JSON.stringify(change.after, null, 2)}
                                    </pre>
                                  ) : (
                                    <span className="text-gray-900">{String(change.after)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Stary format - całe obiekty
                      <>
                        {selectedLog.changes.before && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-red-700 mb-1">Przed:</h4>
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-red-50 p-2 rounded border border-red-200 max-h-40 overflow-y-auto">
                              {JSON.stringify(selectedLog.changes.before, null, 2)}
                            </pre>
                          </div>
                        )}
                        {selectedLog.changes.after && (
                          <div>
                            <h4 className="text-sm font-medium text-green-700 mb-1">Po:</h4>
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-green-50 p-2 rounded border border-green-200 max-h-40 overflow-y-auto">
                              {JSON.stringify(selectedLog.changes.after, null, 2)}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
