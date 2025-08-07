import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface HeaderColorCardProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
  rightWidget?: React.ReactNode;
  footerText?: string;
}

const HeaderColorCard: React.FC<HeaderColorCardProps> = ({
  title,
  className = '',
  children,
  rightWidget,
  footerText,
}) => {
  return (
    <Card
      className={`brand-bg-card brand-text-card inset-0 p-0  border-t-4 ${className} brand-border-primary shadow-lg w-full`}
    >
      <CardContent className="inset-0 p-0 flex flex-col justify-between space-y-5 w-full">
        <div className="flex flex-row items-center justify-between w-full py-1 px-4">
          <div className="font-bold  text-xs">{title}</div>
          {rightWidget && <div>{rightWidget}</div>}
        </div>

        {children && <div className="text-xs py-1 px-4">{children}</div>}

        {footerText && (
          <CardFooter className="py-1 px-4">
            <i className="animate-pulse text-xs">{footerText}</i>
          </CardFooter>
        )}
      </CardContent>
    </Card>
  );
};

export default HeaderColorCard;
