'use client';

import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';

type Option = {
  label: string;
  value: string;
};

type Props = {
  data: Option[];
  selected: string;
  style: 1 | 2;
  onChange: (value: string) => void;
  label: string;
};

export default function CustomRadioButton({ data, selected, style, onChange, label }: Props) {
  const [selectedItem, setSelectedItem] = useState(selected);

  const handleSelect = (value: string) => {
    setSelectedItem(value);
    onChange(value);
  };

  return (
    <div className="w-full">
      <RadioGroup value={selectedItem} onChange={handleSelect}>
        <label className="text-sm font-bold mb-2 block">{label}</label>
        <div className={style === 2 ? 'space-y-2' : 'space-y-1'}>
          {data.map((item) => (
            <RadioGroup.Option
              key={item.value}
              value={item.value}
              className={({ checked }) => {
                if (style === 1) {
                  return 'flex items-center space-x-2';
                }
                return `cursor-pointer rounded-lg px-4 py-3 border transition ${
                  checked
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-white text-gray-900 border-gray-300'
                }`;
              }}
            >
              {() =>
                style === 1 ? (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedItem === item.value}
                      onChange={() => handleSelect(item.value)}
                      className="form-radio text-blue-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ) : (
                  <span className="block">{item.label}</span>
                )
              }
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
