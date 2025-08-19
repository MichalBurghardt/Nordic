import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  gray: 'text-gray-600'
};

export default function Icon({ 
  icon: IconComponent, 
  size = 'md', 
  color = 'gray', 
  className = '' 
}: IconProps) {
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];
  
  return (
    <IconComponent 
      className={`${sizeClass} ${colorClass} ${className}`} 
    />
  );
}

// Wrapper dla ikon w kolorowych kółkach (jak w dashboardach)
interface IconBadgeProps {
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const badgeColors = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  yellow: 'bg-yellow-100',
  purple: 'bg-purple-100',
  red: 'bg-red-100'
};

export function IconBadge({ 
  icon: IconComponent, 
  color = 'blue', 
  size = 'md' 
}: IconBadgeProps) {
  const badgeClass = badgeColors[color];
  const iconColor = color as keyof typeof colorClasses;
  const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  
  return (
    <div className={`p-3 rounded-full ${badgeClass}`}>
      <Icon icon={IconComponent} size={iconSize} color={iconColor} />
    </div>
  );
}
