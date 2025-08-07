import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { customStyles } from '@/src/constants';

// Disabled styles
const disabledStyle =
  'rounded-sm bg-gray-400 text-xs font-bold whitespace-nowrap text-gray-300 hover:bg-gray-500 hover:text-gray-300 shadow-sm shadow-gray-100 cursor-not-allowed';

interface CustomButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  icon?: ReactNode;
  style?: number;
  iconPosition?: 'before' | 'after';
  disabled?: boolean;
  type?: 'button' | 'submit';
  id?: string;
  className?: string;
  buttonText?: string;
  submitting?: boolean;
  submitted?: boolean;
  submittedText?: string;
  submittingText?: string;
  bordered?: boolean;
}

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

const CustomButton = ({
  children,
  icon,
  iconPosition = 'before',
  onClick,
  disabled = false,
  type = 'button',
  id,
  className = 'w-full',
  style = 1,
  submitting = false,
  submitted = false,
  submittedText,
  submittingText,
  bordered = false,
  buttonText,
}: CustomButtonProps) => {
  const baseStyle: any = customStyles[style];

  const customClasses = cn(
    baseStyle,
    disabled ? disabledStyle : 'cursor-pointer active:shadow-none active:translate-y-1',
    'py-1.5 px-2',
    'h-auto w-auto',
    'transition-all duration-200 ease-in-out',
    'inline-flex items-center justify-center',
    className,
  );

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || submitting}
      className={customClasses}
      onClick={!disabled && !submitting ? onClick : undefined}
    >
      {submitting ? (
        <div className="flex items-center justify-center space-x-2">
          {submittingText ||
            children ||
            (buttonText && <span>{submittingText || children || buttonText}</span>)}
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          {icon && iconPosition === 'before' && <span>{icon}</span>}

          {(children || buttonText) && <span>{children || buttonText}</span>}

          {icon && iconPosition === 'after' && <span>{icon}</span>}
        </div>
      )}
    </button>
  );
};

export { CustomButton };
