import FormInput from "@/app/widgets/hook_form_input";
import { CustomBadge } from "@/app/widgets/widgets";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

const MonetizeRuleInput = ({ user, siteInfo }: { user: UserTypes; siteInfo: BrandType }) => {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext();

  return (
    <div className="flex items-center  dark:bg-gray-900 py-1 rounded shadow-xs space-x-2">
      <FormInput name="share_value" label="share rate" />
      <Controller
        name={`nknkjhkjh`}
        control={control}
        render={({ field }) => (
          <select
            disabled={true}
            {...field}
            className="border rounded py-1 px-2 bg-none items-center justify-center text-center whitespace-nowrap text-sm"
          >
            <option value="percentage">%</option>
          </select>
        )}
      />
    </div>
  );
};

export default MonetizeRuleInput;
