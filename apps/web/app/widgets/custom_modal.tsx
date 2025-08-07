import React from 'react';
import { X } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  showCloseButton?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const handleOverlayInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[50] w-full"
      onClick={handleOverlayInteraction}
      onTouchStart={handleOverlayInteraction}
    >
      {showCloseButton && (
        <button
          onClick={onClose}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20 brand-bg brand-text p-2 rounded-full shadow-lg transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 brand-text" />
        </button>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
};

export default CustomModal;
