# Nordic Theme Toggle Components

## Przegląd

Aplikacja zawiera teraz trzy różne komponenty do przełączania motywów, wszystkie używające systemu kolorów Nordic:

## 1. SimpleThemeToggle
**Plik**: `src/components/SimpleThemeToggle.tsx`
**Przeznaczenie**: Prosty toggle dla stron bez ThemeContext

```tsx
import SimpleThemeToggle from '@/components/SimpleThemeToggle';
<SimpleThemeToggle />
```

**Cechy**:
- Bezpośrednie zarządzanie localStorage
- Brak zależności od React Context
- Idealne dla stron publicznych

## 2. ThemeToggle  
**Plik**: `src/components/ThemeToggle.tsx`
**Przeznaczenie**: Standardowy toggle używający ThemeContext

```tsx
import ThemeToggle from '@/components/ThemeToggle';
<ThemeToggle />
```

**Cechy**:
- Używa React Context API
- Synchronizacja między komponentami
- Idealny dla aplikacji z wieloma komponentami

## 3. AdvancedThemeToggle ⭐
**Plik**: `src/components/AdvancedThemeToggle.tsx` 
**Przeznaczenie**: Zaawansowany toggle z animacjami i tooltip

```tsx
import AdvancedThemeToggle from '@/components/AdvancedThemeToggle';
<AdvancedThemeToggle />
```

**Cechy**:
- ✨ Animowany slider z płynnym przejściem
- 🎨 Pełna integracja z kolorami Nordic
- 📱 Responsive design
- 💡 Tooltip z opisem
- 🔄 Efekt hover ze scale
- 🎯 Focus states z ring

## Kolory Nordic w Toggle

### Light Mode:
- **Background**: `bg-nordic-light` (#c8f1ff)
- **Slider**: `bg-nordic-primary` (#168bd1)  
- **Icons**: `text-nordic-primary` / `text-nordic-dark`

### Dark Mode:
- **Background**: `bg-nordic-dark` (#053a66)
- **Slider**: `bg-nordic-primary` (#168bd1)
- **Icons**: `text-nordic-light` (#c8f1ff)

### Hover States:
- **Scale**: `hover:scale-105`
- **Background**: Zmiana na przeciwny kolor Nordic
- **Tooltip**: Pojawia się z opisem

## Animacje

```css
/* Główne przejścia */
transition-all duration-300 ease-in-out

/* Slider */
transform translate-x-0 -> translate-x-6

/* Icons */
opacity-0 scale-75 -> opacity-100 scale-100

/* Tooltip */
opacity-0 -> opacity-100 (hover)
```

## Użycie w Aplikacji

- **Strona główna**: `AdvancedThemeToggle`
- **ResponsiveHeader**: `AdvancedThemeToggle` 
- **Dashboard**: `ThemeToggle` (z Context)
- **Login/Register**: `SimpleThemeToggle`

## Customization

Aby dostosować toggle:

```tsx
// Zmiana kolorów
className="bg-your-color hover:bg-your-hover-color"

// Zmiana rozmiaru
className="w-16 h-8" // większy slider

// Dodanie własnych ikon
<YourIcon className="w-4 h-4" />
```

**Rekomendacja**: Używaj `AdvancedThemeToggle` dla najlepszego UX! 🚀
