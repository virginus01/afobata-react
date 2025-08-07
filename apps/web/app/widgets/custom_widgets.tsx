import { useState } from 'react';
import { Alert } from '@/app/widgets/alerts'; // Adjust the path if necessary

interface CustomAlert extends Function {
  success: (message: string) => JSX.Element;
  error: (message: string) => JSX.Element;
  warning: (message: string) => JSX.Element;
}

const custom_alert: CustomAlert = Alert as unknown as CustomAlert;

custom_alert.success = (message) => custom_alert(message, 'success');
custom_alert.error = (message) => custom_alert(message, 'error');
custom_alert.warning = (message) => custom_alert(message, 'warning');

export default custom_alert;

export function CustomAlert({ message = 'Something went wrong', type = 'warning' }) {
  const [isVisible, setIsVisible] = useState(true);

  const alertStyles: any = {
    success: 'bg-green-100 border border-green-400 text-green-700',
    error: 'bg-red-100 border border-red-400 text-red-700',
    warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
  };

  const iconStyles: any = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
  };

  if (!isVisible) return null;

  return (
    <div className={`${alertStyles[type]} px-4 py-3 rounded relative`} role="alert">
      <div>
        <span className="block sm:inline">{message}</span>
      </div>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg
          className={`fill-current h-6 w-6 ${iconStyles[type]}`}
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          onClick={() => setIsVisible(false)}
        >
          <title>Close</title>
          <path d="M14.348 5.652a1 1 0 0 1 0 1.414L11.414 10l2.934 2.934a1 1 0 0 1-1.414 1.414L10 11.414l-2.934 2.934a1 1 0 0 1-1.414-1.414L8.586 10 5.652 7.066a1 1 0 0 1 1.414-1.414L10 8.586l2.934-2.934a1 1 0 0 1 1.414 0z" />
        </svg>
      </span>
    </div>
  );
}
