import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import FormInput from "@/app/widgets/hook_form_input";
import { CustomButton, RaisedButton } from "@/app/widgets/widgets";
import { Label } from "@radix-ui/react-select";

interface PasswordInputProps {
  name: string;
  label: string;
  showConfirm?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ name, label, showConfirm = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { watch } = useFormContext();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const renderPasswordStrengthIndicators = () => (
    <ul className="list-disc pl-5 text-sm text-gray-900 dark:text-white">
      <li
        className={`${
          watch(name)?.length >= 8 ? "text-green-600" : watch(name) !== "" ? "text-red-600" : ""
        }`}
      >
        Must contain at least 8 characters
      </li>
      <li
        className={`${
          /[a-zA-Z]/.test(watch(name) || "")
            ? "text-green-600"
            : watch(name) !== ""
            ? "text-red-600"
            : ""
        }`}
      >
        Must contain a letter
      </li>
      <li
        className={`${
          /\d/.test(watch(name) || "") ? "text-green-600" : watch(name) !== "" ? "text-red-600" : ""
        }`}
      >
        Must contain a number
      </li>
    </ul>
  );

  return (
    <>
      <div className="mt-4">
        <label className="text-xs">{label}</label>

        <div className="flex flex-row items-center w-full justify-center space-x-2 h-full mt-5">
          <FormInput
            className="w-full flex-grow h-full"
            placeholder="password"
            name={name}
            type={showPassword ? "text" : "password"}
            id={name}
            label=""
            animate={false}
            showLabel={false}
          />

          <CustomButton
            icon=""
            iconPosition="after"
            className="w-7 h-7 px-2.5 py-2.5"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </CustomButton>
        </div>
      </div>
      {!showConfirm && renderPasswordStrengthIndicators()}
    </>
  );
};

export default PasswordInput;
