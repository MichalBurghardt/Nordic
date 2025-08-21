'use client';

import React from 'react';
import { Button, Card, Input } from '@/components/ui';
import { Sun, Moon, Palette } from 'lucide-react';

export const NordicSystemTest: React.FC = () => {
  const testDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    console.log('Dark mode toggled, HTML classes:', html.className);
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light mb-2">
          Nordic System Test
        </h1>
        <p className="text-nordic-primary mb-6">
          Test wszystkich komponentów z systemem kolorów Nordic
        </p>
        
        <Button 
          onClick={testDarkMode}
          icon={Sun}
          variant="outline"
          className="mb-8"
        >
          Toggle Dark Mode
        </Button>
      </div>

      {/* Colors Display */}
      <Card variant="accent" className="p-6">
        <h2 className="text-xl font-semibold text-nordic-dark dark:text-nordic-light mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Kolory Nordic
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-nordic-light rounded-lg mx-auto mb-2 border-2 border-nordic-primary"></div>
            <p className="text-sm font-medium text-nordic-dark dark:text-nordic-light">Light</p>
            <p className="text-xs text-nordic-primary">#c8f1ff</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-nordic-primary rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium text-nordic-dark dark:text-nordic-light">Primary</p>
            <p className="text-xs text-nordic-primary">#168bd1</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-nordic-dark rounded-lg mx-auto mb-2"></div>
            <p className="text-sm font-medium text-nordic-dark dark:text-nordic-light">Dark</p>
            <p className="text-xs text-nordic-primary">#053a66</p>
          </div>
        </div>
      </Card>

      {/* Buttons Test */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-nordic-dark dark:text-nordic-light mb-4">
          Przyciski
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="primary" size="sm">Primary SM</Button>
          <Button variant="secondary" size="md">Secondary MD</Button>
          <Button variant="outline" size="lg">Outline LG</Button>
          <Button variant="ghost" icon={Moon}>Ghost + Icon</Button>
        </div>
      </Card>

      {/* Inputs Test */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-nordic-dark dark:text-nordic-light mb-4">
          Pola formularza
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Input 
            label="Standardowy input"
            placeholder="Wprowadź tekst"
            helperText="To jest tekst pomocniczy"
          />
          
          <Input 
            label="Input z błędem"
            placeholder="Wprowadź email"
            error="Email jest wymagany"
            type="email"
          />
          
          <Input 
            variant="minimal"
            placeholder="Minimalny input"
            size="lg"
          />
          
          <Input 
            label="Mały input"
            placeholder="Krótki tekst"
            size="sm"
          />
        </div>
      </Card>

      {/* Cards Showcase */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="default" className="p-4">
          <h3 className="font-semibold text-nordic-dark dark:text-nordic-light mb-2">
            Standardowa karta
          </h3>
          <p className="text-nordic-primary text-sm mb-3">
            To jest przykład standardowej karty z Nordic colors.
          </p>
          <Button size="sm" variant="primary">Akcja</Button>
        </Card>

        <Card variant="accent" className="p-4">
          <h3 className="font-semibold text-nordic-dark dark:text-nordic-light mb-2">
            Karta z akcentem
          </h3>
          <p className="text-nordic-primary text-sm mb-3">
            Karta z kolorowym tłem dla wyróżnienia treści.
          </p>
          <Button size="sm" variant="secondary">Więcej</Button>
        </Card>

        <Card variant="minimal" className="p-4 border border-nordic-primary">
          <h3 className="font-semibold text-nordic-dark dark:text-nordic-light mb-2">
            Minimalna karta
          </h3>
          <p className="text-nordic-primary text-sm mb-3">
            Przezroczysta karta z minimalnym stylem.
          </p>
          <Button size="sm" variant="outline">Sprawdź</Button>
        </Card>
      </div>

      {/* Status Info */}
      <Card className="p-4 bg-nordic-light dark:bg-nordic-primary">
        <div className="text-center">
          <h3 className="font-semibold text-nordic-dark dark:text-nordic-light">
            ✅ System Nordic gotowy!
          </h3>
          <p className="text-nordic-primary dark:text-nordic-light text-sm mt-1">
            Wszystkie komponenty używają ujednoliconego systemu kolorów z 3 odcieniami niebieskiego.
            Sprawdź przełączanie dark/light mode!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NordicSystemTest;
