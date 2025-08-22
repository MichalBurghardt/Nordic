/**
 * GLOBALNE KOMPONENTY RESPONSYWNE
 * 
 * Te komponenty zapewniają spójną responsywność w całej aplikacji Nordic.
 * Wszystkie komponenty automatycznie dostosowują się do różnych rozmiarów ekranów.
 */

// PRZYKŁADY UŻYCIA:

/*
1. ResponsiveContainer - Globalny kontener
======================================

import ResponsiveContainer from '@/components/ResponsiveContainer';

<ResponsiveContainer maxWidth="xl" padding="md">
  <h1>Moja strona</h1>
  <p>Zawartość</p>
</ResponsiveContainer>

Props:
- maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- padding: 'none' | 'sm' | 'md' | 'lg'
*/

/*
2. ResponsiveCard - Responsywne karty
====================================

import ResponsiveCard from '@/components/ResponsiveCard';

<ResponsiveCard padding="md" shadow="lg" hover={true}>
  <h3>Tytuł karty</h3>
  <p>Zawartość karty</p>
</ResponsiveCard>

Props:
- padding: 'sm' | 'md' | 'lg'
- shadow: 'sm' | 'md' | 'lg' | 'xl' | 'none'
- hover: boolean
*/

/*
3. ResponsiveButton - Responsywne przyciski
==========================================

import ResponsiveButton from '@/components/ResponsiveButton';

<ResponsiveButton 
  variant="primary" 
  size="md" 
  onClick={() => console.log('Clicked')}
  loading={false}
  fullWidth={false}
>
  Kliknij mnie
</ResponsiveButton>

Props:
- variant: 'primary' | 'secondary' | 'outline' | 'ghost'
- size: 'sm' | 'md' | 'lg'
- loading: boolean
- fullWidth: boolean
*/

/*
4. ResponsiveInput - Responsywne pola formularza
===============================================

import ResponsiveInput from '@/components/ResponsiveInput';

<ResponsiveInput
  name="email"
  type="email"
  label="E-Mail Adresse"
  placeholder="ihre.email@beispiel.de"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required={true}
  error={emailError}
  helpText="Wir werden Ihre E-Mail niemals weitergeben"
/>

Props:
- label: string
- error: string  
- helpText: string
- required: boolean
- wszystkie standardowe props HTML input
*/

/*
5. AdminPageContainer - Poprawiony kontener admin
================================================

import AdminPageContainer from '@/components/AdminPageContainer';

<AdminPageContainer maxWidth="xl" padding="md">
  <h1>Admin Panel</h1>
  // Zawartość strony admin
</AdminPageContainer>

Props:
- maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- padding: 'none' | 'sm' | 'md' | 'lg'
*/

/*
6. GLOBALNE KLASY CSS
=====================

W globals.css dodane zostały użyteczne klasy:

.responsive-container    - Uniwersalny kontener
.responsive-text-*       - Skalowalne rozmiary tekstu
.responsive-p-*          - Responsywne padding
.responsive-input        - Stylowane inputy
.responsive-btn          - Stylowane przyciski  
.responsive-card         - Stylowane karty

BREAKPOINTY:
- Mobile: < 640px
- Tablet: 640px - 1023px  
- Desktop: 1024px+
*/

/*
7. LAYOUT GŁÓWNY
===============

W layout.tsx dodano:
- Viewport meta tag dla mobile
- Theme color
- Apple mobile web app meta
- Overflow-x: hidden dla stabilności
- Responsive klasy Nordic

*/

export {};
