import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import FormInput from '@/app/widgets/hook_form_input';
import { isNull } from '@/app/helpers/isNull';
import { CustomButton } from '@/app/widgets/custom_button';

interface ActionInputFieldProps {
  label: string;
  placeholder: string;
  name: string;
  id: string;
  handleVerifications: (value: string, action: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

  onValChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  action: string;
  verifying?: boolean;
  customerName?: string;
  customerNameValidated: boolean;
  disabled?: boolean;
  accountNumber?: number;
  setValue?: (name: string, value: any) => void;
  buttonText?: string;
}

const ActionInputField: React.FC<ActionInputFieldProps> = ({
  label,
  placeholder,
  name,
  id,
  handleVerifications,
  action,
  customerName,
  customerNameValidated,
  verifying,
  disabled,
  accountNumber,
  onChange,
  setValue,
  onValChange,
  buttonText = 'validate',
}) => {
  const [valValue, setValValue] = useState<string | null>(String(accountNumber));

  return (
    <div className="my-2">
      <div className="flex flex-col space-y-5">
        <div className="flex flex-row items-center gap-4 w-full">
          <FormInput
            labelClass="brand-bg"
            controlled={false}
            disabled={disabled}
            onBlur={(e) => {
              if (e.target.value) {
                onChange?.(e);
                setValValue(e.target.value);
                setValue?.('customerValidated', false);
              }
            }}
            placeholder={placeholder}
            id={id}
            type="text"
            label={label}
            className="text-xs"
            name={'validate'}
          />
          {valValue && (
            <div className="w-auto px-2 h-8">
              <CustomButton
                disabled={customerNameValidated}
                type="button"
                icon={
                  verifying ? (
                    <svg
                      className="animate-spin h-4 w-4 text-gray-50 ml-2"
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
                  ) : (
                    <FaCheck />
                  )
                }
                iconPosition="after"
                onClick={() => {
                  const value = isNull(valValue) ? accountNumber : valValue || '';
                  handleVerifications(String(value), action);
                }}
                style={customerNameValidated ? 0 : 1}
              >
                {verifying ? 'validating' : customerNameValidated ? 'validated' : buttonText}
              </CustomButton>
            </div>
          )}
        </div>

        {customerName && (
          <div className="my-4">
            <FormInput
              controlled={false}
              value={customerName}
              type="text"
              id="customer-name"
              name="customerName"
              label="Customer Name"
              onChange={(e) => {
                onValChange?.(e);
              }}
              disabled={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionInputField;
