'use client';

import { useEffect } from 'react';

export default function ColorInitializer() {
  useEffect(() => {
    const loadUserColors = async () => {
      try {
        const response = await fetch('/api/user/color-settings');
        const data = await response.json();
        
        if (data.success && data.colorSettings?.customColors) {
          const root = document.documentElement;
          const colors = data.colorSettings.customColors;
          
          // Ustaw CSS variables na podstawie ustawień użytkownika
          Object.entries(colors).forEach(([colorKey, colorValue]) => {
            const cssVarName = `--color-nordic-${colorKey}`;
            root.style.setProperty(cssVarName, String(colorValue));
          });
          
          console.log('🎨 User colors loaded:', colors);
        }
      } catch (error) {
        console.log('🎨 Using default colors (no user settings):', error);
      }
    };

    loadUserColors();
  }, []);

  return null; // Ten komponent nie renderuje nic
}
