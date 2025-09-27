'use client';

import React from 'react';
import { cn } from '@/utils/helpers';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export default function Icon({ name, size = 'md', className, color }: IconProps) {
  const sizeClass = iconSizes[size];
  
  // 아이콘 매핑 (Heroicons 기반)
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Navigation
    'home': require('@heroicons/react/24/outline').HomeIcon,
    'map': require('@heroicons/react/24/outline').MapIcon,
    'search': require('@heroicons/react/24/outline').MagnifyingGlassIcon,
    'menu': require('@heroicons/react/24/outline').Bars3Icon,
    'close': require('@heroicons/react/24/outline').XMarkIcon,
    
    // Actions
    'plus': require('@heroicons/react/24/outline').PlusIcon,
    'minus': require('@heroicons/react/24/outline').MinusIcon,
    'edit': require('@heroicons/react/24/outline').PencilIcon,
    'delete': require('@heroicons/react/24/outline').TrashIcon,
    'save': require('@heroicons/react/24/outline').BookmarkIcon,
    
    // Status
    'check': require('@heroicons/react/24/outline').CheckCircleIcon,
    'warning': require('@heroicons/react/24/outline').ExclamationTriangleIcon,
    'info': require('@heroicons/react/24/outline').InformationCircleIcon,
    'error': require('@heroicons/react/24/outline').XCircleIcon,
    
    // UI
    'arrow-right': require('@heroicons/react/24/outline').ArrowRightIcon,
    'arrow-left': require('@heroicons/react/24/outline').ArrowLeftIcon,
    'arrow-up': require('@heroicons/react/24/outline').ArrowUpIcon,
    'arrow-down': require('@heroicons/react/24/outline').ArrowDownIcon,
    'chevron-right': require('@heroicons/react/24/outline').ChevronRightIcon,
    'chevron-left': require('@heroicons/react/24/outline').ChevronLeftIcon,
    
    // Location
    'location': require('@heroicons/react/24/outline').MapPinIcon,
    'marker': require('@heroicons/react/24/outline').MapPinIcon,
    
    // Time
    'clock': require('@heroicons/react/24/outline').ClockIcon,
    'calendar': require('@heroicons/react/24/outline').CalendarIcon,
    
    // Weather/Air Quality
    'sun': require('@heroicons/react/24/outline').SunIcon,
    'moon': require('@heroicons/react/24/outline').MoonIcon,
    'heart': require('@heroicons/react/24/outline').HeartIcon,
    
    // Settings
    'settings': require('@heroicons/react/24/outline').Cog6ToothIcon,
    'bell': require('@heroicons/react/24/outline').BellIcon,
    'user': require('@heroicons/react/24/outline').UserIcon,
    'star': require('@heroicons/react/24/outline').StarIcon,
    
    // Media
    'play': require('@heroicons/react/24/outline').PlayIcon,
    'pause': require('@heroicons/react/24/outline').PauseIcon,
    'stop': require('@heroicons/react/24/outline').StopIcon,
  };

  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return <div className={cn(sizeClass, className)} />;
  }

  return (
    <IconComponent 
      className={cn(sizeClass, className)} 
      style={color ? { color } : undefined}
    />
  );
}
