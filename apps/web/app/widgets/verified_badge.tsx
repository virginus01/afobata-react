import React from 'react';

export const VerifiedBadge = ({ verified = false, size = '5', icon = '3' }) => {
  return (
    <>
      {verified ? (
        <>
          <span
            className={`w-${size} h-${size} inline-flex items-center justify-center bg-green-700 dark:bg-gray-9000 text-white rounded-full flex-shrink-0`}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              className={`w-${icon} h-${icon}`}
              viewBox="0 0 24 24"
            >
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </span>
        </>
      ) : (
        <>
          <span
            className={`w-${size} h-${size} inline-flex items-center justify-center bg-gray-500 dark:bg-gray-9000 text-white rounded-full flex-shrink-0 p-1`}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              className="w-5 h-5 text-gray-100"
              viewBox="0 0 24 24"
            >
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </span>
        </>
      )}
    </>
  );
};
