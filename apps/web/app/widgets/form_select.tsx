import React from 'react';
import { isNull } from '@/app/helpers/isNull';

interface SelectProps {
  disabled?: boolean;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  id: string;
  options: { value: string; label: string; disabled?: boolean }[]; // Array of options for the select
  className?: string;
  defaultValue?: string;
  error?: string; // Optional error message
  selected?: string;
}

export const SelectField: React.FC<SelectProps> = ({
  name,
  value,
  onChange,
  label,
  id,
  options,
  className = '',
  error,
  defaultValue,
  disabled,
  selected,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-2 text-sm font-normal text-gray-900 dark:text-white">
        {label}
      </label>
      <select
        key={id}
        disabled={disabled}
        name={name}
        id={id}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        className={`block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-900 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className}`}
      >
        {options.map((option, i) => {
          return (
            <option className="" key={i} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          );
        })}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SelectField;
