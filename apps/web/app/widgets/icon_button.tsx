import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRIMARY_COLOR_STYLE } from '@/app/src/constants';

interface IconButtonProps {
  // Core props
  onClick?: () => void;
  children: ReactNode;

  // Styling props
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto';
  color?: 'primary' | 'danger' | 'warning' | 'auto';
  filled?: 'primary' | 'danger' | 'warning' | 'auto' | 'none';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

  // Icon props
  icon?: ReactNode;
  iconPosition?: 'before' | 'after';

  // Additional props
  disabled?: boolean;
  type?: 'button' | 'submit';
  id?: string;
  className?: string;
  label?: string;
  submitting?: boolean;
  submittingText?: string;
  bordered?: boolean;
}

const sizeClasses: { [key: string]: string } = {
  xs: 'text-xs h-6 px-2',
  sm: 'text-sm h-8 px-3',
  md: 'text-sm h-9 px-4',
  lg: 'text-lg h-10 px-6',
  auto: 'sm:text-sm h-8 px-3',
};

const colorClasses: { [key: string]: string } = {
  primary: 'text-white hover:text-white',
  danger: 'text-white hover:text-white',
  warning: 'text-yellow-500 hover:text-yellow-600',
  auto: '',
};

const filledClasses: { [key: string]: string } = {
  primary: 'bg-blue-600 text-white hover:text-white hover:bg-blue-700',
  danger: 'bg-red-500 text-white  hover:text-white hover:bg-red-600',
  warning: 'bg-yellow-600  hover:text-white text-white hover:bg-yellow-700',
  auto: 'bg-primary text-white hover:bg-primary/90',
  none: 'bg-transparent',
};

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-3 w-3 text-current ml-1"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

const IconButton = ({
  size = 'auto',
  color,
  filled,
  variant = 'outline',
  children,
  icon,
  iconPosition = 'before',
  onClick,
  disabled = false,
  type = 'button',
  id,
  className = '',
  submitting = false,
  submittingText,
  bordered,
}: IconButtonProps) => {
  const customClasses = cn(
    !bordered && 'border-none hover:border',
    'bg-transparent',
    'rounded-sm',
    sizeClasses[size],
    color && colorClasses[color],
    filled && filledClasses[filled],
    'hover:shadow-2xl active:shadow-none transition-all active:translate-y-1 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:cursor-pointer',
    disabled && 'cursor-not-allowed opacity-50',
    className,
  );

  return (
    <button
      id={id}
      type={type}
      // variant={variant}
      disabled={disabled}
      className={customClasses}
      onClick={!disabled ? onClick : undefined}
    >
      {submitting ? (
        <div className="flex items-center justify-center space-x-2">
          {icon && iconPosition === 'before' && <LoadingSpinner />}
          <span>{submittingText || children}</span>
          {icon && iconPosition === 'after' && <LoadingSpinner />}
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          {icon && iconPosition === 'before' && <span>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'after' && <span>{icon}</span>}
        </div>
      )}
    </button>
  );
};

export default IconButton;
