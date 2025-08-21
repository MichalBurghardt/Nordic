// Model kolorów dla aplikacji Nordic
export interface ColorScheme {
  id: string;
  name: string;
  hue: number;
  saturation: number;
  description?: string;
}

export interface ColorSet {
  nordic1: string;  // jasny
  nordic2: string;
  nordic3: string;
  nordic4: string;
  nordic5: string;
  nordic6: string;  // ciemny
}

export interface DarknessLevels {
  nordic1: number;  // ~9% - jasny
  nordic2: number;  // ~27%
  nordic3: number;  // ~42%
  nordic4: number;  // ~60%
  nordic5: number;  // ~78%
  nordic6: number;  // ~96% - ciemny
}

export interface UserColorPreferences {
  id: string;
  userId: string;
  schemeName: string;
  colorScheme: ColorScheme;
  darknessLevels: DarknessLevels;
  customColors: ColorSet;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Predefiniowane schematy kolorów
export const PREDEFINED_COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'grayscale',
    name: 'Biały-Czarny',
    hue: 0,
    saturation: 0,
    description: 'Klasyczny schemat w skali szarości'
  },
  {
    id: 'blue',
    name: 'Biały-Niebieski', 
    hue: 210,
    saturation: 100,
    description: 'Profesjonalny niebieski schemat'
  },
  {
    id: 'green',
    name: 'Biały-Zielony',
    hue: 120, 
    saturation: 100,
    description: 'Naturalny zielony schemat'
  },
  {
    id: 'red',
    name: 'Biały-Czerwony',
    hue: 0,
    saturation: 100,
    description: 'Energiczny czerwony schemat'
  },
  {
    id: 'purple',
    name: 'Biały-Fioletowy',
    hue: 270,
    saturation: 100,
    description: 'Kreatywny fioletowy schemat'
  },
  {
    id: 'brown',
    name: 'Biały-Brązowy',
    hue: 30,
    saturation: 60,
    description: 'Ciepły brązowy schemat'
  }
];

// Domyślne poziomy ciemności
export const DEFAULT_DARKNESS_LEVELS: DarknessLevels = {
  nordic1: 9,   // jasny
  nordic2: 27,
  nordic3: 42,
  nordic4: 60,
  nordic5: 78,
  nordic6: 96   // ciemny
};

// Funkcje pomocnicze
export class ColorUtils {
  /**
   * Generuje kolor HSL na podstawie odcienia, nasycenia i poziomu ciemności
   */
  static generateHSLColor(hue: number, saturation: number, darkness: number): string {
    const lightness = 100 - darkness;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Generuje kompletny zestaw kolorów na podstawie schematu i poziomów ciemności
   */
  static generateColorSet(scheme: ColorScheme, darkness: DarknessLevels): ColorSet {
    return {
      nordic1: this.generateHSLColor(scheme.hue, scheme.saturation, darkness.nordic1),
      nordic2: this.generateHSLColor(scheme.hue, scheme.saturation, darkness.nordic2),
      nordic3: this.generateHSLColor(scheme.hue, scheme.saturation, darkness.nordic3),
      nordic4: this.generateHSLColor(scheme.hue, scheme.saturation, darkness.nordic4),
      nordic5: this.generateHSLColor(scheme.hue, scheme.saturation, darkness.nordic5),
      nordic6: this.generateHSLColor(scheme.hue, scheme.saturation, darkness.nordic6),
    };
  }

  /**
   * Określa czy tekst powinien być jasny czy ciemny na danym tle
   */
  static getContrastTextColor(darkness: number): string {
    return darkness > 50 ? '#ffffff' : '#000000';
  }

  /**
   * Konwertuje ColorSet na CSS Variables
   */
  static generateCSSVariables(colors: ColorSet): string {
    return `:root {
  --nordic-1: ${colors.nordic1};
  --nordic-2: ${colors.nordic2};
  --nordic-3: ${colors.nordic3};
  --nordic-4: ${colors.nordic4};
  --nordic-5: ${colors.nordic5};
  --nordic-6: ${colors.nordic6};
}`;
  }

  /**
   * Generuje domyślne preferencje użytkownika
   */
  static createDefaultUserPreferences(userId: string): Omit<UserColorPreferences, 'id' | 'createdAt' | 'updatedAt'> {
    const defaultScheme = PREDEFINED_COLOR_SCHEMES[1]; // Niebieski
    const defaultDarkness = DEFAULT_DARKNESS_LEVELS;
    
    return {
      userId,
      schemeName: defaultScheme.name,
      colorScheme: defaultScheme,
      darknessLevels: defaultDarkness,
      customColors: this.generateColorSet(defaultScheme, defaultDarkness),
      isActive: true
    };
  }

  /**
   * Waliduje poziomy ciemności (muszą być w zakresie 5-95%)
   */
  static validateDarknessLevels(darkness: DarknessLevels): boolean {
    const values = Object.values(darkness);
    return values.every(value => value >= 5 && value <= 95);
  }

  /**
   * Sortuje poziomy ciemności od najjaśniejszego do najciemniejszego
   */
  static sortDarknessLevels(darkness: DarknessLevels): number[] {
    return [
      darkness.nordic1,
      darkness.nordic2,
      darkness.nordic3,
      darkness.nordic4,
      darkness.nordic5,
      darkness.nordic6
    ].sort((a, b) => a - b);
  }
}

// Typy dla API
export interface CreateColorPreferencesRequest {
  colorScheme: ColorScheme;
  darknessLevels: DarknessLevels;
}

export interface UpdateColorPreferencesRequest {
  schemeName?: string;
  colorScheme?: ColorScheme;
  darknessLevels?: DarknessLevels;
  isActive?: boolean;
}

export interface ColorPreferencesResponse {
  success: boolean;
  data?: UserColorPreferences;
  error?: string;
}
