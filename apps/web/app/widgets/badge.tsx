import React, { ReactNode } from 'react';
import { Shimmer } from '@/app/widgets/shimmer';
import { isNull } from '@/app/helpers/isNull';
import { PRIMARY_COLOR } from '@/app/src/constants';
import { Badge } from '@/components/ui/badge';

interface BadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto';
  color?: 'primary' | 'danger' | 'warning' | 'success' | 'info' | 'auto';
  filled?: 'primary' | 'danger' | 'warning' | 'auto' | 'none';
  className?: string;
  text?: string;
  variant?: string;
}

const sizeClasses: { [key: string]: string } = {
  xs: 'text-xs py-0 px-1',
  sm: 'text-sm py-0.5 px-1',
  md: 'text-md py-1 px-2',
  lg: 'text-lg py-3 px-6',
  auto: 'sm:text-sm sm:py-1 text-xs py-1 px-1 sm:px-2',
};

const colorClasses: { [key: string]: string } = {
  primary: 'border-blue-600 text-blue-600',
  success: 'border-green-600 text-blue-600',
  info: 'border-gray-600 text-gray-600',
  danger: 'border-red-500 text-red-500',
  warning: 'border-yellow-500 text-yellow-500',
  auto: `brand-border-secondary brand-text-secondary bg-transparent`,
};

const filledClasses: { [key: string]: string } = {
  primary: 'brand-border-secondary brand-text-secondary brand-bg-secondary font-bold',
  info: 'border-gray-600 text-white bg-gray-600 font-bold',
  success: 'border-green-600 text-white bg-green-600 font-bold',
  danger: 'border-red-500 text-white bg-red-500 font-bold',
  warning: 'border-yellow-500 text-white bg-yellow-500 font-bold',
  auto: `border-${PRIMARY_COLOR} text-white bg-${PRIMARY_COLOR} font-bold`,
  none: `border-${PRIMARY_COLOR} text-${PRIMARY_COLOR} bg-transparent`,
};

const CustomBadge: React.FC<BadgeProps> = ({
  size = 'auto',
  variant = 'outline',
  color,
  text,
  className = '',
  filled = 'primary',
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = color ? colorClasses[color] : '';
  const filledClass = filled ? filledClasses[filled] : '';

  const buttonClasses = ` ${sizeClass} ${filled ? filledClass : `${colorClass}`} ${className}`;

  return (
    <Badge className={`rounded-sm ${buttonClasses}`}>
      {isNull(text) ? <Shimmer height="5" /> : text}
    </Badge>
  );
};

export { CustomBadge };
