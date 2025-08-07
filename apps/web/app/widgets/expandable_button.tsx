import { Menu, Transition } from "@headlessui/react";
import React, { useState, ReactNode, Fragment } from "react";
import { useRouter } from "next/navigation";
import { PRIMARY_COLOR } from "@/app/src/constants";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface MenuItem {
  label: string;
  href: string;
}

interface ExpandableButtonProps {
  size?: "xs" | "sm" | "md" | "lg" | "auto";
  color?: "primary" | "danger" | "warning" | "auto";
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "before" | "after";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  items?: MenuItem[]; // List of items to show when expanded
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
  auto: `border-${PRIMARY_COLOR} text-${PRIMARY_COLOR}`,
};

const ExpandableButton: React.FC<ExpandableButtonProps> = ({
  size = "md",
  color = "primary",
  children,
  icon,
  iconPosition = "before",
  onClick,
  disabled = false,
  type = "button",
  items = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];
  const router = useRouter();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onClick) onClick();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button
          type={type}
          disabled={disabled}
          className={`border rounded m-1 shadow-lg transition transform whitespace-nowrap text-ellipsis flex items-center ${sizeClass} ${colorClass} ${
            disabled
              ? "cursor-not-allowed bg-gray-200 dark:bg-gray-800 text-gray-500"
              : "cursor-pointer hover:shadow-xl active:shadow-none active:translate-y-1 bg-white dark:bg-gray-800"
          }`}
          onClick={!disabled ? handleToggle : undefined}
        >
          {icon && iconPosition === "before" && (
            <span className={`mr-1 ${sizeClasses}`}>{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === "after" && (
            <span className={`ml-1 ${sizeClasses}`}>{icon}</span>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {items.map((item, index) => (
            <Menu.Item key={index}>
              {({ active }) => (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.href);
                  }}
                  className={classNames(
                    active ? "bg-gray-100 dark:bg-gray-900" : "",
                    "block px-4 py-2 text-sm text-gray-700"
                  )}
                >
                  {item.label}
                </a>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export { ExpandableButton };
