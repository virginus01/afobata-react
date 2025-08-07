import React, { useState, useEffect, useMemo } from "react";
import * as Slider from "@radix-ui/react-slider";

interface DataItem {
  price?: string | number;
  [key: string]: any;
}

interface SmartFilterProps {
  data: DataItem[];
  onFilteredDataChange: (filteredData: DataItem[]) => void;
}

const SmartFilter: React.FC<SmartFilterProps> = ({
  data,
  onFilteredDataChange,
}) => {
  const hasPriceField = useMemo(() => {
    return data.some((item) => "price" in item);
  }, [data]);

  const { minPrice, maxPrice } = useMemo(() => {
    if (!hasPriceField) return { minPrice: 0, maxPrice: 1000 };

    const prices = data
      .map((item) => {
        const price =
          typeof item.price === "string" ? parseFloat(item.price) : item.price;
        return isNaN(price || 0) ? null : price;
      })
      .filter((price): price is number => price !== null);

    return {
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 1000,
    };
  }, [data, hasPriceField]);

  const [values, setValues] = useState<[number, number]>([minPrice, maxPrice]);

  useEffect(() => {
    // Update values when min/max prices change
    setValues([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    if (!hasPriceField) return;

    const filteredData = data.filter((item) => {
      const price =
        typeof item.price === "string" ? parseFloat(item.price) : item.price;
      return (
        price !== undefined &&
        !isNaN(price) &&
        price >= values[0] &&
        price <= values[1]
      );
    });
    onFilteredDataChange(filteredData);
  }, [values, data, onFilteredDataChange, hasPriceField]);

  if (!hasPriceField) return null;

  return (
    <div className="p-4 bg-white">
      <div className="w-full">
        <label className="text-sm font-bold">Price Range</label>
        <div className="pt-6">
          <Slider.Root
            defaultValue={[minPrice, maxPrice]}
            min={minPrice}
            max={maxPrice}
            step={2}
            value={values}
            onValueChange={(newValues) =>
              setValues(newValues as [number, number])
            }
            className="relative flex items-center select-none touch-none w-full h-1"
          >
            <Slider.Track className="bg-slate-100 relative grow rounded-full h-0.5">
              <Slider.Range className="absolute bg-orange-600 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-3 h-3 bg-orange-600 rounded-full " />
            <Slider.Thumb className="block w-3 h-3 bg-orange-600 rounded-full " />
          </Slider.Root>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{values[0]}</span>
          <span>{values[1]}</span>
        </div>
      </div>
    </div>
  );
};

export { SmartFilter };
