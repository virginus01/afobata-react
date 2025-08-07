import { Controller, useFormContext } from "react-hook-form";

interface ToggleSwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
  controlled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  name,
  checked,
  className,
  onChange,
  controlled = false,
}) => {
  const formContext = useFormContext();

  const control = controlled ? formContext?.control : undefined;
  const errors = controlled ? formContext?.formState?.errors : undefined;

  const renderInput = (field?: any) => (
    <input
      name={name}
      type="checkbox"
      checked={checked}
      onChange={(e) => {
        field?.onChange?.(e);
        onChange(e);
      }}
      className={`sr-only peer ${className}`}
    />
  );

  return (
    <label className="flex items-center cursor-pointer">
      <span className="mr-3 text-xs font-medium text-gray-900 dark:text-gray-300">{label}</span>
      <div className={`relative ${className}`}>
        {controlled ? (
          <Controller name={name} control={control} render={({ field }) => renderInput(field)} />
        ) : (
          renderInput()
        )}
        <div className="w-9 h-4 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-800 after:rounded-full after:h-3 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
      </div>
    </label>
  );
};
