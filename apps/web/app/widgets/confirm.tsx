import React, { ReactNode, useEffect, useState } from 'react';
import { CustomButton, RaisedButton } from '@/app/widgets/widgets';
import { FaXmark } from 'react-icons/fa6';
import { FaCheck } from 'react-icons/fa';

interface ConfirmModalProps {
  info: any;
  onContinue: () => void;
  onCancel: () => void;
  url?: string;
  headerText?: string;
  buttonText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  info,
  onContinue,
  onCancel,
  url,
  headerText,
  buttonText = 'continue',
}) => {
  return (
    <div className="flex items-center">
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[50]">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg m-5  max-w-[100vh] sm:max-w-[70vh]">
          <div className="text-xs font-semibold mb-4">{headerText}</div>
          <div className="mb-2 text-xs">{info}</div>
          <div className="flex justify-end mt-20 space-x-4 items-center w-full">
            <div className="w-auto h-6">
              <CustomButton
                style={6}
                bordered={false}
                icon={<FaXmark />}
                iconPosition="before"
                onClick={() => onCancel()}
              >
                Cancel
              </CustomButton>
            </div>
            <div className="w-auto h-6">
              <CustomButton
                type="submit"
                icon={<FaCheck />}
                iconPosition="before"
                onClick={() => onContinue()}
              >
                {buttonText}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
