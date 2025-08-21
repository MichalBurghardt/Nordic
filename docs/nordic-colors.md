# Nordic Color System - Dokumentacja

## Przegląd
System kolorów Nordic to minimalistyczne podejście do kolorystyki, wykorzystujące tylko 3 odcienie niebieskiego:

- **Nordic Light** (#c8f1ff) - Jasny niebieski dla tła i akcentów
- **Nordic Primary** (#168bd1) - Główny niebieski dla przycisków i linków  
- **Nordic Dark** (#053a66) - Ciemny niebieski dla tekstu i kontrastów

## Zastosowanie

### CSS Variables
System używa CSS variables dla spójności:

```css
:root {
  --nordic-light: #c8f1ff;
  --nordic-primary: #168bd1;
  --nordic-dark: #053a66;
}
```

### Tailwind Classes
Dostępne klasy Tailwind:

```css
/* Backgrounds */
.bg-nordic-light    /* #c8f1ff */
.bg-nordic-primary  /* #168bd1 */
.bg-nordic-dark     /* #053a66 */

/* Text Colors */
.text-nordic-light
.text-nordic-primary  
.text-nordic-dark

/* Border Colors */
.border-nordic-light
.border-nordic-primary
.border-nordic-dark
```

### Komponenty UI

#### Button
```tsx
import { Button } from '@/components/ui';

// Primary button (domyślny)
<Button>Akcja</Button>

// Secondary button
<Button variant="secondary">Anuluj</Button>

// Outline button  
<Button variant="outline">Więcej</Button>

// Ghost button
<Button variant="ghost">Pomoc</Button>
```

#### Card
```tsx
import { Card } from '@/components/ui';

// Standardowa karta
<Card>
  <h3>Tytuł</h3>
  <p>Zawartość karty</p>
</Card>

// Karta z akcentem
<Card variant="accent">
  <h3>Ważna informacja</h3>
</Card>

// Minimalna karta
<Card variant="minimal" padding="sm">
  <span>Proste zawartość</span>
</Card>
```

#### Input
```tsx
import { Input } from '@/components/ui';

// Standardowy input
<Input 
  label="Email"
  placeholder="wprowadź email"
  type="email"
/>

// Input z błędem
<Input 
  label="Hasło"
  type="password"
  error="Hasło jest wymagane"
/>

// Minimalny input
<Input 
  variant="minimal"
  placeholder="Szukaj..."
/>
```

## Dark Mode
System automatycznie dostosowuje się do dark mode:

- **Light mode**: Biały background, ciemny tekst
- **Dark mode**: Ciemny background, jasny tekst
- Kolory Nordic są odpowiednio odwrócone w dark mode

## Semantic Mapping

### Light Mode
- Background: white
- Text: nordic-dark
- Links/Buttons: nordic-primary
- Accents: nordic-light

### Dark Mode  
- Background: nordic-dark
- Text: nordic-light
- Links/Buttons: nordic-light
- Accents: nordic-primary

## Best Practices

1. **Używaj tylko kolorów Nordic** - unikaj dodawania innych kolorów
2. **Zachowaj kontrast** - zawsze sprawdzaj czytelność tekstu
3. **Consistent spacing** - używaj tych samych odstępów w całej aplikacji
4. **Test w obu trybach** - sprawdzaj light i dark mode
5. **Semantic colors** - używaj kolorów zgodnie z ich przeznaczeniem

## Komponenty globalne

### Klasy CSS ready-to-use
```css
.btn-primary {
  background: var(--nordic-primary);
  color: white;
  hover: var(--nordic-dark);
}

.card {
  background: white;
  border: 1px solid var(--nordic-light);
  dark: background var(--nordic-dark);
}
```

## Migration Guide

Jeśli migrujesz z innego systemu kolorów:

1. Zamień wszystkie `bg-blue-*` na `bg-nordic-*`
2. Zamień `text-gray-*` na `text-nordic-*`  
3. Używaj `border-nordic-*` zamiast `border-gray-*`
4. Testuj w dark mode po każdej zmianie

## Troubleshooting

**Problem**: Kolory nie zmieniają się w dark mode
**Rozwiązanie**: Sprawdź czy masz `dark:` prefiksy i czy HTML ma klasę `.dark`

**Problem**: Słaby kontrast
**Rozwiązanie**: Używaj nordic-dark dla tekstu na jasnym tle, nordic-light na ciemnym

**Problem**: Komponenty wyglądają płasko
**Rozwiązanie**: Dodaj cienie (`shadow-sm`, `shadow-md`) i hover effects
