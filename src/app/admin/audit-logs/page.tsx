'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminPageContainer from '@/components/AdminPageContainer';
import { Filter, Eye, User, Activity, ChevronUpIcon, ChevronDownIcon, XIcon } from 'lucide-react';

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
  
  // Filtry
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Sortowanie
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy: sortBy,
        sortOrder: sortOrder,
        limit: '1000' // Wszystkie logi
      });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data || data.auditLogs || []);
      } else {
        setError('Failed to load audit logs');
        setAuditLogs([]);
      }
    } catch {
      setError('Network error');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'stats' }),
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [fetchAuditLogs, fetchStats]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      resource: '',
      userId: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setSortBy('timestamp');
    setSortOrder('desc');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
      <ChevronDownIcon className="w-4 h-4 ml-1" />;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'ACCESS_DENIED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return <User className="w-4 h-4" />;
      case 'CREATE':
      case 'UPDATE':
      case 'DELETE':
        return <Activity className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <AdminPageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light mb-2">Audit Logs</h1>
        <p className="text-gray-600 dark:text-gray-400">Alle Systemaktivitäten und Benutzeraktionen</p>
      </div>

      {/* Stats Cards */}
      {stats && stats.byAction && stats.byResource && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
            <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-2">Top Aktionen</h3>
            <div className="space-y-2">
              {stats.byAction.slice(0, 3).map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item._id}</span>
                  <span className="text-sm font-medium text-nordic-dark dark:text-nordic-light">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
            <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-2">Top Ressourcen</h3>
            <div className="space-y-2">
              {stats.byResource.slice(0, 3).map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item._id}</span>
                  <span className="text-sm font-medium text-nordic-dark dark:text-nordic-light">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6">
            <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-2">Gesamt Aktivitäten</h3>
            <div className="text-2xl font-bold text-nordic-primary">
              {auditLogs.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Einträge geladen</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg hover:bg-nordic-light/50 dark:hover:bg-nordic-dark/50 text-nordic-dark dark:text-nordic-light"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter {hasActiveFilters && <span className="ml-1 bg-nordic-primary text-white text-xs rounded-full px-2 py-1">aktiv</span>}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light"
            >
              Alle Filter zurücksetzen
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                Suche
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Benutzer, Ressource, Details..."
                className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                Aktion
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
              >
                <option value="">Alle Aktionen</option>
                <option value="CREATE">Erstellen</option>
                <option value="UPDATE">Aktualisieren</option>
                <option value="DELETE">Löschen</option>
                <option value="LOGIN">Anmelden</option>
                <option value="LOGOUT">Abmelden</option>
                <option value="REGISTER">Registrieren</option>
                <option value="PASSWORD_RESET">Passwort zurücksetzen</option>
                <option value="ACCESS_DENIED">Zugriff verweigert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                Ressource
              </label>
              <input
                type="text"
                value={filters.resource}
                onChange={(e) => handleFilterChange('resource', e.target.value)}
                placeholder="z.B. User, Client, Employee"
                className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                Von Datum
              </label>
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-dark dark:text-nordic-light mb-1">
                Bis Datum
              </label>
              <input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-nordic-light dark:border-nordic-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-nordic-primary bg-white dark:bg-gray-700 text-nordic-dark dark:text-nordic-light"
              />
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

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-nordic-light/30 dark:border-nordic-dark/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">Alle Audit Logs</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {auditLogs.length > 0 && (
              <span>
                {auditLogs.length} Einträge
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nordic-primary mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Lade Audit Logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Zeitstempel
                      {getSortIcon('timestamp')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('action')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Aktion
                      {getSortIcon('action')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('resource')}
                      className="flex items-center hover:text-nordic-primary"
                    >
                      Ressource
                      {getSortIcon('resource')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nordic-dark dark:text-nordic-light">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-nordic-dark dark:text-nordic-light">
                        {log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'System'}
                      </div>
                      {log.userId && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.userId.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="ml-1">{log.action}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nordic-dark dark:text-nordic-light">
                      {log.resource}
                      {log.resourceId && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {log.resourceId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-nordic-dark dark:text-nordic-light">
                      <div className="max-w-xs truncate">
                        {log.details || 'Keine Details verfügbar'}
                      </div>
                      {log.ipAddress && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-nordic-primary hover:text-nordic-dark dark:hover:text-nordic-light"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {auditLogs.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {hasActiveFilters 
                    ? 'Keine Audit Logs gefunden, die den Filterkriterien entsprechen.'
                    : 'Noch keine Audit Logs vorhanden.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">
                Audit Log Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zeitstempel
                  </label>
                  <p className="text-sm text-nordic-dark dark:text-nordic-light">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Benutzer
                  </label>
                  <p className="text-sm text-nordic-dark dark:text-nordic-light">
                    {selectedLog.userId ? 
                      `${selectedLog.userId.firstName} ${selectedLog.userId.lastName} (${selectedLog.userId.email})` : 
                      'System'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aktion
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)}
                    <span className="ml-1">{selectedLog.action}</span>
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ressource
                  </label>
                  <p className="text-sm text-nordic-dark dark:text-nordic-light">
                    {selectedLog.resource}
                    {selectedLog.resourceId && ` (ID: ${selectedLog.resourceId})`}
                  </p>
                </div>
                
                {selectedLog.ipAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      IP-Adresse
                    </label>
                    <p className="text-sm text-nordic-dark dark:text-nordic-light">
                      {selectedLog.ipAddress}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedLog.details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Details
                  </label>
                  <p className="text-sm text-nordic-dark dark:text-nordic-light bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selectedLog.details}
                  </p>
                </div>
              )}
              
              {selectedLog.changes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Änderungen
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap text-nordic-dark dark:text-nordic-light">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {selectedLog.userAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User Agent
                  </label>
                  <p className="text-sm text-nordic-dark dark:text-nordic-light bg-gray-50 dark:bg-gray-700 p-3 rounded break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPageContainer>
  );
}
