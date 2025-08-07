import React from "react";

interface AlertProps {
  type: "info" | "danger" | "warning" | "success";
  message: string;
  header?: string;
  showAction?: boolean;
  className?: string;
  onAction?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  header,
  showAction,
  className,
  onAction,
}) => {
  let alertStyles = "";
  let iconPath = "";

  switch (type) {
    case "info":
      alertStyles = "bg-indigo-100 border border-indigo-400 text-indigo-700";
      iconPath =
        "M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z"; // Example icon
      break;
    case "danger":
      alertStyles = "bg-red-100 border border-red-400 text-red-700";
      iconPath =
        "M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z";
      break;
    case "warning":
      alertStyles = "bg-yellow-100 border border-yellow-400 text-yellow-700";
      iconPath =
        "M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 15h-2v-2h2zm0-4h-2V7h2z"; // Example icon
      break;
    case "success":
      alertStyles = "bg-green-100 border border-green-400 text-green-700";
      iconPath =
        "M10 15l-3.5-3.5 1.41-1.41L10 12.17l5.09-5.09 1.41 1.41L10 15z"; // Example icon
      break;
    default:
      alertStyles =
        "bg-gray-100 dark:bg-gray-900 border border-gray-400 text-gray-700";
  }

  return (
    <div
      className={`${alertStyles} ${className} px-4 py-3 relative animate-pulse`}
      role="alert"
    >
      <strong className="font-bold capitalize">
        {header} {header && "!"}
      </strong>
      <span className="block sm:inline ml-2 font-bold">{message}</span>
      {showAction && (
        <span
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={onAction}
        >
          <svg
            className="fill-current h-6 w-6"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d={iconPath} />
          </svg>
        </span>
      )}
    </div>
  );
};

export { Alert };
