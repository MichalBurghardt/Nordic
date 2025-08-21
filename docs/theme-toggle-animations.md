# Nordic Theme Toggle - Animacje ikon

## Aktualizacja kolorów animacji

### Logika kolorów:

#### 🌞 Słoneczko (Sun icon):
- **Active (light mode)**: `text-nordic-dark` (#053a66) - ciemny niebieski dla kontrastu
- **Hidden (dark mode)**: `text-nordic-primary` (#168bd1) - średni niebieski w stanie ukrytym

#### 🌙 Księżyc (Moon icon):
- **Hidden (light mode)**: `text-nordic-dark` (#053a66) - ciemny niebieski w stanie ukrytym

### Implementacja w komponentach:

#### 1. ThemeToggle & SimpleThemeToggle:
```tsx
<Sun className={`... ${
  theme === 'light' 
    ? 'opacity-100 rotate-0 scale-100 text-nordic-dark'    // Aktywne: ciemny niebieski
    : 'opacity-0 rotate-90 scale-75 text-nordic-primary'   // Ukryte: średni niebieski
}`} />

<Moon className={`... ${
  theme === 'dark' 
    ? 'opacity-100 rotate-0 scale-100 text-white'       // Aktywne: białe dla maksymalnego kontrastu
    : 'opacity-0 -rotate-90 scale-75 text-nordic-dark'  // Ukryte: ciemny niebieski
}`} />
```

#### 2. AdvancedThemeToggle:
```tsx
<Sun className={`... ${
  theme === 'light' 
    ? 'opacity-100 scale-100 text-nordic-dark'     // Aktywne na slideru
    : 'opacity-0 scale-75 text-nordic-light'       // Ukryte
}`} />

<Moon className={`... ${
  theme === 'dark' 
    ? 'opacity-100 scale-100 text-white'        // Aktywne na slideru - białe
    : 'opacity-0 scale-75 text-nordic-primary'  // Ukryte
}`} />
```

### Efekt wizualny:

#### Light Mode:
- Słoneczko jest **ciemno-niebieskie** (#053a66) - wyraźnie widoczne na jasnym tle
- Księżyc zanika jako **ciemno-niebieski** - płynne przejście

#### Dark Mode:
- Księżyc jest **biały** (#ffffff) - maksymalny kontrast na ciemnym tle Nordic
- Słoneczko zanika jako **jasno-niebieski** - eleganckie przejście

### Animacje:

- **Duration**: `300ms` - płynne ale szybkie przejście
- **Rotate**: `90deg` / `-90deg` - efekt obracania podczas zmiany
- **Scale**: `100%` → `75%` - subtelny efekt powiększenia/pomniejszenia
- **Opacity**: `100%` → `0%` - płynne zanikanie/pojawianie

### Design rationale:

1. **Kontrast**: Aktywne ikony zawsze mają dobry kontrast z tłem
2. **Spójność**: Wszystkie kolory z palety Nordic
3. **Intuicyjność**: Jasne ikony w dark mode, ciemne w light mode
4. **Płynność**: Smooth transitions bez jarring color jumps

**Rezultat**: Piękne, intuicyjne animacje w pełni zintegrowane z systemem kolorów Nordic! 🎨✨
