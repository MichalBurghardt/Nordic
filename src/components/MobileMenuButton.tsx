'use client';

import { Menu } from 'lucide-react';

interface MobileMenuButtonProps {
  onToggle: () => void;
}

export default function MobileMenuButton({ onToggle }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-nordic-primary text-white rounded-lg shadow-lg"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
