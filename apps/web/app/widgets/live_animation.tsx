// components/LiveIcon.tsx
import React from "react";

const LiveIcon: React.FC = () => {
  return (
    <div className="flex items-center">
      <span className="text-green-600 font-semibold mr-2">Live</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-lifebuoy"
      >
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="5" className="circle-outer" />
        <circle cx="12" cy="12" r="7" className="circle-middle" />
        <circle cx="12" cy="12" r="9" className="circle-inner" />
        <style jsx>{`
          .circle-outer {
            stroke: #00ff00; /* Green color */
            strokewidth: 1.5;
            animation: pulse-outer 2s infinite;
          }
          .circle-middle {
            stroke: #00ff00; /* Green color */
            strokewidth: 1;
            animation: pulse-middle 2s infinite;
          }
          .circle-inner {
            stroke: #00ff00; /* Green color */
            strokewidth: 0.5;
            animation: pulse-inner 2s infinite;
          }

          @keyframes pulse-outer {
            0% {
              stroke-opacity: 0.5;
              transform: scale(1);
            }
            50% {
              stroke-opacity: 0;
              transform: scale(1.5);
            }
            100% {
              stroke-opacity: 0.5;
              transform: scale(1);
            }
          }
          @keyframes pulse-middle {
            0% {
              stroke-opacity: 0.3;
              transform: scale(1);
            }
            50% {
              stroke-opacity: 0;
              transform: scale(1.4);
            }
            100% {
              stroke-opacity: 0.3;
              transform: scale(1);
            }
          }
          @keyframes pulse-inner {
            0% {
              stroke-opacity: 0.1;
              transform: scale(1);
            }
            50% {
              stroke-opacity: 0;
              transform: scale(1.3);
            }
            100% {
              stroke-opacity: 0.1;
              transform: scale(1);
            }
          }
        `}</style>
      </svg>
    </div>
  );
};

export { LiveIcon };
