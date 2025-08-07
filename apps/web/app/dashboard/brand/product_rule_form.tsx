import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

export const ProductRuleInput = ({
  user,
  siteInfo,
}: {
  user: UserTypes;
  siteInfo: BrandType;
}) => {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext();

  return (
    <div className="flex items-center flex-grow bg-gray-100 dark:bg-gray-900 py-1 rounded shadow-xs">
      <Controller
        name=""
        control={control}
        render={({ field }) => (
          <input
            type="text"
            disabled
            value={`product price`}
            className="w-full bg-white dark:bg-gray-800 px-1 flex-grow-2 border rounded p-0 mx-0.5"
          />
        )}
      />

      <Controller
        name={``}
        control={control}
        render={({ field }) => (
          <select
            disabled
            {...field}
            className="px-2 border rounded p-0 mx-0.5 bg-none items-center justify-center text-center"
          >
            <option value="decrease">-</option>
          </select>
        )}
      />

      <Controller
        name={``}
        control={control}
        render={({ field }) => (
          <input
            disabled
            {...field}
            type="number"
            onChange={(e) => field.onChange(Number(e.target.value))}
            className="w-full border rounded px-1 p-0"
          />
        )}
      />

      <Controller
        name={``}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type="text"
            hidden={true}
            className="w-full border rounded px-1 p-0 mx-0.5"
          />
        )}
      />

      <Controller
        name={``}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className="px-2 border rounded p-0 mx-0.5 bg-none items-center justify-center text-center"
            disabled
          >
            <option value="increase">+</option>
          </select>
        )}
      />
      <Controller
        name={`additional_inhouse_product_price`}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type="number"
            className="w-full border rounded px-1 p-0 mx-0.5"
          />
        )}
      />

      <Controller
        name={``}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className="px-2  border rounded p-0 mx-0.5 bg-none items-center justify-center text-center"
          >
            <option value="percentage">%</option>
          </select>
        )}
      />
    </div>
  );
};
