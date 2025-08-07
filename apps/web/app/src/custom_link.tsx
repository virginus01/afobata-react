import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode } from 'react';
import { toast } from 'sonner';
import { customStyles } from '@/src/constants';
import { Brand } from '@/app/models/Brand';

// Disabled styles
const disabledStyle =
  'rounded-sm bg-gray-400 px-4 py-2 text-xs font-bold whitespace-nowrap text-gray-300 shadow-sm shadow-gray-100 cursor-not-allowed';

type CustomLinkProps = {
  href: string;
  style?: number;
  target?: '_self' | '_blank' | '_parent' | '_top';
  className?: string;
  children: ReactNode;
  rel?: string;
  onClick?: () => void;
  disabled?: boolean;
  live?: boolean;
  siteInfo?: Brand;
};

const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  target = '_self',
  className = '',
  children,
  rel = 'noopener noreferrer',
  onClick,
  style = 0,
  disabled,
  live = false,
  siteInfo,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isOnline = navigator.onLine;

    if (!isOnline && process.env.NODE_ENV === 'production' && live) {
      e.preventDefault();
      toast.error("You're not connected to the internet");
    } else {
      onClick?.();
    }
  };

  const baseStyle: any = customStyles[style];
  const buttonLike =
    'py-1.5 px-2 h-auto w-auto transition-all duration-200 ease-in-out inline-flex items-center justify-center';

  const customClasses = cn(
    baseStyle,
    disabled && disabledStyle,
    style !== 0 && buttonLike,
    className,
  );

  return (
    <Link href={href} target={target} rel={rel} className={customClasses} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default CustomLink;
