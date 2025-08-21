'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ColorSettings {
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  darknessLevels: {
    light: number;
    medium: number;
    dark: number;
  };
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    light: string;
    dark: string;
  };
}

interface ColorContextType {
  colorSettings: ColorSettings;
  updateColorSettings: (settings: ColorSettings) => void;
  isLoading: boolean;
}

const defaultColorSettings: ColorSettings = {
  colorScheme: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
  },
  darknessLevels: {
    light: 0.1,
    medium: 0.3,
    dark: 0.7,
  },
  customColors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    light: '#F8FAFC',
    dark: '#1E293B',
  },
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: ReactNode }) {
  const [colorSettings, setColorSettings] = useState<ColorSettings>(defaultColorSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadColorSettings = async () => {
      try {
        const response = await fetch('/api/user/color-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.colorSettings) {
            setColorSettings(data.colorSettings);
          }
        }
      } catch (error) {
        console.error('Error loading color settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadColorSettings();
  }, []);

  const updateColorSettings = async (settings: ColorSettings) => {
    try {
      const response = await fetch('/api/user/color-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ colorSettings: settings }),
      });

      if (response.ok) {
        setColorSettings(settings);
      }
    } catch (error) {
      console.error('Error updating color settings:', error);
    }
  };

  return (
    <ColorContext.Provider value={{ colorSettings, updateColorSettings, isLoading }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
}
