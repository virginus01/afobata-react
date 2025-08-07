import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { randomNumber } from '@/app/helpers/randomNumber';
import { isNull } from '@/app/helpers/isNull';

interface FormSelectProps {
  name: string;
  label: string;
  id?: string;
  disabled?: boolean;
  options: { value: string | number; label: string; disabled?: boolean }[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  controlled?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  options,
  disabled,
  className,
  controlled = true,
  onChange,
}) => {
  const formContext = useFormContext();

  const control = controlled ? formContext?.control : undefined;
  const errors = controlled ? formContext?.formState?.errors : {};

  if (!isNull(JSON.stringify(errors))) {
    console.info(errors);
  }

  const selectClassName = `block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-900 text-xs focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className} ${
    errors[name] ? 'border-red-500' : ''
  }`;

  const renderOptions = () =>
    options.map((option) => (
      <option
        key={`${option.value}${randomNumber(5)}`}
        value={option.value}
        disabled={option.disabled}
      >
        {option.label}
      </option>
    ));

  return (
    <div className={`${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
      >
        {label}
      </label>
      {controlled ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <select
              disabled={disabled}
              {...field}
              id={name}
              className={selectClassName}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e);
              }}
            >
              {renderOptions()}
            </select>
          )}
        />
      ) : (
        <select disabled={disabled} id={name} className={selectClassName} onChange={onChange}>
          {renderOptions()}
        </select>
      )}
      {errors[name]?.message && (
        <p className="text-red-500 text-xs mt-1">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default FormSelect;
