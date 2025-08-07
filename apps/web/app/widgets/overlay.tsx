import React from 'react';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return <div onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[50]" />;
};

export { Overlay };
