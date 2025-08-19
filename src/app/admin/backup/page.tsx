'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Database, Clock, Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface BackupFile {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'auto' | 'manual';
  status: 'success' | 'failed' | 'in-progress';
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      
      // Mockowe dane - w prawdziwej aplikacji byłyby pobierane z API
      const mockBackups: BackupFile[] = [
        {
          id: '1',
          filename: 'backup_2024_01_15_auto.sql',
          size: 2456789,
          createdAt: '2024-01-15T02:00:00Z',
          type: 'auto',
          status: 'success'
        },
        {
          id: '2',
          filename: 'backup_2024_01_14_manual.sql',
          size: 2398765,
          createdAt: '2024-01-14T14:30:00Z',
          type: 'manual',
          status: 'success'
        },
        {
          id: '3',
          filename: 'backup_2024_01_14_auto.sql',
          size: 2387654,
          createdAt: '2024-01-14T02:00:00Z',
          type: 'auto',
          status: 'success'
        },
        {
          id: '4',
          filename: 'backup_2024_01_13_auto.sql',
          size: 0,
          createdAt: '2024-01-13T02:00:00Z',
          type: 'auto',
          status: 'failed'
        },
      ];
      
      setBackups(mockBackups);
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setIsCreatingBackup(true);
      
      const response = await fetch('/api/admin/backup/create', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Symuluj dodanie nowego backupu
        const newBackup: BackupFile = {
          id: Date.now().toString(),
          filename: `backup_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}_manual.sql`,
          size: 2456789,
          createdAt: new Date().toISOString(),
          type: 'manual',
          status: 'success'
        };
        
        setBackups(prev => [newBackup, ...prev]);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backup: BackupFile) => {
    try {
      const response = await fetch(`/api/admin/backup/download/${backup.id}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading backup:', error);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten backup? Ta operacja jest nieodwracalna.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBackups(prev => prev.filter(b => b.id !== backupId));
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
    }
  };

  const restoreBackup = async (backup: BackupFile) => {
    if (!confirm('Czy na pewno chcesz przywrócić bazę danych z tego backupu? Obecne dane zostaną zastąpione!')) {
      return;
    }

    try {
      setIsRestoring(true);
      
      const response = await fetch(`/api/admin/backup/restore/${backup.id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('Backup został pomyślnie przywrócony!');
      } else {
        alert('Wystąpił błąd podczas przywracania backupu.');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Wystąpił błąd podczas przywracania backupu.');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sukces' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Błąd' },
      'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'W trakcie' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
        {getStatusIcon(status)}
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'auto' ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Automatyczny
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Ręczny
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zarządzanie Backup</h1>
          <p className="text-gray-600">Tworzenie kopii zapasowych i przywracanie danych</p>
        </div>
        <div className="flex gap-3">
          <label className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Wgraj backup
            <input type="file" accept=".sql,.db" className="hidden" />
          </label>
          <button
            onClick={createBackup}
            disabled={isCreatingBackup}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="w-4 h-4" />
            {isCreatingBackup ? 'Tworzę...' : 'Utwórz backup'}
          </button>
        </div>
      </div>

      {/* Ostrzeżenie o automatycznych backupach */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Automatyczne kopie zapasowe</h3>
            <p className="text-blue-700 text-sm mt-1">
              System automatycznie tworzy kopie zapasowe codziennie o 02:00. 
              Przechowywane są kopie z ostatnich 30 dni.
            </p>
          </div>
        </div>
      </div>

      {/* Lista backupów */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Dostępne kopie zapasowe</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ładowanie kopii zapasowych...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nazwa pliku
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rozmiar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data utworzenia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
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
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Database className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{backup.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {formatFileSize(backup.size)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(backup.type)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(backup.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {backup.status === 'success' && (
                          <>
                            <button
                              onClick={() => downloadBackup(backup)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Pobierz"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => restoreBackup(backup)}
                              disabled={isRestoring}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Przywróć"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Usuń"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ostrzeżenia bezpieczeństwa */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Ważne informacje</h3>
            <ul className="text-yellow-700 text-sm mt-1 space-y-1">
              <li>• Przywracanie backupu zastąpi wszystkie obecne dane</li>
              <li>• Zawsze utwórz aktualną kopię zapasową przed przywracaniem starszej</li>
              <li>• Kopie zapasowe zawierają również dane osobowe - przechowuj je bezpiecznie</li>
              <li>• Sprawdź integralność backupu przed przywracaniem w środowisku produkcyjnym</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
