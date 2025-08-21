'use client';

import { useState } from 'react';

export default function ColorTestPage() {
  // Stopnie ciemności (darkness) - od 9% do 96%
  const darknessLevels = [9, 27, 42, 60, 78, 96];

  const [selectedHue, setSelectedHue] = useState(210); // Domyślnie niebieski odcień
  const [selectedSaturation, setSelectedSaturation] = useState(100); // Domyślnie pełne nasycenie
  const [customDarkness, setCustomDarkness] = useState<{[key: number]: number}>({
    0: 9,   // Light
    1: 27,  // Medium-Light  
    2: 42,  // Medium
    3: 60,  // Primary
    4: 78,  // Medium-Dark
    5: 96   // Dark
  });

  // Funkcja do generowania koloru HSL z darkness (100 - darkness = lightness)
  const generateColor = (hue: number, saturation: number, darkness: number) => {
    const lightness = 100 - darkness;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Funkcja do określenia koloru tekstu (jasny/ciemny) na podstawie darkness
  const getTextColor = (darkness: number) => {
    return darkness > 50 ? '#fff' : '#000';
  };

  // Funkcja do aktualizacji wszystkich kolorów po zmianie hue lub saturation
  const updateAllColors = (newHue: number, newSaturation: number) => {
    setSelectedHue(newHue);
    setSelectedSaturation(newSaturation);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Test Kolorów Nordic System
        </h1>

        {/* Selektor koloru tęczowy */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Wybierz kolor z tęczy:</h2>
          
          {/* Tęczowy slider do wyboru odcienia (Hue) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Odcień (Hue): {selectedHue}°
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="360"
                value={selectedHue}
                onChange={(e) => updateAllColors(parseInt(e.target.value), selectedSaturation)}
                onInput={(e) => {
                  // Aktualizacja kółeczka w czasie rzeczywistym
                  const target = e.target as HTMLInputElement;
                  const thumb = target.nextElementSibling as HTMLElement;
                  if (thumb) {
                    const hue = parseInt(target.value);
                    thumb.style.left = `${(hue / 360) * 100}%`;
                    thumb.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
                  }
                }}
                className="w-full h-4 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 100%, 50%), hsl(30, 100%, 50%), hsl(60, 100%, 50%), hsl(90, 100%, 50%),
                    hsl(120, 100%, 50%), hsl(150, 100%, 50%), hsl(180, 100%, 50%), hsl(210, 100%, 50%),
                    hsl(240, 100%, 50%), hsl(270, 100%, 50%), hsl(300, 100%, 50%), hsl(330, 100%, 50%), hsl(360, 100%, 50%))`,
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              />
              {/* Okrągły wskaźnik w kolorze pozycji */}
              <div 
                className="absolute w-6 h-6 border-2 border-white rounded-full shadow-lg pointer-events-none"
                style={{ 
                  left: `${(selectedHue / 360) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `hsl(${selectedHue}, 100%, 50%)`
                }}
              />
            </div>
          </div>

          {/* Slider do nasycenia */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nasycenie (Saturation): {selectedSaturation}%
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={selectedSaturation}
                onChange={(e) => updateAllColors(selectedHue, parseInt(e.target.value))}
                onInput={(e) => {
                  // Aktualizacja kółeczka w czasie rzeczywistym
                  const target = e.target as HTMLInputElement;
                  const thumb = target.nextElementSibling as HTMLElement;
                  if (thumb) {
                    const saturation = parseInt(target.value);
                    thumb.style.left = `${saturation}%`;
                    thumb.style.backgroundColor = `hsl(${selectedHue}, ${saturation}%, 50%)`;
                  }
                }}
                className="w-full h-4 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${selectedHue}, 0%, 50%), hsl(${selectedHue}, 100%, 50%))`,
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              />
              {/* Okrągły wskaźnik w kolorze pozycji */}
              <div 
                className="absolute w-6 h-6 border-2 border-white rounded-full shadow-lg pointer-events-none"
                style={{ 
                  left: `${selectedSaturation}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `hsl(${selectedHue}, ${selectedSaturation}%, 50%)`
                }}
              />
            </div>
          </div>

          {/* Podgląd wybranego koloru */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-24 h-24 rounded-lg border-4 border-white shadow-lg"
                style={{ backgroundColor: `hsl(${selectedHue}, ${selectedSaturation}%, 50%)` }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Wybrany kolor</h3>
                <p className="text-gray-600">
                  HSL: {selectedHue}°, {selectedSaturation}%, 50%
                </p>
                <p className="text-sm text-gray-500 font-mono">
                  {`hsl(${selectedHue}, ${selectedSaturation}%, 50%)`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wybrany schemat - szczegóły */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Generowane odcienie kolorów
          </h2>
          <p className="text-gray-600 mb-4">
            Bazowy kolor: HSL({selectedHue}°, {selectedSaturation}%, 50%)
          </p>
        </div>

        {/* Próbki kolorów */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {darknessLevels.map((darkness, index) => {
            const actualDarkness = customDarkness[index] || darkness;
            const color = generateColor(selectedHue, selectedSaturation, actualDarkness);
            const textColor = getTextColor(actualDarkness);
            const colorName = `Nordic${index + 1}`;
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div 
                  className="h-32 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <span 
                    className="font-bold text-lg"
                    style={{ color: textColor }}
                  >
                    {colorName}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">{colorName}</p>
                  <p className="text-sm font-mono text-gray-600 mb-2">{color}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Darkness: {actualDarkness}%
                  </p>
                  {/* Manualne ustawianie wartości */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={actualDarkness}
                      onChange={(e) => {
                        const newDarkness = parseInt(e.target.value);
                        setCustomDarkness(prev => ({
                          ...prev,
                          [index]: newDarkness
                        }));
                      }}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="5"
                      max="95"
                      value={actualDarkness}
                      onChange={(e) => {
                        const newDarkness = parseInt(e.target.value) || darkness;
                        setCustomDarkness(prev => ({
                          ...prev,
                          [index]: Math.max(5, Math.min(95, newDarkness))
                        }));
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Przykładowe komponenty UI */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Przykłady zastosowania:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Przykład 1: Karty */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Karty</h3>
              {[9, 27, 42].map((darkness, index) => {
                const actualDarkness = customDarkness[index] || darkness;
                const bgColor = generateColor(selectedHue, selectedSaturation, actualDarkness);
                const textColor = getTextColor(actualDarkness);
                
                return (
                  <div 
                    key={actualDarkness}
                    className="p-6 rounded-lg shadow-md"
                    style={{ backgroundColor: bgColor }}
                  >
                    <h4 
                      className="text-lg font-semibold mb-2"
                      style={{ color: textColor }}
                    >
                      Karta {actualDarkness}%
                    </h4>
                    <p 
                      className="text-sm opacity-80"
                      style={{ color: textColor }}
                    >
                      Przykładowy tekst w karcie z ciemnością {actualDarkness}%
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Przykład 2: Przyciski */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Przyciski</h3>
              {[60, 78, 96].map((darkness, index) => {
                const actualDarkness = customDarkness[index + 3] || darkness;
                const bgColor = generateColor(selectedHue, selectedSaturation, actualDarkness);
                const textColor = getTextColor(actualDarkness);
                
                return (
                  <button 
                    key={actualDarkness}
                    className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: bgColor,
                      color: textColor 
                    }}
                  >
                    Przycisk {actualDarkness}%
                  </button>
                );
              })}
            </div>

            {/* Przykład 3: Navigation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Navigation</h3>
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: generateColor(selectedHue, selectedSaturation, customDarkness[5] || 96)
                }}
              >
                <nav className="flex space-x-4">
                  {['Home', 'About', 'Contact'].map((item) => {
                    const navDarkness = customDarkness[4] || 78;
                    return (
                      <a 
                        key={item}
                        href="#"
                        className="px-3 py-2 rounded hover:opacity-80 transition-opacity"
                        style={{ 
                          backgroundColor: generateColor(selectedHue, selectedSaturation, navDarkness),
                          color: getTextColor(navDarkness)
                        }}
                      >
                        {item}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Kod CSS do skopiowania */}
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">CSS Variables dla tego schematu:</h3>
          <pre className="text-sm overflow-x-auto">
{`:root {
  --nordic-1: ${generateColor(selectedHue, selectedSaturation, customDarkness[0] || 9)};
  --nordic-2: ${generateColor(selectedHue, selectedSaturation, customDarkness[1] || 27)};
  --nordic-3: ${generateColor(selectedHue, selectedSaturation, customDarkness[2] || 42)};
  --nordic-4: ${generateColor(selectedHue, selectedSaturation, customDarkness[3] || 60)};
  --nordic-5: ${generateColor(selectedHue, selectedSaturation, customDarkness[4] || 78)};
  --nordic-6: ${generateColor(selectedHue, selectedSaturation, customDarkness[5] || 96)};
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
