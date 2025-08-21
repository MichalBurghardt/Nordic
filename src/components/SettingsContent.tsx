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

interface SettingsContentProps {
  settings: SystemSettings;
  updateSettings: (section: keyof SystemSettings, field: string, value: string | number | boolean) => void;
  saveSettings: () => void;
  loading: boolean;
  getSaveButtonText: () => string;
  getSaveButtonClass: () => string;
  showWindowToggle?: boolean;
  onToggleWindow?: () => void;
}

export default function SettingsContent({
  settings,
  updateSettings,
  saveSettings,
  loading,
  getSaveButtonText,
  getSaveButtonClass,
  showWindowToggle = false,
  onToggleWindow
}: SettingsContentProps) {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systemeinstellungen</h1>
          <p className="text-gray-600">Konfiguracja systemu i parametrów aplikacji</p>
        </div>
        <div className="flex items-center gap-3">
          {showWindowToggle && onToggleWindow && (
            <button
              onClick={onToggleWindow}
              className="px-4 py-2 bg-nordic-primary text-white rounded-lg hover:bg-nordic-dark transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Tryb okna
            </button>
          )}
          <button
            onClick={saveSettings}
            disabled={loading}
            className={getSaveButtonClass()}
          >
            <Save className="w-4 h-4" />
            {getSaveButtonText()}
          </button>
        </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres
            </label>
            <input
              type="text"
              value={settings.company.address}
              onChange={(e) => updateSettings('company', 'address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={settings.company.phone}
              onChange={(e) => updateSettings('company', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strona internetowa
            </label>
            <input
              type="url"
              value={settings.company.website}
              onChange={(e) => updateSettings('company', 'website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Powiadomienia */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Powiadomienia</h3>
        </div>
        
        <div className="space-y-4">
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Bezpieczeństwo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bezpieczeństwo</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimalna długość hasła
            </label>
            <select
              value={settings.security.passwordMinLength}
              onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={6}>6 znaków</option>
              <option value={8}>8 znaków</option>
              <option value={10}>10 znaków</option>
              <option value={12}>12 znaków</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout sesji (minuty)
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3 próby</option>
              <option value={5}>5 prób</option>
              <option value={10}>10 prób</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Ustawienia systemowe */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">System</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domyślna stawka godzinowa (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.system.defaultHourlyRate}
              onChange={(e) => updateSettings('system', 'defaultHourlyRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waluta
            </label>
            <select
              value={settings.system.defaultCurrency}
              onChange={(e) => updateSettings('system', 'defaultCurrency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="PLN">PLN</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strefa czasowa
            </label>
            <select
              value={settings.system.timezone}
              onChange={(e) => updateSettings('system', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
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
        </div>
        
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
    </>
  );
}
