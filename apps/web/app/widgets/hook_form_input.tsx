import React, { FocusEvent, useEffect, useState } from 'react';
import { useFormContext, Controller, UseFormReturn } from 'react-hook-form';
import { isNull } from '@/app/helpers/isNull';
import { Label } from '@/components/ui/label';

interface FormInputProps {
  name: string;
  label?: string;
  type?: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'date' | 'tel' | 'url' | 'color';
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLoad?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  error?: any;
  disabled?: boolean;
  className?: string;
  showErros?: boolean;
  controlled?: boolean;
  defaultValue?: string;
  value?: string;
  icon?: any;
  methods?: UseFormReturn<any>;
  animate?: boolean;
  showLabel?: boolean;
  showPrefix?: boolean;
  labelClass?: string;
  max?: number;
  min?: number;
  step?: number;
  after?: any;
  before?: any;
}

const FormInput: React.FC<FormInputProps> = ({
  name = '',
  label,
  max,
  min,
  step,
  icon,
  showPrefix = true,
  controlled = true,
  type = 'text',
  onChange,
  onLoad,
  onBlur,
  onKeyDown,
  methods,
  placeholder = '',
  rows = 2,
  showErros = true,
  disabled,
  className = '',
  defaultValue = '',
  value = '',
  animate = true,
  showLabel = false,
  labelClass = 'text-xs brand-text brand-bg',
  after,
  before,
}) => {
  // Always call useFormContext at the top level
  const formContext = useFormContext();
  const [isIphone, setIsIphone] = useState(false);
  const [inputValue, setInputValue] = useState(value || defaultValue || '');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsIphone(/iPhone/.test(navigator.userAgent));
    }

    // Update local state when value prop changes
    if (!controlled && value !== undefined) {
      setInputValue(value);
    }
  }, [value, controlled]);

  // Then use the context conditionally
  const control = controlled ? formContext?.control : undefined;
  const errors = controlled ? formContext?.formState?.errors : {};
  let errorMessage = '';

  if (!isNull(JSON.stringify(errors))) {
    if (errors[name]) {
      console.info(errors[name]?.message);
      errorMessage = String(errors[name]?.message);
    }
  }

  let labelPrefix = '';
  labelPrefix = controlled && methods && methods.watch(name) ? 'Edit' : 'Enter';

  // Remove background-related classes and use bg-transparent to ensure transparency
  const inputClassName = `no-zoom input flex justify-start items-center w-full px-2 h-full bg-transparent text-xs
  ${type !== 'textarea' ? 'max-h-11' : ''} py-4 sm:py-4 sm:text-sm
  ${disabled ? 'text-gray-700' : 'text-gray-900'}
  appearance-none outline-none border border-gray-300 rounded-md
  focus:border-[hsl(var(--color-primary))] focus:ring-1 focus:ring-[hsl(var(--color-primary))]
  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
  dark:focus:border-[hsl(var(--color-primary))] dark:focus:ring-1 dark:focus:ring-[hsl(var(--color-primary))]
  ${!isNull(errorMessage) ? 'border-red-500 focus:ring-red-500' : ''}
  ${className}`;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field?: any,
  ) => {
    // Update local state
    setInputValue(e.target.value);

    // Call field onChange if controlled and field exists
    if (controlled && field) {
      field.onChange(e);
    }

    // Call custom onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  const renderInput = (field?: any) => {
    const inputProps = controlled
      ? field || {}
      : {
          value: inputValue,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            handleInputChange(e),
        };

    const commonProps = {
      id: name,
      disabled,
      className: `appearance-none ${inputClassName}`,
      placeholder: animate ? ' ' : placeholder,
      ...inputProps,
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={rows}
          onChange={(e) => handleInputChange(e, field)}
          onLoad={(e: any) => {
            if (onLoad) onLoad(e);
          }}
          onKeyDown={(e: any) => {
            if (controlled && field && field.onKeyDown) field.onKeyDown();
            if (onKeyDown) onKeyDown(e);
          }}
          onBlur={(e) => {
            if (controlled && field && field.onBlur) field.onBlur();
            if (onBlur) onBlur(e);
          }}
        />
      );
    }

    return (
      <input
        {...(type === 'number' && max !== undefined ? { max } : {})}
        {...(type === 'number' && min !== undefined ? { min } : {})}
        {...(type === 'number' && step !== undefined ? { step } : {})}
        {...commonProps}
        type={type}
        onChange={(e) => handleInputChange(e, field)}
        onKeyDown={(e: any) => {
          if (controlled && field && field.onKeyDown) field.onKeyDown();
          if (onKeyDown) onKeyDown(e);
        }}
        onBlur={(e) => {
          if (controlled && field && field.onBlur) field.onBlur();
          if (onBlur) onBlur(e);
        }}
      />
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent text-xs">
      <div className="relative input-group flex flex-col justify-center items-start w-full bg-transparent text-xs">
        {showLabel && (
          <Label className={`flex justify-start text-xs ${!animate && 'mb-4'}`}>{label}</Label>
        )}

        {/* Input Field */}
        {controlled ? (
          <Controller name={name} control={control} render={({ field }) => renderInput(field)} />
        ) : (
          renderInput()
        )}

        {animate && (
          <label
            htmlFor={name}
            className="label pointer-events-none bg-transparent rounded text-xs"
          >
            <div className={`flex flex-row items-center gap-2 text-xs  ${labelClass}`}>
              {icon && <div className="m-0 p-0">{icon}</div>}
              <div className="m-0 text-xs">
                {showPrefix && labelPrefix} {label || placeholder}
              </div>
            </div>
          </label>
        )}
        {after && (
          <span className="absolute right-0 top-0 h-full flex items-center p-0 px-3 text-xs text-gray-800 bg-gray-300 rounded-r-md pointer-events-none">
            {after}
          </span>
        )}
      </div>
      {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
    </div>
  );
};

export default FormInput;
