
import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const StageTransitionNotice: React.FC<{ message: string; onClose: () => void; isOpen: boolean }> = ({ message, onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تنبيه الانتقال بين المراحل">
        <p className="text-sm text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end">
          <Button onClick={onClose}>
            متابعة
          </Button>
        </div>
    </Modal>
  );
};
      