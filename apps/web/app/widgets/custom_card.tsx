import React, { ReactNode } from 'react';
import { isNull } from '@/app/helpers/isNull';

type CustomCardProps = {
  title: any;
  topRightWidget?: ReactNode;
  bottomWidget?: ReactNode;
  children?: ReactNode;
  className?: string;
  childrenClass?: string;
};

export default function CustomCard({
  title,
  topRightWidget,
  bottomWidget,
  children,
  className,
  childrenClass = 'mb-4 p-2 mt-4',
}: CustomCardProps) {
  return (
    <div className={`border rounded-sm shadow-sm brand-bg-card m-1 ${className}`}>
      {(title || topRightWidget) && (
        <div className="flex flex-row justify-between items-center border-b border-gray-300 w-full">
          {title && <div className="text-xs p-2">{title}</div>}
          {topRightWidget && <div className="text-xs p-2">{topRightWidget}</div>}
        </div>
      )}

      {children && <div className={`${childrenClass}`}>{children}</div>}

      {!isNull(bottomWidget) && (
        <div className="border-t border-gray-300 p-1">
          <div className="text-xs font-thin"> {bottomWidget}</div>
        </div>
      )}
    </div>
  );
}
