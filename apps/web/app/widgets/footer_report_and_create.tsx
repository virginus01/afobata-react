import React from "react";

export function footer_report_and_create(
  user: any,
  product_type: string,
  product_id: string
) {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-50 dark:bg-gray-9000 text-white py-1">
      <div className="container text-xs sm:text-sm mx-auto flex justify-between items-center px-2 sm:px-4">
        <div>powered by topingnow & owned by: {user.username}</div>
        <div className="flex space-x-2">
          <button className="flex items-center bg-green-500 text-white px-1 py-0.5 rounded shadow-md hover:bg-green-600 transition duration-300 ease-in-out">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            create yours
          </button>
          <button className="flex items-center bg-red-500 text-white px-1 py-0.5 rounded shadow-md hover:bg-red-600 transition duration-300 ease-in-out">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1 0h1v-4h-1m-1 4h1v4h-1m0 4v2m-6-4a9 9 0 1018 0 9 9 0 10-18 0z"
              />
            </svg>
            report
          </button>
        </div>
      </div>
    </footer>
  );
}
