import React, { useEffect } from 'react';
import { Card } from './Card';
import { XMarkIcon } from '../icons/XMarkIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50 p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="transform transition-all w-full max-w-2xl"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <Card className="border-2 border-primary-500/30">
          <div className="flex justify-between items-center mb-4">
            <h2 id="modal-title" className="text-xl font-semibold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon />
            </button>
          </div>
          <div>{children}</div>
        </Card>
      </div>
    </div>
  );
};