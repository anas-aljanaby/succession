
import React from 'react';
import type { ToastData, ToastType } from '../../types';
import { CheckCircleSolidIcon } from '../icons/CheckCircleSolidIcon';
import { InformationCircleSolidIcon } from '../icons/InformationCircleSolidIcon';
import { ExclamationTriangleSolidIcon } from '../icons/ExclamationTriangleSolidIcon';
import { XCircleSolidIcon } from '../icons/XCircleSolidIcon';
import { XMarkIcon } from '../icons/XMarkIcon';

interface ToastProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

const toastStyles: Record<ToastType, { icon: React.ReactNode; accentClass: string; iconClass: string }> = {
  success: { icon: <CheckCircleSolidIcon />, accentClass: 'toast-success', iconClass: 'text-green-500' },
  info: { icon: <InformationCircleSolidIcon />, accentClass: 'toast-info', iconClass: 'text-blue-500' },
  warning: { icon: <ExclamationTriangleSolidIcon />, accentClass: 'toast-warning', iconClass: 'text-yellow-500' },
  error: { icon: <XCircleSolidIcon />, accentClass: 'toast-error', iconClass: 'text-red-500' },
};

export const Toast: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-4 rtl:left-auto rtl:right-4 z-50 flex flex-col-reverse items-start gap-2"
    >
      {toasts.map(toast => {
        const { icon, accentClass, iconClass } = toastStyles[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className={`smart-toast group animate-slide-up-fade ${accentClass}`}
          >
            <div className={`flex-shrink-0 ${iconClass}`}>{icon}</div>
            <div className="flex-grow">
              <p className="font-semibold text-white text-sm">{toast.title}</p>
              {toast.subtitle && <p className="text-gray-400 text-xs mt-1">{toast.subtitle}</p>}
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="absolute top-1 right-1 rtl:right-auto rtl:left-1 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-white/10 hover:bg-white/20"
              aria-label="Close notification"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
