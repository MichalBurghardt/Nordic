// Model dla systemu czcionek

export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  description: string;
  googleFont?: boolean;
  fallback: string;
}

export interface FontSettings {
  primaryFont: FontOption;
  headingFont: FontOption;
  bodyFont: FontOption;
  codeFont: FontOption;
}

// Popularne czcionki Google Fonts + systemowe
export const AVAILABLE_FONTS: FontOption[] = [
  // Sans-serif
  {
    id: 'inter',
    name: 'Inter',
    fontFamily: 'Inter',
    category: 'sans-serif',
    description: 'Nowoczesna, czytelna czcionka zaprojektowana dla interfejsów',
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    fontFamily: 'Poppins',
    category: 'sans-serif',
    description: 'Geometryczna czcionka o przyjaznym charakterze',
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    fontFamily: 'Roboto',
    category: 'sans-serif',
    description: 'Uniwersalna czcionka Google o wysokiej czytelności',
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    fontFamily: 'Open Sans',
    category: 'sans-serif',
    description: 'Klasyczna czcionka humanistyczna',
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'nunito',
    name: 'Nunito',
    fontFamily: 'Nunito',
    category: 'sans-serif',
    description: 'Zaokrąglona czcionka o przyjaznym wyglądzie',
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },

  // Serif
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    fontFamily: 'Playfair Display',
    category: 'serif',
    description: 'Elegancka czcionka z wysokim kontrastem, idealna na nagłówki',
    googleFont: true,
    fallback: 'Georgia, serif'
  },
  {
    id: 'lora',
    name: 'Lora',
    fontFamily: 'Lora',
    category: 'serif',
    description: 'Czytelna czcionka serif o ciepłym charakterze',
    googleFont: true,
    fallback: 'Georgia, serif'
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    fontFamily: 'Merriweather',
    category: 'serif',
    description: 'Zaprojektowana dla długich tekstów na ekranach',
    googleFont: true,
    fallback: 'Georgia, serif'
  },

  // Display/Dekoracyjne
  {
    id: 'montserrat',
    name: 'Montserrat',
    fontFamily: 'Montserrat',
    category: 'display',
    description: 'Mocna czcionka inspirowana plakatami z Buenos Aires',
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'oswald',
    name: 'Oswald',
    fontFamily: 'Oswald',
    category: 'display',
    description: 'Kondensowana czcionka o silnym charakterze',
    googleFont: true,
    fallback: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    fontFamily: 'Dancing Script',
    category: 'handwriting',
    description: 'Czcionka naśladująca odręczne pismo',
    googleFont: true,
    fallback: 'cursive'
  },

  // Monospace
  {
    id: 'fira-code',
    name: 'Fira Code',
    fontFamily: 'Fira Code',
    category: 'monospace',
    description: 'Czcionka dla programistów z ligaturami',
    googleFont: true,
    fallback: 'Monaco, Consolas, monospace'
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    fontFamily: 'JetBrains Mono',
    category: 'monospace',
    description: 'Zaprojowana specjalnie dla developerów',
    googleFont: true,
    fallback: 'Monaco, Consolas, monospace'
  },

  // Systemowe
  {
    id: 'system-ui',
    name: 'System UI',
    fontFamily: 'system-ui',
    category: 'sans-serif',
    description: 'Domyślna czcionka systemowa',
    googleFont: false,
    fallback: '-apple-system, BlinkMacSystemFont, sans-serif'
  },
  {
    id: 'georgia',
    name: 'Georgia',
    fontFamily: 'Georgia',
    category: 'serif',
    description: 'Klasyczna czcionka systemowa serif',
    googleFont: false,
    fallback: 'Times, serif'
  }
];

export class FontUtils {
  // Generowanie CSS font-family z fallbackiem
  static generateFontFamily(font: FontOption): string {
    if (font.googleFont) {
      return `"${font.fontFamily}", ${font.fallback}`;
    }
    return `${font.fontFamily}, ${font.fallback}`;
  }

  // Generowanie URL do Google Fonts
  static generateGoogleFontsUrl(fonts: FontOption[]): string {
    const googleFonts = fonts.filter(font => font.googleFont);
    if (googleFonts.length === 0) return '';

    const fontFamilies = googleFonts
      .map(font => font.fontFamily.replace(' ', '+'))
      .join('&family=');

    return `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;
  }

  // Pobieranie czcionki po ID
  static getFontById(id: string): FontOption | undefined {
    return AVAILABLE_FONTS.find(font => font.id === id);
  }

  // Filtrowanie czcionek po kategorii
  static getFontsByCategory(category: FontOption['category']): FontOption[] {
    return AVAILABLE_FONTS.filter(font => font.category === category);
  }

  // Generowanie CSS zmiennych dla czcionek
  static generateFontCSSVariables(fontSettings: FontSettings): string {
    return `
      --font-primary: ${FontUtils.generateFontFamily(fontSettings.primaryFont)};
      --font-heading: ${FontUtils.generateFontFamily(fontSettings.headingFont)};
      --font-body: ${FontUtils.generateFontFamily(fontSettings.bodyFont)};
      --font-code: ${FontUtils.generateFontFamily(fontSettings.codeFont)};
    `.trim();
  }

  // Domyślne ustawienia czcionek
  static getDefaultFontSettings(): FontSettings {
    return {
      primaryFont: AVAILABLE_FONTS.find(f => f.id === 'inter')!,
      headingFont: AVAILABLE_FONTS.find(f => f.id === 'montserrat')!,
      bodyFont: AVAILABLE_FONTS.find(f => f.id === 'open-sans')!,
      codeFont: AVAILABLE_FONTS.find(f => f.id === 'fira-code')!
    };
  }
}
