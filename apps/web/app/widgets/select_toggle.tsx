'use client'; // Ensures client-side interactivity

import { useState } from 'react';
import { capitalize } from '@/app/helpers/capitalize';
import { CustomButton } from '@/app/widgets/custom_button';

export default function ToggleRowSelect({
  onSelectionChange,
  options,
  selected,
}: {
  onSelectionChange: (selectedOption: PlanDuration) => void;
  options: any[];
  selected: any;
}) {
  // Available options for selection

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedData, setSelectedData] = useState<any | null>(selected);
  // Handle toggle and trigger callback on selection change
  const handleToggle = (option: any, index: number) => {
    setSelectedIndex(index);
    if (onSelectionChange) {
      setSelectedData(option);
      onSelectionChange(option);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Toggle Container */}
      <div className="relative flex flex-row space-x-2 rounded p-1 m-4">
        {options.map((option, index) => (
          <CustomButton
            className="h-7 w-auto"
            key={index}
            bordered={true}
            onClick={() => handleToggle(option, index)}
            style={selectedData.value === option.value ? 1 : 6}
          >
            {capitalize(option.title)}
          </CustomButton>
        ))}
      </div>
    </div>
  );
}
