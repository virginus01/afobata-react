import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { CustomBadge } from '@/app/widgets/badge';

// Default values for a new rule
const DEFAULT_RULE: Partial<Rule> = {
  direction: 'increase',
  value: 0,
  adjustmentType: 'percentage',
  chargeDirection: 'increase',
  serviceCharge: 0,
};

export const RuleInput = ({
  index,
  id,
  title,
  min = 0,
  max = 100,
  subject,
  rule,
  user,
  siteInfo,
  onChange,
}: {
  index: number;
  id: string;
  min?: number;
  max?: number;
  rule: Rule;
  user: UserTypes;
  subject?: string;
  siteInfo: BrandType;
  title?: string;
  onChange: (data: Rule) => void;
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<{
    rule: Record<string, Partial<Rule>>;
  }>();

  // Watch all fields within the rules[id] scope
  const ruleValues = useWatch({ name: `rule.${id}` });

  // Track the full rule state in component state
  const [currentRuleState, setCurrentRuleState] = useState<Rule>({
    // Merge defaults with provided rule
    ...DEFAULT_RULE,
    ...rule,
  });

  // Initialize form values on component mount and rule changes
  useEffect(() => {
    const initialRule = {
      ...DEFAULT_RULE,
      ...rule,
    };

    // Update the state first
    setCurrentRuleState((prev) => ({ ...prev, ...initialRule }));

    // Then update form values with defaults for any missing values
    Object.entries(initialRule).forEach(([key, value]) => {
      if (value !== undefined) {
        setValue(`rule.${id}.${key}`, value);
      }
    });
  }, [id, rule, setValue]);

  // Update local state when form values change
  useEffect(() => {
    if (ruleValues) {
      setCurrentRuleState((prev) => ({ ...prev, ...ruleValues }));
    }
  }, [ruleValues]);

  const handleChange = ({ key, value }: { key: string; value: string | number }) => {
    // Create a comprehensive updated rule object
    const updatedRule = {
      ...currentRuleState, // Use current state as base
      [key]: value, // Add the new value
    };

    // Update the component state
    setCurrentRuleState(updatedRule);

    // Update the form value
    setValue(`rule.${id}.${key}`, value);

    // Call the onChange callback with the complete rule
    onChange(updatedRule);
  };

  return (
    <>
      <label htmlFor={rule.name} className="py-1">
        {title ?? rule.title ?? `Rule ${index + 1}`}
      </label>
      <div className="flex items-center flex-grow dark:bg-gray-900 py-1 rounded shadow-xs whitespace-nowrap text-xs sm:text-sm">
        <CustomBadge
          className="whitespace-nowrap text-xs sm:text-sm"
          size="xs"
          color="info"
          text={`${(subject || rule.name || 'price').replace('_', ' ')}`}
        />

        <Controller
          name={`rule.${id}.direction`}
          control={control}
          defaultValue={DEFAULT_RULE.direction}
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleChange({ key: 'direction', value: e.target.value });
              }}
              className="px-2 border rounded p-0 mx-0.5 bg-none items-center justify-center text-center border-red-500 animate-pulse whitespace-nowrap text-xs sm:text-sm"
            >
              <option value="increase">+</option>
              <option value="decrease">-</option>
            </select>
          )}
        />
        <Controller
          name={`rule.${id}.value`}
          control={control}
          defaultValue={DEFAULT_RULE.value}
          render={({ field }) => {
            // Get the current direction value
            const direction = getValues(`rule.${id}.direction`);
            // Determine the effective maximum based on direction
            const effectiveMax = direction === 'increase' ? 100 : max;

            return (
              <input
                {...field}
                type="number"
                min={min}
                max={effectiveMax}
                step="0.01"
                onBlur={(e) => {
                  // Get the value and clamp it between min and the effective max
                  const inputValue = parseFloat(e.target.value) || 0;
                  const clampedValue = Math.max(min, Math.min(effectiveMax, inputValue));

                  // Update the field with the clamped value
                  field.onChange(clampedValue);

                  // Pass the clamped value to your handleChange function
                  handleChange({ key: 'value', value: clampedValue });
                }}
                className="w-full border rounded px-1 p-0 whitespace-nowrap text-xs sm:text-sm"
              />
            );
          }}
        />

        <Controller
          name={`rule.${id}.adjustmentType`}
          control={control}
          defaultValue={DEFAULT_RULE.adjustmentType}
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleChange({ key: 'adjustmentType', value: e.target.value });
              }}
              className="px-2 border rounded p-0 mx-0.5 bg-none items-center justify-center text-center border-red-500 animate-pulse whitespace-nowrap text-xs sm:text-sm"
            >
              <option value="percentage">%</option>
              <option value="fixed">{user.currencyInfo?.currencySymbol || 'fix'}</option>
            </select>
          )}
        />

        <Controller
          name={`rule.${id}.chargeDirection`}
          control={control}
          defaultValue={DEFAULT_RULE.chargeDirection}
          render={({ field }) => (
            <select
              disabled
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleChange({ key: 'chargeDirection', value: e.target.value });
              }}
              className="px-2 border rounded p-0 mx-0.5 bg-none items-center justify-center text-center border-red-500 animate-pulse whitespace-nowrap text-xs sm:text-sm"
            >
              <option value="increase">+</option>
              <option value="decrease">-</option>
            </select>
          )}
        />

        <Controller
          name={`rule.${id}.serviceCharge`}
          control={control}
          defaultValue={DEFAULT_RULE.serviceCharge}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              min="0"
              step="0.01"
              placeholder="optional"
              onChange={(e) => {
                field.onChange(e);
                handleChange({ key: 'serviceCharge', value: parseFloat(e.target.value) || 0 });
              }}
              className="w-full border rounded px-1 p-0 mx-0.5 whitespace-nowrap text-xs sm:text-sm"
            />
          )}
        />

        {errors.rule?.[id]?.message && (
          <p className="text-red-500 text-xs mt-1">{String(errors.rule[id]?.message)}</p>
        )}
      </div>
    </>
  );
};
