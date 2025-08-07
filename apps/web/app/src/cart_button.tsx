import React from 'react';
import { useRouter } from 'next/navigation';
import IconButton from '@/app/widgets/icon_button';

interface CartLinkProps {
  href: string;
  IconComponent: any;
  cartCount: number;
  iconSize?: string;
  iconColor?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  onClick: () => void;
  className?: string;
}

const CartButton: React.FC<CartLinkProps> = ({
  href,
  IconComponent,
  cartCount,
  iconSize = 'h-5 w-5 sm:h-5 sm:w-5',
  iconColor = 'text-gray-800',
  badgeColor = 'bg-red-500',
  badgeTextColor = 'text-white',
  onClick,
  className,
}) => {
  const router = useRouter();
  return (
    <div className="relative">
      <IconButton
        className={''}
        size="auto"
        color="auto"
        icon={<IconComponent className={`${iconSize}`} />}
        iconPosition="before"
        onClick={onClick}
      >
        {cartCount > 0 && (
          <span
            className={`absolute -top-1 -right-0 ${badgeColor} ${badgeTextColor} rounded-full h-4 w-4 flex items-center justify-center text-xs`}
          >
            {cartCount}
          </span>
        )}
      </IconButton>
    </div>
  );
};

export default CartButton;
