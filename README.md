# Nordic GmbH Management System

Nowoczesny system zarządzania dla branży pracy tymczasowej z minimalistycznym systemem kolorów Nordic.

## 🎨 Nordic Color System

Aplikacja wykorzystuje spójny system kolorów oparty na trzech odcieniach niebieskiego:

- **Nordic Light** `#c8f1ff` - jasny niebieski dla tła i akcentów
- **Nordic Primary** `#168bd1` - główny niebieski dla przycisków i linków  
- **Nordic Dark** `#053a66` - ciemny niebieski dla tekstu i kontrastów

### Zalety systemu Nordic:
- ✅ **Minimalizm** - tylko 3 kolory w całej aplikacji
- ✅ **Spójność** - jednolity wygląd wszystkich komponentów
- ✅ **Dostępność** - wysokie kontrasty dla lepszej czytelności
- ✅ **Dark Mode** - automatyczne dostosowanie kolorów
- ✅ **Performance** - mniejsze pliki CSS

## 🚀 Quick Start

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie development
npm run dev

# Zbudowanie aplikacji
npm run build

# Uruchomienie produkcji
npm start
```

## 🎨 Komponenty UI

### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Akcja</Button>
<Button variant="secondary">Anuluj</Button>
<Button variant="outline">Więcej</Button>
<Button variant="ghost">Pomoc</Button>
```

### Card
```tsx
import { Card } from '@/components/ui';

<Card>Standardowa zawartość</Card>
<Card variant="accent">Wyróżniona zawartość</Card>
<Card variant="minimal">Minimalna zawartość</Card>
```

### Input
```tsx
import { Input } from '@/components/ui';

<Input label="Email" placeholder="wprowadź email" />
<Input error="Pole wymagane" />
<Input variant="minimal" />
```

## 🌙 Dark Mode

System automatycznie obsługuje tryb ciemny:
- Toggle button w headerze
- CSS variables dostosowują się automatycznie
- Wszystkie komponenty responsywne na zmiany

## 🏗️ Architektura

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # Komponenty UI z Nordic colors
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── NordicColorShowcase.tsx
│   ├── NordicSystemTest.tsx
│   ├── ResponsiveHeader.tsx
│   └── ThemeToggle.tsx
├── contexts/
│   └── ThemeContext.tsx   # Zarządzanie motywem
└── app/globals.css        # Nordic color variables
```

## 📖 Dokumentacja

Szczegółowa dokumentacja dostępna w:
- `/docs/nordic-colors.md` - Kompletny przewodnik po systemie kolorów
- Strona główna aplikacji - Prezentacja komponentów
- Komponenty zawierają inline dokumentację TypeScript

## 🎯 Features

- ✨ **Responsywny design** - działa na wszystkich urządzeniach
- 🎨 **Nordic color system** - spójny minimalistyczny design
- 🌙 **Dark/Light mode** - przełączanie motywów
- 📱 **Mobile-first** - priorytet dla urządzeń mobilnych
- ⚡ **Performance** - optymalizacja dla szybkości
- 🔒 **Type Safety** - pełne wsparcie TypeScript
- 📊 **Dashboard** - zaawansowane panele administracyjne
- 💬 **Real-time chat** - komunikacja w czasie rzeczywistym

## 🛠️ Technologie

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling z Nordic colors
- **Lucide Icons** - Konsystentne ikony
- **JWT Authentication** - Bezpieczna autoryzacja

## 📱 Responsive Design

System automatycznie dostosowuje się do:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)  
- 🖥️ Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🎨 Customization

Aby dostosować kolory Nordic:

```css
:root {
  --nordic-light: #c8f1ff;   /* Twój jasny niebieski */
  --nordic-primary: #168bd1; /* Twój główny niebieski */
  --nordic-dark: #053a66;    /* Twój ciemny niebieski */
}
```

## 📝 Contributing

1. Używaj tylko kolorów Nordic w całej aplikacji
2. Wszystkie komponenty muszą obsługiwać dark mode
3. Zachowuj spójność z istniejącymi komponentami UI
4. Testuj na urządzeniach mobilnych
5. Dokumentuj nowe komponenty

---

**Nordic GmbH Management System** - Minimalistyczny design dla maksymalnej efektywności 🚀
