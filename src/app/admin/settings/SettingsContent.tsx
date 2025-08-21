'use client';

import { useState } from 'react';
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
      paymentReminders: false,
    },
    security: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
    },
    system: {
      defaultHourlyRate: 15.50,
      defaultCurrency: 'EUR',
      timezone: 'Europe/Berlin',
      dateFormat: 'DD.MM.YYYY',
      autoBackup: true,
      maintenanceMode: false,
    },
  });

  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const tabs = [
    { id: 'company', label: 'Firma', icon: Globe },
    { id: 'notifications', label: 'Powiadomienia', icon: Bell },
    { id: 'security', label: 'Bezpieczeństwo', icon: Shield },
    { id: 'system', label: 'System', icon: Settings },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Symulacja zapisywania
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Tu będzie prawdziwe API call
      console.log('Saving settings:', settings);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (category: keyof SystemSettings, field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nazwa firmy
        </label>
        <input
          type="text"
          value={settings.company.name}
          onChange={(e) => updateSettings('company', 'name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adres
        </label>
        <textarea
          value={settings.company.address}
          onChange={(e) => updateSettings('company', 'address', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            value={settings.company.phone}
            onChange={(e) => updateSettings('company', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={settings.company.email}
            onChange={(e) => updateSettings('company', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strona internetowa
          </label>
          <input
            type="url"
            value={settings.company.website}
            onChange={(e) => updateSettings('company', 'website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Powiadomienia email</div>
          <div className="text-sm text-gray-500">
            Otrzymuj powiadomienia na adres email
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.emailAlerts}
            onChange={(e) => updateSettings('notifications', 'emailAlerts', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-primary"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Powiadomienia SMS</div>
          <div className="text-sm text-gray-500">
            Otrzymuj powiadomienia SMS na telefon
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.smsAlerts}
            onChange={(e) => updateSettings('notifications', 'smsAlerts', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-primary"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Przypomnienia o zleceniach</div>
          <div className="text-sm text-gray-500">
            Automatyczne przypomnienia o nadchodzących zleceniach
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.assignmentReminders}
            onChange={(e) => updateSettings('notifications', 'assignmentReminders', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-primary"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Przypomnienia o płatnościach</div>
          <div className="text-sm text-gray-500">
            Powiadomienia o nadchodzących terminach płatności
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.notifications.paymentReminders}
            onChange={(e) => updateSettings('notifications', 'paymentReminders', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-primary"></div>
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimalna długość hasła
        </label>
        <select
          value={settings.security.passwordMinLength}
          onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
        >
          <option value={6}>6 znaków</option>
          <option value={8}>8 znaków</option>
          <option value={10}>10 znaków</option>
          <option value={12}>12 znaków</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Wymagaj uwierzytelniania dwuskładnikowego</div>
          <div className="text-sm text-gray-500">
            Dodatkowa warstwa bezpieczeństwa dla wszystkich użytkowników
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.security.requireTwoFactor}
            onChange={(e) => updateSettings('security', 'requireTwoFactor', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-nordic-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nordic-primary"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timeout sesji (minuty)
        </label>
        <select
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
        >
          <option value={15}>15 minut</option>
          <option value={30}>30 minut</option>
          <option value={60}>1 godzina</option>
          <option value={120}>2 godziny</option>
          <option value={480}>8 godzin</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maksymalna liczba prób logowania
        </label>
        <select
          value={settings.security.maxLoginAttempts}
          onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
        >
          <option value={3}>3 próby</option>
          <option value={5}>5 prób</option>
          <option value={10}>10 prób</option>
        </select>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domyślna stawka godzinowa (EUR)
          </label>
          <input
            type="number"
            step="0.01"
            value={settings.system.defaultHourlyRate}
            onChange={(e) => updateSettings('system', 'defaultHourlyRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waluta
          </label>
          <select
            value={settings.system.defaultCurrency}
            onChange={(e) => updateSettings('system', 'defaultCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="PLN">PLN</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strefa czasowa
          </label>
          <select
            value={settings.system.timezone}
            onChange={(e) => updateSettings('system', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
          >
            <option value="Europe/Berlin">Europa/Berlin</option>
            <option value="Europe/Warsaw">Europa/Warszawa</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format daty
          </label>
          <select
            value={settings.system.dateFormat}
            onChange={(e) => updateSettings('system', 'dateFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-primary"
          >
            <option value="DD.MM.YYYY">DD.MM.YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Automatyczne kopie zapasowe</div>
          <div className="text-sm text-gray-500">
            Tworzenie codziennych kopii zapasowych systemu
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.system.autoBackup}
            onChange={(e) => updateSettings('system', 'autoBackup', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 mb-2">Tryb konserwacji</h4>
            
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
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Nagłówek z przyciskiem zapisz */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ustawienia Systemu</h1>
              <p className="text-gray-600">Zarządzaj konfiguracją systemu Nordic Zeitarbeit</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : saveStatus === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : saveStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-nordic-primary hover:bg-nordic-dark'
              } text-white`}
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? 'Zapisywanie...'
                  : saveStatus === 'success'
                  ? 'Zapisano!'
                  : saveStatus === 'error'
                  ? 'Błąd!'
                  : 'Zapisz zmiany'
                }
              </span>
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar z tabami */}
          <div className="w-64 bg-white border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-nordic-light text-nordic-dark'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Główna zawartość */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
