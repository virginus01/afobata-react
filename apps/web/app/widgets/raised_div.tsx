import React, { ReactNode } from "react";
import { PRIMARY_COLOR } from "@/app/src/constants";

interface RaisedDivProps {
  size?: "xs" | "sm" | "md" | "lg" | "auto";
  color?: "primary" | "danger" | "warning" | "auto";
  filled?: "primary" | "danger" | "warning" | "auto" | "none";
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  iconPosition?: "before" | "after";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  id?: string;
  label?: string;
}

const sizeClasses: { [key: string]: string } = {
  xs: "text-xs py-0.2 px-0.5",
  sm: "text-sm py-0.5 px-1",
  md: "text-md py-1 px-2",
  lg: "text-lg py-3 px-6",
  auto: "sm:text-sm sm:py-1 sm:px-2 text-xs py-1 px-2",
};

const colorClasses: { [key: string]: string } = {
  primary: "border-blue-500 text-blue-500",
  danger: "border-red-500 text-red-500",
  warning: "border-yellow-500 text-yellow-500",
  auto: `border-${PRIMARY_COLOR} text-${PRIMARY_COLOR} bg-transparent`,
};

const filledClasses: { [key: string]: string } = {
  primary: "border-blue-500 text-white bg-blue-500 font-bold",
  danger: "border-red-500 text-white bg-red-500 font-bold",
  warning: "border-yellow-500 text-white bg-yellow-500 font-bold",
  auto: `border-${PRIMARY_COLOR} text-white bg-${PRIMARY_COLOR} font-bold`,
  none: `border-${PRIMARY_COLOR} text-${PRIMARY_COLOR} bg-transparent`,
};

const RaisedDiv: React.FC<RaisedDivProps> = ({
  size = "auto",
  color,
  children,
  icon,
  iconPosition = "before",
  onClick,
  disabled = false,
  type = "button",
  id,
  className = "",
  filled,
  label = "",
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = color ? colorClasses[color] : "";
  const filledClass = filled ? filledClasses[filled] : "";

  const baseClass = `border rounded m-1 shadow-lg transition transform whitespace-nowrap text-ellipsis flex items-center ${
    disabled
      ? "cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-500"
      : `cursor-pointer hover:shadow-xl active:shadow-none active:translate-y-1`
  }`;

  const buttonClasses = `${baseClass} ${sizeClass} ${
    filled
      ? filledClass
      : `${colorClass} ${
          disabled
            ? "bg-gray-200 dark:bg-gray-800"
            : "bg-white dark:bg-gray-800"
        }`
  } ${className}`;

  return (
    <div
      id={id}
      className={buttonClasses}
      onClick={!disabled ? onClick : undefined}
    >
      {icon && iconPosition === "before" && (
        <span className="mr-1">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "after" && <span className="ml-1">{icon}</span>}
    </div>
  );
};

export { RaisedDiv };
