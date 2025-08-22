'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Shield, Bell, Globe, AlertTriangle, Type } from 'lucide-react';
import AdminPageContainer from '@/components/AdminPageContainer';
import { ColorUtils, PREDEFINED_COLOR_SCHEMES, DEFAULT_DARKNESS_LEVELS } from '@/models/ColorModel';
import type { ColorScheme, DarknessLevels, ColorSet } from '@/models/ColorModel';
import { FontSettings, AVAILABLE_FONTS, FontUtils } from '@/models/FontModel';

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
  colors: {
    colorScheme: ColorScheme;
    darknessLevels: DarknessLevels;
    customColors: ColorSet;
  };
  fonts: FontSettings;
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
    colors: {
      colorScheme: PREDEFINED_COLOR_SCHEMES[1], // Niebieski
      darknessLevels: DEFAULT_DARKNESS_LEVELS,
      customColors: ColorUtils.generateColorSet(PREDEFINED_COLOR_SCHEMES[1], DEFAULT_DARKNESS_LEVELS),
    },
    fonts: FontUtils.getDefaultFontSettings(),
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  // useEffect do aktualizowania CSS variables w czasie rzeczywistym
  useEffect(() => {
    if (settings.colors?.customColors) {
      const root = document.documentElement;
      const colors = settings.colors.customColors;
      
      // Aktualizuj CSS variables dla wszystkich kolorów Nordic
      // ColorSet ma strukturę: { nordic1: "hsl(...)", nordic2: "hsl(...)", ... }
      Object.entries(colors).forEach(([colorKey, colorValue]) => {
        const cssVarName = `--color-nordic-${colorKey}`;
        root.style.setProperty(cssVarName, String(colorValue));
      });
      
      console.log('🎨 Updated CSS variables:', colors);
    }
  }, [settings.colors?.customColors]);

  // Funkcja do aktualizacji CSS variables
  const updateCSSVariables = (hue: number, saturation: number) => {
    const root = document.documentElement;
    const tempColorScheme: ColorScheme = {
      id: 'temp',
      name: 'Temporary',
      hue,
      saturation
    };
    const colors = ColorUtils.generateColorSet(tempColorScheme, DEFAULT_DARKNESS_LEVELS);
    
    // Aktualizuj CSS variables dla wszystkich kolorów Nordic
    Object.entries(colors).forEach(([colorKey, colorValue]) => {
      const cssVarName = `--color-nordic-${colorKey}`;
      root.style.setProperty(cssVarName, String(colorValue));
    });
    
    console.log('🎨 Updated CSS variables manually:', colors);
  };

  // Usunęliśmy problematyczny useEffect, który powodował nieskończoną pętlę

  const fetchSettings = async () => {
    try {
      // Pobierz ustawienia systemowe
      const systemResponse = await fetch('/api/admin/settings');
      const systemData = await systemResponse.json();
      
      // Pobierz ustawienia kolorów użytkownika
      const colorResponse = await fetch('/api/user/color-settings');
      const colorData = await colorResponse.json();
      
      if (systemData.success) {
        const newSettings = { ...systemData.settings };
        
        // Jeśli użytkownik ma własne ustawienia kolorów, użyj ich
        if (colorData.success && colorData.colorSettings) {
          newSettings.colors = {
            colorScheme: colorData.colorSettings.colorScheme,
            darknessLevels: colorData.colorSettings.darknessLevels,
            customColors: colorData.colorSettings.customColors,
          };
        }
        
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaveStatus('saving');
      setLoading(true);

      // Zapisz ustawienia systemowe
      const systemResponse = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      // Zapisz ustawienia kolorów użytkownika
      const colorResponse = await fetch('/api/user/color-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          colorSettings: {
            colorScheme: settings.colors.colorScheme,
            darknessLevels: settings.colors.darknessLevels,
            customColors: settings.colors.customColors,
          }
        }),
      });

      if (systemResponse.ok && colorResponse.ok) {
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
    console.log('🔧 updateSettings called:', { section, field, value });
    
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };

      // Auto-regeneruj kolory gdy zmieniają się colorScheme lub darknessLevels
      if (section === 'colors' && (field === 'colorScheme' || field === 'darknessLevels')) {
        const colorScheme = field === 'colorScheme' ? value as ColorScheme : newSettings.colors?.colorScheme;
        const darknessLevels = field === 'darknessLevels' ? value as DarknessLevels : newSettings.colors?.darknessLevels;
        
        if (colorScheme && darknessLevels) {
          const newColors = ColorUtils.generateColorSet(colorScheme, darknessLevels);
          console.log('🎨 Regenerating colors:', { colorScheme, darknessLevels, newColors });
          newSettings.colors = {
            ...newSettings.colors,
            customColors: newColors,
          };
        }
      }

      return newSettings;
    });
  };

  // Fabryczne kolory Nordic
  const FACTORY_COLORS = {
    hue: 210,        // Niebieski
    saturation: 80   // 80% nasycenia
  };

  // Reset do kolorów fabrycznych
  const resetToFactoryColors = () => {
    if (window.confirm('Czy na pewno chcesz przywrócić fabryczne kolory Nordic? Niezapisane zmiany zostaną utracone.')) {
      updateSettings('colors', 'colorScheme', {
        hue: FACTORY_COLORS.hue,
        saturation: FACTORY_COLORS.saturation
      });
      
      // Zastosuj od razu do CSS
      updateCSSVariables(FACTORY_COLORS.hue, FACTORY_COLORS.saturation);
      
      alert('Przywrócono fabryczne kolory Nordic');
    }
  };

  // Podgląd zmian (otwórz stronę główną)
  const previewChanges = () => {
    // Otwórz nową kartę z dashboard aby zobaczyć zmiany
    window.open('/admin/dashboard', '_blank');
    alert('Otwarto podgląd w nowej karcie');
  };

  // Zapisz ustawienia kolorów do bazy
  const saveColorSettings = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          colorScheme: settings.colors?.colorScheme
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas zapisywania ustawień');
      }

      await response.json(); // Pobierz odpowiedź ale nie używaj
      
      // Zastosuj kolory globalnie
      const colorScheme = settings.colors?.colorScheme;
      if (colorScheme) {
        updateCSSVariables(colorScheme.hue, colorScheme.saturation);
      }
      
      alert('Ustawienia kolorów zostały zapisane i zastosowane globalnie!');
      
      // Odśwież stronę po 1 sekundzie aby pokazać globalne zmiany
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Błąd zapisywania ustawień:', error);
      alert('Nie udało się zapisać ustawień');
    } finally {
      setLoading(false);
    }
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

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    // Można dodać logikę nawigacji lub powiadomienie
    console.log('Zamykanie okna settings');
  };

  return (
    <AdminPageContainer>
      {/* Okno wpasowane między sidebar a prawym panelem */}
      <div className={`h-full ${isMaximized ? '' : 'flex items-center justify-center p-4'}`}>
        <div
          className={`bg-white transition-all duration-200 flex flex-col ${
            isMaximized 
              ? 'w-full h-full overflow-hidden' 
              : 'border border-gray-300 shadow-2xl rounded-lg overflow-hidden w-full max-w-4xl h-[calc(100vh-8rem)]'
          } ${isMinimized ? 'h-10' : ''}`}
        >
          {/* Pasek tytułowy */}
          <div className="bg-gradient-to-r from-nordic-primary to-nordic-dark h-10 flex items-center justify-between px-4 cursor-move select-none flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="w-2 h-2 text-white" />
              </div>
              <span className="text-white font-medium text-sm">Ustawienia Systemu</span>
            </div>
            
            {/* Przyciski kontrolne */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleMinimize}
                className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors"
                title="Minimalizuj"
              >
                <span className="text-white text-xs">−</span>
              </button>
              
              <button
                onClick={handleMaximize}
                className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors"
                title={isMaximized ? "Przywróć" : "Maksymalizuj"}
              >
                <span className="text-white text-xs">{isMaximized ? "❐" : "□"}</span>
              </button>
              
              <button
                onClick={handleClose}
                className="w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded flex items-center justify-center transition-colors"
                title="Zamknij"
              >
                <span className="text-white text-xs">×</span>
              </button>
            </div>
          </div>

          {/* Zawartość okna */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-6">
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
              value={settings.company?.name || ''}
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
              value={settings.company?.taxId || ''}
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
              value={settings.company?.address || ''}
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
              value={settings.company?.phone || ''}
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
              value={settings.company?.email || ''}
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
              value={settings.company?.website || ''}
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
                checked={settings.notifications?.emailAlerts || false}
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
                checked={settings.notifications?.smsAlerts || false}
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
                checked={settings.notifications?.assignmentReminders || false}
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
              value={settings.security?.passwordMinLength || 8}
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
              value={settings.security?.sessionTimeout || 30}
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
              value={settings.security?.maxLoginAttempts || 5}
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
                checked={settings.security?.requireTwoFactor || false}
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
                value={settings.system?.defaultHourlyRate || 15}
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
              value={settings.system?.timezone || 'Europe/Berlin'}
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
              value={settings.system?.dateFormat || 'DD.MM.YYYY'}
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
                checked={settings.system?.autoBackup || false}
                onChange={(e) => updateSettings('system', 'autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Ustawienia kolorów */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <h3 className="text-lg font-semibold text-gray-900">Ustawienia kolorów aplikacji</h3>
        </div>
        
        {/* Tęczowy selektor koloru */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Wybierz kolor z tęczy
          </label>
          
          {/* Tęczowy slider do wyboru odcienia (Hue) */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Odcień (Hue): {settings.colors?.colorScheme?.hue || 210}°
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="360"
                value={settings.colors?.colorScheme?.hue || 210}
                onChange={(e) => {
                  if (settings.colors?.colorScheme) {
                    const hue = parseInt(e.target.value);
                    const newScheme = { ...settings.colors.colorScheme, hue };
                    updateSettings('colors', 'colorScheme', newScheme);
                  }
                }}
                onInput={(e) => {
                  // Aktualizacja w czasie rzeczywistym podczas przeciągania
                  const target = e.target as HTMLInputElement;
                  const hue = parseInt(target.value);
                  
                  // Aktualizuj kółeczko
                  const thumb = target.nextElementSibling as HTMLElement;
                  if (thumb) {
                    thumb.style.left = `${(hue / 360) * 100}%`;
                    thumb.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
                  }
                  
                  // Aktualizuj ustawienia w czasie rzeczywistym
                  if (settings.colors?.colorScheme) {
                    const newScheme = { ...settings.colors.colorScheme, hue };
                    updateSettings('colors', 'colorScheme', newScheme);
                  }
                }}
                className="w-full h-4 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 100%, 50%), hsl(30, 100%, 50%), hsl(60, 100%, 50%), hsl(90, 100%, 50%),
                    hsl(120, 100%, 50%), hsl(150, 100%, 50%), hsl(180, 100%, 50%), hsl(210, 100%, 50%),
                    hsl(240, 100%, 50%), hsl(270, 100%, 50%), hsl(300, 100%, 50%), hsl(330, 100%, 50%), hsl(360, 100%, 50%))`,
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              />
              {/* Okrągły wskaźnik w kolorze pozycji */}
              <div 
                className="absolute w-5 h-5 border-2 border-white rounded-full shadow-lg pointer-events-none"
                style={{ 
                  left: `${((settings.colors?.colorScheme?.hue || 220) / 360) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `hsl(${settings.colors?.colorScheme?.hue || 220}, 100%, 50%)`
                }}
              />
            </div>
          </div>

          {/* Slider do nasycenia */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Nasycenie (Saturation): {settings.colors?.colorScheme?.saturation || 100}%
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.colors?.colorScheme?.saturation || 100}
                onChange={(e) => {
                  if (settings.colors?.colorScheme) {
                    const saturation = parseInt(e.target.value);
                    const newScheme = { ...settings.colors.colorScheme, saturation };
                    updateSettings('colors', 'colorScheme', newScheme);
                  }
                }}
                onInput={(e) => {
                  // Aktualizacja w czasie rzeczywistym podczas przeciągania
                  const target = e.target as HTMLInputElement;
                  const saturation = parseInt(target.value);
                  
                  // Aktualizuj kółeczko
                  const thumb = target.nextElementSibling as HTMLElement;
                  if (thumb) {
                    thumb.style.left = `${saturation}%`;
                    thumb.style.backgroundColor = `hsl(${settings.colors?.colorScheme?.hue || 220}, ${saturation}%, 50%)`;
                  }
                  
                  // Aktualizuj ustawienia w czasie rzeczywistym
                  if (settings.colors?.colorScheme) {
                    const newScheme = { ...settings.colors.colorScheme, saturation };
                    updateSettings('colors', 'colorScheme', newScheme);
                  }
                }}
                className="w-full h-4 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${settings.colors?.colorScheme?.hue || 220}, 0%, 50%), hsl(${settings.colors?.colorScheme?.hue || 220}, 100%, 50%))`,
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              />
              {/* Okrągły wskaźnik w kolorze pozycji */}
              <div 
                className="absolute w-5 h-5 border-2 border-white rounded-full shadow-lg pointer-events-none"
                style={{ 
                  left: `${settings.colors?.colorScheme?.saturation || 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `hsl(${settings.colors?.colorScheme?.hue || 220}, ${settings.colors?.colorScheme?.saturation || 100}%, 50%)`
                }}
              />
            </div>
          </div>

          {/* Podgląd wybranego koloru */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div 
              className="w-16 h-16 rounded-lg border-4 border-white shadow-lg"
              style={{ backgroundColor: `hsl(${settings.colors?.colorScheme?.hue || 220}, ${settings.colors?.colorScheme?.saturation || 100}%, 50%)` }}
            />
            <div>
              <h4 className="font-medium text-gray-900">Wybrany kolor bazowy</h4>
              <p className="text-sm text-gray-600">
                HSL: {settings.colors?.colorScheme?.hue || 220}°, {settings.colors?.colorScheme?.saturation || 100}%, 50%
              </p>
            </div>
          </div>
        </div>

        {/* Szybki wybór popularnych kolorów */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Lub wybierz popularny kolor
          </label>
          <div className="grid grid-cols-6 gap-2">
            {PREDEFINED_COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => {
                  updateSettings('colors', 'colorScheme', scheme);
                }}
                className={`h-12 rounded-lg border-2 transition-all duration-200 ${
                  settings.colors.colorScheme.id === scheme.id
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: `hsl(${scheme.hue}, ${scheme.saturation}%, 50%)`
                }}
                title={scheme.name}
              />
            ))}
          </div>
        </div>

        {/* Podgląd kolorów */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Podgląd wygenerowanych kolorów
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'Nordic1', key: 'nordic1', darkness: settings.colors?.darknessLevels?.nordic1 || 9 },
              { name: 'Nordic2', key: 'nordic2', darkness: settings.colors?.darknessLevels?.nordic2 || 27 },
              { name: 'Nordic3', key: 'nordic3', darkness: settings.colors?.darknessLevels?.nordic3 || 42 },
              { name: 'Nordic4', key: 'nordic4', darkness: settings.colors?.darknessLevels?.nordic4 || 58 },
              { name: 'Nordic5', key: 'nordic5', darkness: settings.colors?.darknessLevels?.nordic5 || 78 },
              { name: 'Nordic6', key: 'nordic6', darkness: settings.colors?.darknessLevels?.nordic6 || 96 }
            ].map((color) => {
              const hue = settings.colors?.colorScheme?.hue || 220;
              const saturation = settings.colors?.colorScheme?.saturation || 100;
              // Zawsze używaj aktualnych wartości z sliderów do wygenerowania koloru
              const currentColor = ColorUtils.generateHSLColor(hue, saturation, color.darkness);
              
              return (
                <div key={color.name} className="text-center">
                  <div 
                    className="w-full h-16 rounded-lg border border-gray-200 mb-2 transition-colors duration-200"
                    style={{ backgroundColor: currentColor }}
                  />
                  <div className="text-xs font-medium text-gray-700">{color.name}</div>
                  <div className="text-xs text-gray-500">{color.darkness}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manualne ustawianie poziomów ciemności */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Poziomy ciemności (darkness %) - dokładne dostrajanie
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'nordic1', name: 'Nordic1', value: settings.colors?.darknessLevels?.nordic1 || 9 },
              { key: 'nordic2', name: 'Nordic2', value: settings.colors?.darknessLevels?.nordic2 || 27 },
              { key: 'nordic3', name: 'Nordic3', value: settings.colors?.darknessLevels?.nordic3 || 42 },
              { key: 'nordic4', name: 'Nordic4', value: settings.colors?.darknessLevels?.nordic4 || 58 },
              { key: 'nordic5', name: 'Nordic5', value: settings.colors?.darknessLevels?.nordic5 || 78 },
              { key: 'nordic6', name: 'Nordic6', value: settings.colors?.darknessLevels?.nordic6 || 96 }
            ].map((level) => {
              const hue = settings.colors?.colorScheme?.hue || 220;
              const saturation = settings.colors?.colorScheme?.saturation || 100;
              // Zawsze używaj aktualnych wartości z sliderów
              const currentColor = ColorUtils.generateHSLColor(hue, saturation, level.value);
              
              return (
                <div key={level.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded border border-gray-300 transition-colors duration-200"
                      style={{ backgroundColor: currentColor }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{level.name}</div>
                      <div className="text-xs text-gray-500">{level.value}% darkness</div>
                    </div>
                  </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (settings.colors?.darknessLevels) {
                        const newValue = Math.max(5, level.value - 1);
                        const newDarkness = { ...settings.colors.darknessLevels, [level.key]: newValue };
                        updateSettings('colors', 'darknessLevels', newDarkness);
                      }
                    }}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-gray-600 transition-colors"
                    disabled={level.value <= 5}
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-mono bg-white px-2 py-1 rounded border">
                    {level.value}
                  </span>
                  <button
                    onClick={() => {
                      if (settings.colors?.darknessLevels) {
                        const newValue = Math.min(95, level.value + 1);
                        const newDarkness = { ...settings.colors.darknessLevels, [level.key]: newValue };
                        updateSettings('colors', 'darknessLevels', newDarkness);
                      }
                    }}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-gray-600 transition-colors"
                    disabled={level.value >= 95}
                  >
                    +
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Przyciski akcji dla kolorów */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={resetToFactoryColors}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resetuj do fabrycznych
              </button>
              
              <button
                onClick={previewChanges}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Podgląd na stronie
              </button>
            </div>
            
            <button
              onClick={saveColorSettings}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {loading ? 'Zapisywanie...' : 'Zapisz kolory'}
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <p><strong>Fabryczne:</strong> Domyślne kolory Nordic (niebieski, odcień 210°, nasycenie 80%)</p>
            <p><strong>Podgląd:</strong> Zobacz zmiany na stronie bez zapisywania</p>
            <p><strong>Zapisz:</strong> Zastosuj kolory globalnie dla całej aplikacji</p>
          </div>
        </div>
      </div>

      {/* Sekcja Czcionek */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Czcionki</h3>
            <p className="text-sm text-gray-600">Wybierz czcionki dla różnych elementów interfejsu</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Czcionka główna */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Czcionka główna (interfejs)
            </label>
            <select
              value={settings.fonts?.primaryFont?.id || 'inter'}
              onChange={(e) => {
                const selectedFont = AVAILABLE_FONTS.find(f => f.id === e.target.value);
                if (selectedFont) {
                  updateSettings('fonts', 'primaryFont', selectedFont);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: settings.fonts?.primaryFont ? FontUtils.generateFontFamily(settings.fonts.primaryFont) : 'inherit' }}
            >
              {AVAILABLE_FONTS.filter(f => f.category === 'sans-serif' || f.category === 'display').map(font => (
                <option key={font.id} value={font.id} style={{ fontFamily: font.fontFamily }}>
                  {font.name} - {font.description}
                </option>
              ))}
            </select>
            <div className="mt-2 p-3 bg-gray-50 rounded text-lg" style={{ fontFamily: settings.fonts?.primaryFont ? FontUtils.generateFontFamily(settings.fonts.primaryFont) : 'inherit' }}>
              Przykład tekstu w czcionce {settings.fonts?.primaryFont?.name || 'domyślnej'}
            </div>
          </div>

          {/* Czcionka nagłówków */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Czcionka nagłówków
            </label>
            <select
              value={settings.fonts?.headingFont?.id || 'montserrat'}
              onChange={(e) => {
                const selectedFont = AVAILABLE_FONTS.find(f => f.id === e.target.value);
                if (selectedFont) {
                  updateSettings('fonts', 'headingFont', selectedFont);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: settings.fonts?.headingFont ? FontUtils.generateFontFamily(settings.fonts.headingFont) : 'inherit' }}
            >
              {AVAILABLE_FONTS.filter(f => f.category === 'serif' || f.category === 'display' || f.category === 'sans-serif').map(font => (
                <option key={font.id} value={font.id} style={{ fontFamily: font.fontFamily }}>
                  {font.name} - {font.description}
                </option>
              ))}
            </select>
            <div className="mt-2 p-3 bg-gray-50 rounded text-2xl font-bold" style={{ fontFamily: settings.fonts?.headingFont ? FontUtils.generateFontFamily(settings.fonts.headingFont) : 'inherit' }}>
              Przykład nagłówka w {settings.fonts?.headingFont?.name || 'domyślnej czcionce'}
            </div>
          </div>

          {/* Czcionka treści */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Czcionka treści (artykuły, opisy)
            </label>
            <select
              value={settings.fonts?.bodyFont?.id || 'open-sans'}
              onChange={(e) => {
                const selectedFont = AVAILABLE_FONTS.find(f => f.id === e.target.value);
                if (selectedFont) {
                  updateSettings('fonts', 'bodyFont', selectedFont);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: settings.fonts?.bodyFont ? FontUtils.generateFontFamily(settings.fonts.bodyFont) : 'inherit' }}
            >
              {AVAILABLE_FONTS.filter(f => f.category === 'serif' || f.category === 'sans-serif').map(font => (
                <option key={font.id} value={font.id} style={{ fontFamily: font.fontFamily }}>
                  {font.name} - {font.description}
                </option>
              ))}
            </select>
            <div className="mt-2 p-3 bg-gray-50 rounded" style={{ fontFamily: settings.fonts?.bodyFont ? FontUtils.generateFontFamily(settings.fonts.bodyFont) : 'inherit' }}>
              <p className="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
          </div>

          {/* Czcionka kodu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Czcionka kodu (monospace)
            </label>
            <select
              value={settings.fonts?.codeFont?.id || 'fira-code'}
              onChange={(e) => {
                const selectedFont = AVAILABLE_FONTS.find(f => f.id === e.target.value);
                if (selectedFont) {
                  updateSettings('fonts', 'codeFont', selectedFont);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ fontFamily: settings.fonts?.codeFont ? FontUtils.generateFontFamily(settings.fonts.codeFont) : 'monospace' }}
            >
              {AVAILABLE_FONTS.filter(f => f.category === 'monospace').map(font => (
                <option key={font.id} value={font.id} style={{ fontFamily: font.fontFamily }}>
                  {font.name} - {font.description}
                </option>
              ))}
            </select>
            <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded" style={{ fontFamily: settings.fonts?.codeFont ? FontUtils.generateFontFamily(settings.fonts.codeFont) : 'monospace' }}>
              <pre>{`function helloWorld() {
  console.log("Hello, World!");
  return true;
}`}</pre>
            </div>
          </div>

          {/* Podgląd wszystkich czcionek */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Podgląd czcionek w akcji</h4>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold" style={{ fontFamily: settings.fonts?.headingFont ? FontUtils.generateFontFamily(settings.fonts.headingFont) : 'inherit' }}>
                Główny nagłówek
              </h1>
              <h2 className="text-xl font-semibold" style={{ fontFamily: settings.fonts?.headingFont ? FontUtils.generateFontFamily(settings.fonts.headingFont) : 'inherit' }}>
                Podtytuł sekcji
              </h2>
              <p style={{ fontFamily: settings.fonts?.bodyFont ? FontUtils.generateFontFamily(settings.fonts.bodyFont) : 'inherit' }}>
                To jest przykład tekstu treści napisanego w wybranej czcionce. Można tutaj zobaczyć jak tekst będzie wyglądał w rzeczywistym użyciu na stronie.
              </p>
              <div className="p-3 bg-gray-900 text-white rounded" style={{ fontFamily: settings.fonts?.codeFont ? FontUtils.generateFontFamily(settings.fonts.codeFont) : 'monospace' }}>
                const example = &quot;kod programu&quot;;
              </div>
              <div className="flex gap-4 text-sm" style={{ fontFamily: settings.fonts?.primaryFont ? FontUtils.generateFontFamily(settings.fonts.primaryFont) : 'inherit' }}>
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Przycisk</button>
                <span>Elementy interfejsu</span>
              </div>
            </div>
          </div>

          {/* Eksport CSS */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">CSS dla czcionek</h4>
                <p className="text-sm text-gray-600">
                  Skopiuj CSS z wybranymi czcionkami
                </p>
              </div>
              <button
                onClick={() => {
                  if (settings.fonts) {
                    const cssVars = FontUtils.generateFontCSSVariables(settings.fonts);
                    const googleFontsUrl = FontUtils.generateGoogleFontsUrl(Object.values(settings.fonts));
                    const fullCSS = `/* Import Google Fonts */
@import url("${googleFontsUrl}");

/* CSS Variables */
:root {
${cssVars}
}`;
                    navigator.clipboard.writeText(fullCSS);
                    alert('CSS został skopiowany do schowka!');
                  } else {
                    alert('Czcionki nie zostały jeszcze załadowane.');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Kopiuj CSS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tryb konserwacji - przeniesione na koniec */}
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
              checked={settings.system?.maintenanceMode || false}
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
          )}
        </div>

        {/* Przycisk zapisywania */}
        <div className="mt-8 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Zapisz ustawienia</h3>
            <p className="text-sm text-gray-600">
              Zapisz wszystkie zmiany w ustawieniach systemowych i kolorach aplikacji
            </p>
          </div>
          <button
            onClick={saveSettings}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Zapisywanie...' : 'Zapisz ustawienia'}
          </button>
        </div>

        {/* Status zapisu */}
        {saveStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">Ustawienia zostały pomyślnie zapisane</span>
            </div>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Wystąpił błąd podczas zapisywania ustawień</span>
            </div>
          </div>
        )}
      </div>
    </AdminPageContainer>
  );
}