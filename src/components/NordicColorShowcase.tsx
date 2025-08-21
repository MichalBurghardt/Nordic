'use client';

import React from 'react';

export const NordicColorShowcase: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-nordic-light mb-2">
          Nordic Minimalist Color System
        </h1>
        <p className="text-nordic-primary">
          Trzy kolory: Light (#c8f1ff), Primary (#168bd1), Dark (#053a66)
        </p>
      </div>

      {/* Color Palette Display */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-20 h-20 bg-nordic-light rounded-lg mx-auto mb-4 border-2 border-nordic-primary"></div>
          <h3 className="font-semibold text-nordic-dark dark:text-nordic-light">Nordic Light</h3>
          <p className="text-sm text-nordic-primary">#c8f1ff</p>
          <p className="text-xs mt-2 text-nordic-primary">Tła i akcenty</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-20 h-20 bg-nordic-primary rounded-lg mx-auto mb-4"></div>
          <h3 className="font-semibold text-nordic-dark dark:text-nordic-light">Nordic Primary</h3>
          <p className="text-sm text-nordic-primary">#168bd1</p>
          <p className="text-xs mt-2 text-nordic-primary">Przyciski i linki</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-20 h-20 bg-nordic-dark rounded-lg mx-auto mb-4"></div>
          <h3 className="font-semibold text-nordic-dark dark:text-nordic-light">Nordic Dark</h3>
          <p className="text-sm text-nordic-primary">#053a66</p>
          <p className="text-xs mt-2 text-nordic-primary">Tekst i kontrasty</p>
        </div>
      </div>

      {/* Interactive Components */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-nordic-dark dark:text-nordic-light">
          Komponenty interaktywne
        </h2>

        {/* Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nordic-primary">Przyciski</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary px-6 py-2 rounded-lg font-medium">
              Przycisk Primary
            </button>
            <button className="bg-nordic-light text-nordic-dark px-6 py-2 rounded-lg font-medium border border-nordic-primary hover:bg-nordic-primary hover:text-white transition-all">
              Przycisk Secondary
            </button>
            <button className="bg-transparent text-nordic-primary px-6 py-2 rounded-lg font-medium border border-nordic-primary hover:bg-nordic-primary hover:text-white transition-all">
              Przycisk Outline
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nordic-primary">Karty</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-6">
              <h4 className="font-semibold text-nordic-dark dark:text-nordic-light mb-2">
                Przykładowa karta
              </h4>
              <p className="text-nordic-primary mb-4">
                To jest przykład karty z nowym systemem kolorów Nordic.
              </p>
              <button className="btn-primary px-4 py-2 rounded text-sm">
                Akcja
              </button>
            </div>
            <div className="card p-6 bg-nordic-light dark:bg-nordic-dark">
              <h4 className="font-semibold text-nordic-dark dark:text-nordic-light mb-2">
                Karta z akcentem
              </h4>
              <p className="text-nordic-primary mb-4">
                Karta z kolorowym tłem dla wyróżnienia.
              </p>
              <button className="bg-nordic-primary text-white px-4 py-2 rounded text-sm hover:bg-nordic-dark transition-all">
                Akcja
              </button>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nordic-primary">Elementy formularza</h3>
          <div className="space-y-4 max-w-md">
            <input 
              type="text" 
              placeholder="Wprowadź tekst"
              className="w-full px-4 py-2 border border-nordic-light rounded-lg focus:border-nordic-primary focus:outline-none focus:ring-2 focus:ring-nordic-light bg-white dark:bg-nordic-dark dark:text-nordic-light"
            />
            <select className="w-full px-4 py-2 border border-nordic-light rounded-lg focus:border-nordic-primary focus:outline-none bg-white dark:bg-nordic-dark dark:text-nordic-light">
              <option>Wybierz opcję</option>
              <option>Opcja 1</option>
              <option>Opcja 2</option>
            </select>
            <textarea 
              placeholder="Wprowadź opis"
              rows={4}
              className="w-full px-4 py-2 border border-nordic-light rounded-lg focus:border-nordic-primary focus:outline-none focus:ring-2 focus:ring-nordic-light bg-white dark:bg-nordic-dark dark:text-nordic-light"
            />
          </div>
        </div>

        {/* Alerts/Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-nordic-primary">Powiadomienia</h3>
          <div className="space-y-3">
            <div className="p-4 bg-nordic-light dark:bg-nordic-dark border-l-4 border-nordic-primary rounded">
              <p className="text-nordic-dark dark:text-nordic-light">
                <strong>Info:</strong> To jest przykładowe powiadomienie informacyjne.
              </p>
            </div>
            <div className="p-4 bg-nordic-primary text-white rounded">
              <p>
                <strong>Sukces:</strong> Operacja zakończona pomyślnie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NordicColorShowcase;
