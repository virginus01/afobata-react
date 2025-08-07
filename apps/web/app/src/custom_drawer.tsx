import React from 'react';
import { CustomButton, Overlay, RaisedButton } from '@/app/widgets/widgets';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { DrawerProvider, useDrawer } from '@/app/contexts/drawer_context';
import { isNull } from '@/helpers/isNull';

interface CustomDrawerProps {
  isOpen: boolean;
  isFull?: boolean;
  isWidthFull?: boolean | 'auto';
  isHeightFull?: boolean;
  className?: string;
  onClose: () => void;
  handleSaveAndClose?: (onSaveData: any) => void;
  children: React.ReactNode;
  header: string;
  closeButton?: 'back' | 'close';
  showCloseButton?: boolean;
  showSaveButton?: boolean;
  showHeader?: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

const CustomDrawer: React.FC<CustomDrawerProps> = (props) => {
  return (
    <DrawerProvider>
      <CDrawer {...props} />
    </DrawerProvider>
  );
};

export default CustomDrawer;

const CDrawer: React.FC<CustomDrawerProps> = ({
  isOpen,
  onClose,
  handleSaveAndClose,
  children,
  header,
  isFull = false,
  isWidthFull = false,
  className = '',
  isHeightFull = false,
  direction = 'right',
  showCloseButton = true,
  showSaveButton = false,
  showHeader = true,
  closeButton,
}) => {
  const { onSaveData } = useDrawer();
  const isLeft = direction === 'left';
  const isRight = direction === 'right';
  const isTop = direction === 'top';
  const isBottom = direction === 'bottom';

  if (!isOpen) {
    return;
  }

  let button = (
    <FaTimes
      className="mx-4 h-5 w-5 cursor-pointer hover:rotate-90 transition-transform duration-300"
      onClick={onClose}
    />
  );

  if (closeButton === 'back') {
    button = (
      <FaArrowLeft
        className="mx-4 h-5 w-5 cursor-pointer hover:rotate-90 transition-transform duration-300"
        onClick={onClose}
      />
    );
  }

  return (
    <div className="border-t border-gray-100 fixed top-0 h-screen w-screen z-50">
      <Overlay isOpen={isOpen} onClose={onClose} />
      <div
        className={`fixed  ${isHeightFull ? 'top-0' : 'top-[13vh] sm:top-[8vh]'} ${
          isWidthFull === 'auto'
            ? `${isLeft ? 'left-0' : 'right-0'} bottom-0 w-full h-full z-50 sm:w-4/5`
            : isWidthFull || isFull
              ? 'right-0 left-0 bottom-0 w-full h-full z-50'
              : `${isLeft ? 'left-0' : 'right-0'} w-full sm:w-10/12 h-full`
        } brand-bg shadow-lg transform ${
          isOpen
            ? 'translate-x-0 translate-y-0'
            : isLeft
              ? '-translate-x-full'
              : isRight
                ? 'translate-x-full'
                : isTop
                  ? '-translate-y-full'
                  : 'translate-y-full'
        } transition-transform duration-300 ease-in-out z-[1000] ${
          isLeft || isRight
            ? `${isLeft ? 'left-0' : 'right-0'} top-0 bottom-0`
            : `${isTop ? 'top-0' : 'bottom-0'} left-0 right-0`
        }
       ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {showHeader && (
            <div className="flex flex-row space-x-4 items-center p-1 border-y w-full py-2">
              {showCloseButton && button}
              <div className="font-bold">{header}</div>
              <div className="flex justify-end">
                {!isNull(onSaveData) && (
                  <RaisedButton
                    size="auto"
                    color="primary"
                    icon={<FaSave />}
                    iconPosition="before"
                    onClick={() => {
                      handleSaveAndClose?.(onSaveData ?? {});
                    }}
                  >
                    <span className="font-normal">Save & Close</span>
                  </RaisedButton>
                )}

                <div></div>
              </div>
            </div>
          )}
          <div className="overflow-y-auto scrollbar-hide-mobile">{children}</div>
        </div>
      </div>
    </div>
  );
};
