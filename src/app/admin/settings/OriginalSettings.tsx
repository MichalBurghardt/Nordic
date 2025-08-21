'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Shield, Bell, Globe, AlertTriangle } from 'lucide-react';

interface SystemSettings {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    assignmentReminders: boolean;
    paymentReminders: boolean;
  };
  security: {
    passwordMinLength: number;
    requireTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  system: {
    defaultHourlyRate: number;
    defaultCurrency: string;
    timezone: string;
    dateFormat: string;
    autoBackup: boolean;
    maintenanceMode: boolean;
  };
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    company: {
      name: 'Nordic Zeitarbeit GmbH',
      address: 'Hauptstraße 123, 10115 Berlin',
      phone: '+49 30 12345678',
      email: 'kontakt@nordic-zeitarbeit.de',
      website: 'www.nordic-zeitarbeit.de',
      taxId: 'DE123456789',
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      assignmentReminders: true,
      paymentReminders: true,
    },
    security: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
    },
    system: {
      defaultHourlyRate: 15.0,
      defaultCurrency: 'EUR',
      timezone: 'Europe/Berlin',
      dateFormat: 'DD.MM.YYYY',
      autoBackup: true,
      maintenanceMode: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaveStatus('saving');
      setLoading(true);

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Zapisuję...';
      case 'success': return 'Zapisano!';
      case 'error': return 'Błąd zapisu';
      default: return 'Zapisz ustawienia';
    }
  };

  const getSaveButtonClass = () => {
    const baseClass = 'px-6 py-2 rounded-lg font-medium flex items-center gap-2';
    switch (saveStatus) {
      case 'saving': return `${baseClass} bg-blue-400 text-white cursor-not-allowed`;
      case 'success': return `${baseClass} bg-green-600 text-white`;
      case 'error': return `${baseClass} bg-red-600 text-white`;
      default: return `${baseClass} bg-blue-600 text-white hover:bg-blue-700`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systemeinstellungen</h1>
          <p className="text-gray-600">Konfiguracja systemu i parametrów aplikacji</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={loading}
          className={getSaveButtonClass()}
        >
          <Save className="w-4 h-4" />
          {getSaveButtonText()}
        </button>
      </div>

      {/* Informacje o firmie */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Informacje o firmie</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa firmy
            </label>
            <input
              type="text"
              value={settings.company.name}
              onChange={(e) => updateSettings('company', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIP
            </label>
            <input
              type="text"
              value={settings.company.taxId}
              onChange={(e) => updateSettings('company', 'taxId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres
            </label>
            <input
              type="text"
              value={settings.company.address}
              onChange={(e) => updateSettings('company', 'address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="text"
              value={settings.company.phone}
              onChange={(e) => updateSettings('company', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={settings.company.email}
              onChange={(e) => updateSettings('company', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strona internetowa
            </label>
            <input
              type="url"
              value={settings.company.website}
              onChange={(e) => updateSettings('company', 'website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Powiadomienia */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Powiadomienia</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Alerty e-mail</div>
              <div className="text-sm text-gray-600">Wysyłaj powiadomienia na e-mail</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailAlerts}
                onChange={(e) => updateSettings('notifications', 'emailAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Alerty SMS</div>
              <div className="text-sm text-gray-600">Wysyłaj powiadomienia SMS</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.smsAlerts}
                onChange={(e) => updateSettings('notifications', 'smsAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Przypomnienia o einsätze</div>
              <div className="text-sm text-gray-600">Automatyczne przypomnienia o rozpoczęciu pracy</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.assignmentReminders}
                onChange={(e) => updateSettings('notifications', 'assignmentReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Bezpieczeństwo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bezpieczeństwo</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min. długość hasła
            </label>
            <input
              type="number"
              min="6"
              max="32"
              value={settings.security.passwordMinLength}
              onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout sesji (minuty)
            </label>
            <input
              type="number"
              min="15"
              max="480"
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max. prób logowania
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Uwierzytelnianie 2FA</div>
              <div className="text-sm text-gray-600">Wymagaj drugiego składnika</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.requireTwoFactor}
                onChange={(e) => updateSettings('security', 'requireTwoFactor', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Ustawienia systemowe */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Ustawienia systemowe</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domyślna stawka godzinowa
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.system.defaultHourlyRate}
                onChange={(e) => updateSettings('system', 'defaultHourlyRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2 text-gray-500">EUR</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strefa czasowa
            </label>
            <select
              value={settings.system.timezone}
              onChange={(e) => updateSettings('system', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Europe/Warsaw">Europe/Warsaw</option>
              <option value="Europe/Vienna">Europe/Vienna</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format daty
            </label>
            <select
              value={settings.system.dateFormat}
              onChange={(e) => updateSettings('system', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Automatyczne backup</div>
              <div className="text-sm text-gray-600">Codzienne kopie zapasowe</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.system.autoBackup}
                onChange={(e) => updateSettings('system', 'autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Tryb konserwacji */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-900">Tryb konserwacji</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-yellow-900">Włącz tryb konserwacji</div>
            <div className="text-sm text-yellow-700">
              Zablokuje dostęp do systemu dla wszystkich użytkowników oprócz administratorów
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.system.maintenanceMode}
              onChange={(e) => updateSettings('system', 'maintenanceMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
