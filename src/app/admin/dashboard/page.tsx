'use client';

import { useState, useEffect } from 'react';
import AdminPageContainer from '@/components/AdminPageContainer';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import ResponsiveCard from '@/components/ResponsiveCard';
import ResponsiveButton from '@/components/ResponsiveButton';
import { Users, Building2, UserCheck, Calendar } from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'client';
}

interface DashboardStats {
  totalUsers: number;
  usersByRole: {
    admin: number;
    hr: number;
    manager: number;
    employee: number;
    client: number;
  };
  totalClients: number;
  totalEmployees: number;
  totalAssignments: number;
  activeAssignments: number;
}

interface AuditLog {
  _id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_RESET' | 'EMAIL_VERIFY' | 'ACCESS_DENIED' | 'SYSTEM_ACTION';
  resource: string;
  resourceId?: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    field?: string;
    details?: Record<string, { before: unknown; after: unknown }>;
  };
  timestamp: string;
  details?: string;
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    usersByRole: {
      admin: 0,
      hr: 0,
      manager: 0,
      employee: 0,
      client: 0
    },
    totalClients: 0,
    totalEmployees: 0,
    totalAssignments: 0,
    activeAssignments: 0
  });
  const [recentActivities, setRecentActivities] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Błąd pobierania użytkownika:', error);
      }
    };

    const getStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Błąd pobierania statystyk:', error);
      }
    };

    const loadData = async () => {
      await Promise.all([getCurrentUser(), getStats(), getRecentActivities()]);
      setLoading(false);
    };

    const getRecentActivities = async () => {
      try {
        // Pobieramy 50 najnowszych logów dla karuzeli
        const params = new URLSearchParams({
          limit: '50',
          page: '1'
        });
        
        console.log('Fetching audit logs...');
        const response = await fetch(`/api/admin/audit-logs?${params}`, {
          credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Audit logs data:', data);
          // Pokazujemy wszystkie logi (również LOGIN/LOGOUT, ale różnie je wyróżniamy)
          setRecentActivities(data.data || []);
        } else {
          const errorData = await response.text();
          console.error('Failed to fetch audit logs:', response.status, errorData);
        }
      } catch (error) {
        console.error('Failed to load recent activities:', error);
      }
    };

    loadData();
  }, []);

  const openLogModal = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeLogModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 dark:text-green-400';
      case 'UPDATE': return 'text-blue-600 dark:text-blue-400';
      case 'DELETE': return 'text-red-600 dark:text-red-400';
      case 'LOGIN': return 'text-nordic-primary dark:text-nordic-light';
      case 'LOGOUT': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AdminPageContainer>
        <ResponsiveContainer maxWidth="md" padding="lg">
          <ResponsiveCard padding="lg" shadow="lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Autorisierungsfehler</h1>
              <p className="text-gray-600 dark:text-gray-300">Benutzerdaten konnten nicht geladen werden.</p>
            </div>
          </ResponsiveCard>
        </ResponsiveContainer>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer maxWidth="full" padding="lg">
      <ResponsiveContainer maxWidth="full" padding="none">
        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 mb-6 xl:mb-8">
          <ResponsiveCard padding="md" shadow="lg" hover>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-nordic-light text-nordic-primary mb-3">
                <Users className="w-6 h-6" />
              </div>
              <div className="w-full">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">Benutzer</h2>
                <p className="text-2xl font-semibold text-nordic-dark dark:text-nordic-light mb-3 text-center">{stats.totalUsers}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="text-center">
                    <span className="whitespace-nowrap">Admin: </span>
                    <span className="font-medium">{stats.usersByRole.admin}</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">HR: </span>
                    <span className="font-medium">{stats.usersByRole.hr}</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Manager: </span>
                    <span className="font-medium">{stats.usersByRole.manager}</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Kunden: </span>
                    <span className="font-medium">{stats.usersByRole.client}</span>
                  </div>
                  <div className="text-center border-t pt-1 mt-2">
                    <span className="whitespace-nowrap">Aktiv: </span>
                    <span className="font-medium text-green-600">{stats.totalUsers - 2}</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Inaktiv: </span>
                    <span className="font-medium text-red-500">2</span>
                  </div>
                </div>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard padding="md" shadow="lg" hover>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-nordic-light text-nordic-primary mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="w-full">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">Kunden</h2>
                <p className="text-2xl font-semibold text-nordic-dark dark:text-nordic-light mb-3 text-center">{stats.totalClients}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="text-center">
                    <span className="whitespace-nowrap">Groß: </span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Mittel: </span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Klein: </span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="text-center border-t pt-1 mt-2">
                    <span className="whitespace-nowrap">Premium: </span>
                    <span className="font-medium text-yellow-600">15</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Standard: </span>
                    <span className="font-medium">15</span>
                  </div>
                </div>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard padding="md" shadow="lg" hover>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-nordic-light text-nordic-primary mb-3">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="w-full">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">Mitarbeiter</h2>
                <p className="text-2xl font-semibold text-nordic-dark dark:text-nordic-light mb-3 text-center">{stats.totalEmployees}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="text-center">
                    <span className="whitespace-nowrap">Vollzeit: </span>
                    <span className="font-medium">145</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Teilzeit: </span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Freelancer: </span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="text-center border-t pt-1 mt-2">
                    <span className="whitespace-nowrap">Verfügbar: </span>
                    <span className="font-medium text-green-600">156</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Im Einsatz: </span>
                    <span className="font-medium text-blue-600">27</span>
                  </div>
                </div>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard padding="md" shadow="lg" hover>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-nordic-light text-nordic-primary mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="w-full">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">Einsätze</h2>
                <p className="text-2xl font-semibold text-nordic-dark dark:text-nordic-light mb-3 text-center">{stats.totalAssignments}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="text-center">
                    <span className="whitespace-nowrap">Heute: </span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Diese Woche: </span>
                    <span className="font-medium">47</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Diesen Monat: </span>
                    <span className="font-medium">93</span>
                  </div>
                  <div className="text-center border-t pt-1 mt-2">
                    <span className="whitespace-nowrap">Geplant: </span>
                    <span className="font-medium text-blue-600">{stats.activeAssignments}</span>
                  </div>
                  <div className="text-center">
                    <span className="whitespace-nowrap">Abgeschlossen: </span>
                    <span className="font-medium text-green-600">19</span>
                  </div>
                </div>
              </div>
            </div>
          </ResponsiveCard>
        </div>

        {/* Letzte Aktivitäten */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <ResponsiveCard padding="lg" shadow="lg">
            <h3 className="text-base lg:text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-3 lg:mb-4">
              Audit ({recentActivities.length} logs)
            </h3>
            <div className="relative h-64 overflow-hidden bg-nordic-light/10 dark:bg-nordic-dark/10 rounded-lg border border-nordic-light dark:border-nordic-dark">
              {recentActivities.length > 0 ? (
                <div className="absolute inset-0">
                  <div 
                    className="space-y-2 p-2 animate-scroll-up"
                    style={{
                      height: 'auto',
                      minHeight: '200%'
                    }}
                  >
                    {/* Duplikujemy logi dla seamless loop */}
                    {[...recentActivities.slice(0, 15), ...recentActivities.slice(0, 15)].map((activity, index) => {
                      const getActionColor = (action: string) => {
                        switch (action) {
                          case 'CREATE': return 'bg-green-500 shadow-green-500/50';
                          case 'UPDATE': return 'bg-nordic-primary shadow-nordic-primary/50';
                          case 'DELETE': return 'bg-red-500 shadow-red-500/50';
                          case 'LOGIN': return 'bg-nordic-light shadow-nordic-light/50';
                          case 'LOGOUT': return 'bg-gray-400 shadow-gray-400/50';
                          default: return 'bg-nordic-dark shadow-nordic-dark/50';
                        }
                      };

                      const isDataChange = ['CREATE', 'UPDATE', 'DELETE'].includes(activity.action);

                      const getActionText = (action: string, resource: string) => {
                        const resourceNames: Record<string, string> = {
                          'Client': 'Kunde',
                          'Employee': 'Mitarbeiter',
                          'Assignment': 'Einsatz',
                          'User': 'Benutzer',
                          'Schedule': 'Terminplan',
                          'Project': 'Projekt'
                        };

                        const resourceName = resourceNames[resource] || resource;
                        
                        switch (action) {
                          case 'CREATE': return `Neuer ${resourceName} erstellt`;
                          case 'UPDATE': return `${resourceName} aktualisiert`;
                          case 'DELETE': return `${resourceName} gelöscht`;
                          case 'LOGIN': return `Benutzer angemeldet`;
                          case 'LOGOUT': return `Benutzer abgemeldet`;
                          case 'REGISTER': return `Neue Registrierung`;
                          default: return `${resourceName} ${action}`;
                        }
                      };

                      const getTimeAgo = (timestamp: string) => {
                        const now = new Date();
                        const activityTime = new Date(timestamp);
                        const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
                        
                        if (diffInMinutes < 60) {
                          return `vor ${diffInMinutes} Min`;
                        } else if (diffInMinutes < 1440) {
                          const hours = Math.floor(diffInMinutes / 60);
                          return `vor ${hours} Std`;
                        } else {
                          const days = Math.floor(diffInMinutes / 1440);
                          return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
                        }
                      };

                      return (
                        <div 
                          key={`${activity._id}-${index}`} 
                          className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-500 backdrop-blur-sm cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
                            isDataChange 
                              ? 'bg-gradient-to-r from-nordic-light/20 to-nordic-primary/20 dark:from-nordic-light/10 dark:to-nordic-primary/10 border border-nordic-primary/30 shadow-lg animate-pulse-nordic' 
                              : 'bg-white/80 dark:bg-nordic-dark/30 border border-nordic-light/20 dark:border-nordic-dark/20'
                          }`}
                          onClick={() => openLogModal(activity)}
                        >
                          <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${getActionColor(activity.action)} ${
                            isDataChange ? 'animate-ping shadow-lg' : ''
                          }`}></div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm leading-relaxed ${
                              isDataChange 
                                ? 'text-nordic-dark dark:text-nordic-light font-semibold' 
                                : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {getActionText(activity.action, activity.resource)}
                            </p>
                            <p className="text-xs text-nordic-dark/60 dark:text-nordic-light/60">
                              {getTimeAgo(activity.timestamp)} • {activity.userId?.firstName || 'Unknown'} {activity.userId?.lastName || 'User'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-nordic-dark/60 dark:text-nordic-light/60">Keine Audit-Logs verfügbar</p>
                </div>
              )}
              
              {/* Nordic gradient overlay dla smooth fade efektu */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-nordic-light/30 dark:from-nordic-dark/30 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-nordic-light/30 dark:from-nordic-dark/30 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Custom CSS dla animacji Nordic */}
            <style jsx>{`
              @keyframes scrollUp {
                0% {
                  transform: translateY(100%);
                }
                100% {
                  transform: translateY(-100%);
                }
              }
              
              @keyframes scrollUp {
                from { transform: translateY(0); }
                to { transform: translateY(-50%); }
              }
              
              .animate-scroll-up {
                animation: scrollUp 30s linear infinite;
              }
              
              @keyframes pulse-nordic {
                0%, 100% {
                  opacity: 1;
                  transform: scale(1);
                  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
                }
                50% {
                  opacity: 0.9;
                  transform: scale(1.02);
                  box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
                }
              }
              
              .animate-pulse-nordic {
                animation: pulse-nordic 2s ease-in-out infinite;
              }
            `}</style>
          </ResponsiveCard>

          <ResponsiveCard padding="lg" shadow="lg">
            <h3 className="text-base lg:text-lg font-semibold text-nordic-dark dark:text-nordic-light mb-3 lg:mb-4">Schnellaktionen</h3>
            <div className="space-y-2 lg:space-y-3">
              <ResponsiveButton variant="outline" size="md" fullWidth>
                <span className="text-sm">Neuen Benutzer hinzufügen</span>
              </ResponsiveButton>
              <ResponsiveButton variant="outline" size="md" fullWidth>
                <span className="text-sm">Neues Projekt erstellen</span>
              </ResponsiveButton>
              <ResponsiveButton variant="outline" size="md" fullWidth>
                <span className="text-sm">Berichte anzeigen</span>
              </ResponsiveButton>
              <ResponsiveButton variant="outline" size="md" fullWidth>
                <span className="text-sm">Einstellungen verwalten</span>
              </ResponsiveButton>
            </div>
          </ResponsiveCard>
        </div>
      </ResponsiveContainer>

      {/* Modal für Log-Details */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-nordic-dark dark:text-nordic-light">
                  Audit Log Details
                </h3>
                <button
                  onClick={closeLogModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktion</label>
                  <p className={`text-lg font-semibold ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Zeitpunkt</label>
                  <p className="text-nordic-dark dark:text-nordic-light">
                    {formatDateTime(selectedLog.timestamp)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Benutzer</label>
                  <p className="text-nordic-dark dark:text-nordic-light">
                    {selectedLog.userId.firstName} {selectedLog.userId.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedLog.userId.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ressource</label>
                  <p className="text-nordic-dark dark:text-nordic-light">{selectedLog.resource}</p>
                  {selectedLog.resourceId && (
                    <p className="text-sm text-gray-500">ID: {selectedLog.resourceId}</p>
                  )}
                </div>
              </div>
              
              {selectedLog.details && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Details</label>
                  <p className="text-nordic-dark dark:text-nordic-light">{selectedLog.details}</p>
                </div>
              )}
              
              {selectedLog.changes && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Änderungen</label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <pre className="text-sm text-nordic-dark dark:text-nordic-light whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeLogModal}
                className="w-full bg-nordic-primary hover:bg-nordic-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
      
    </AdminPageContainer>
  );
}
