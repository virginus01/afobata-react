'use client';
import React, { ReactNode } from 'react';
import { PRIMARY_COLOR, PRIMARY_COLOR_STYLE } from '@/app/src/constants';

interface RaisedButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto';
  color?: 'primary' | 'danger' | 'warning' | 'auto';
  filled?: 'primary' | 'danger' | 'warning' | 'auto' | 'none';
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  iconPosition?: 'before' | 'after';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  id?: string;
  label?: string;
  submitting?: boolean;
  submitted?: boolean;
  submittingText?: string;
  bordered?: boolean;
}

const sizeClasses: { [key: string]: string } = {
  xs: 'text-xs py-0.2 px-1',
  sm: 'text-sm py-0.5 px-1',
  md: 'text-sm py-0.5 px-1',
  lg: 'text-lg py-3 px-6',
  auto: 'sm:text-sm sm:py-1 text-xs py-0.5 px-1 sm:px-2',
};

const colorClasses: { [key: string]: string } = {
  primary: 'border-[hsl(var(--primary))] text-primary',
  danger: 'border-red-500 text-red-500',
  warning: 'border-yellow-500 text-yellow-500',
  auto: `bg-transparent`,
};

const filledClasses: { [key: string]: string } = {
  primary: 'border-blue-500 text-white bg-blue-500 font-bold',
  danger: 'border-red-500 text-white bg-red-500 font-bold',
  warning: 'border-yellow-500 text-white bg-yellow-500 font-bold',
  auto: `border-[hsl(var(--primary))] text-white bg-[hsl(var(--primary))] font-bold`,
  none: `border-[hsl(var(--primary))] text-${PRIMARY_COLOR} bg-transparent`,
};

const RaisedButton: React.FC<RaisedButtonProps> = ({
  size = 'auto',
  color,
  children,
  icon,
  iconPosition = 'before',
  onClick,
  disabled = false,
  type = 'button',
  id,
  className = '',
  filled,
  label = '',
  submitting,
  submittingText,
  bordered = true,
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = color ? colorClasses[color] : '';
  const filledClass = filled ? filledClasses[filled] : '';

  const baseClass = `border rounded m-1 shadow-lg transition transform whitespace-nowrap text-ellipsis flex items-center justify-e ${
    disabled
      ? 'cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-500'
      : `cursor-pointer hover:shadow-xl active:shadow-none active:translate-y-1`
  } ${className}`;

  const buttonClasses = `${baseClass} ${sizeClass} ${
    filled
      ? filledClass
      : `${colorClass} ${disabled ? 'bg-gray-200 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}`
  } ${className}`;

  const bd = bordered ? `1px solid ${PRIMARY_COLOR_STYLE}` : '';
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      className={buttonClasses}
      onClick={!disabled ? onClick : undefined}
      style={{ border: bd }}
    >
      {submitting ? (
        <div className="flex items-center">
          <>
            {icon && iconPosition === 'before' && (
              <span className="mr-1">
                <svg
                  className={`animate-spin h-3 w-3 text-gray-600 ml-1`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </span>
            )}
            <span>{submitting ? submittingText : children}</span>
            {icon && iconPosition === 'after' && (
              <span className="ml-1">
                <svg
                  className={`animate-spin h-3 w-3 text-gray-600 ml-1`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </span>
            )}
          </>
        </div>
      ) : (
        <>
          {icon && iconPosition === 'before' && <span className="mr-1">{icon}</span>}
          <span>{submitting ? submittingText : children}</span>
          {icon && iconPosition === 'after' && <span className="ml-1">{icon}</span>}
        </>
      )}
    </button>
  );
};

export { RaisedButton };
