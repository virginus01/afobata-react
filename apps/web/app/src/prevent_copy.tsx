"use client";

import { toast } from "sonner";

interface NoCopyProps {
  children: React.ReactNode;
  className?: string;
}

const NoCopy: React.FC<NoCopyProps> = ({ children, className = "" }) => {
  const preventActions = (e: React.SyntheticEvent): false => {
    if (process.env.NODE_ENV === "production") {
      e.preventDefault();
    }

    return false;
  };

  return (
    <div
      className={`${process.env.NODE_ENV === "production" && "select-none"}  ${className}`}
      onContextMenu={preventActions}
      onSelect={preventActions}
    >
      {children}
    </div>
  );
};

export default NoCopy;
