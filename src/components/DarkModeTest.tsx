// Test czy dark mode działa - można usunąć ten plik po testach
import React from 'react';

export default function DarkModeTest() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Dark Mode Test
      </h1>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded border">
        <p className="text-gray-600 dark:text-gray-300">
          To jest test dark mode. W trybie jasnym powinno być białe tło,
          w trybie ciemnym - ciemno szare.
        </p>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <p className="text-gray-800 dark:text-gray-200">
          Ten div powinien zmienić kolor tła w dark mode.
        </p>
      </div>
    </div>
  );
}
