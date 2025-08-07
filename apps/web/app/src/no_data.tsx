import React from "react";

interface NoDataProps {
  text: any;
}

const NoData: React.FC<NoDataProps> = ({ text }) => {
  return (
    <div className="flex h-full w-full my-20 items-center justify-center">
      <div className="text-center">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M9 16h6M2 20h20M5 16v4h14v-4M22 12a10 10 0 11-20 0 10 10 0 0120 0z"
          ></path>
        </svg>
        <div className="text-gray-700 text-lg">{text}</div>
      </div>
    </div>
  );
};

export default NoData;
