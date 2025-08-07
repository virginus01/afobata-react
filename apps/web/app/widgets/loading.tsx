import React from "react";

export default function LoadingBar() {
  return (
    <div className="absolute top-0 left-0 w-full z-50">
      <div className="h-1 bg-red-500 animate-pulse"></div>
    </div>
  );
}
