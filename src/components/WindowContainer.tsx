'use client';

import { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, Move, Minimize2 } from 'lucide-react';

interface WindowContainerProps {
  title: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultX?: number;
  defaultY?: number;
  onClose?: () => void;
}

export default function WindowContainer({
  title,
  children,
  defaultWidth = 800,
  defaultHeight = 600,
  defaultX = 100,
  defaultY = 100,
  onClose
}: WindowContainerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [lastPosition, setLastPosition] = useState({ x: defaultX, y: defaultY });
  const [lastSize, setLastSize] = useState({ width: defaultWidth, height: defaultHeight });
  
  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);

  // Minimalizacja
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Maksymalizacja/przywracanie
  const handleMaximize = () => {
    if (isMaximized) {
      // Przywróć poprzedni rozmiar i pozycję
      setPosition(lastPosition);
      setSize(lastSize);
      setIsMaximized(false);
    } else {
      // Zapisz obecne wartości
      setLastPosition(position);
      setLastSize(size);
      // Maksymalizuj
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMaximized(true);
    }
  };

  // Zamknięcie
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Przeciąganie
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, isMaximized]);

  // Obsługa podwójnego kliknięcia na pasek tytułowy
  const handleDoubleClick = () => {
    handleMaximize();
  };

  const windowStyle = isMaximized
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
      }
    : {
        position: 'fixed' as const,
        top: position.y,
        left: position.x,
        width: size.width,
        height: isMinimized ? 40 : size.height,
        zIndex: 1000,
      };

  return (
    <div
      ref={windowRef}
      style={windowStyle}
      className={`bg-white border border-gray-300 shadow-2xl rounded-lg overflow-hidden transition-all duration-200 ${
        isDragging ? 'cursor-move' : ''
      }`}
    >
      {/* Pasek tytułowy */}
      <div
        ref={titleBarRef}
        className="bg-gradient-to-r from-nordic-primary to-nordic-dark h-10 flex items-center justify-between px-4 cursor-move select-none"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
            <Move className="w-2 h-2 text-white" />
          </div>
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        
        {/* Przyciski kontrolne */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleMinimize}
            className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors"
            title="Minimalizuj"
          >
            <Minus className="w-3 h-3 text-white" />
          </button>
          
          <button
            onClick={handleMaximize}
            className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors"
            title={isMaximized ? "Przywróć" : "Maksymalizuj"}
          >
            {isMaximized ? (
              <Minimize2 className="w-3 h-3 text-white" />
            ) : (
              <Square className="w-3 h-3 text-white" />
            )}
          </button>
          
          <button
            onClick={handleClose}
            className="w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded flex items-center justify-center transition-colors"
            title="Zamknij"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {/* Zawartość okna */}
      {!isMinimized && (
        <div className="h-full overflow-hidden">
          <div className="h-full overflow-y-auto p-0">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
