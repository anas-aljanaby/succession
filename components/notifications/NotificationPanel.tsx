
import React from 'react';
import { useNotifications } from '../../lib/notifications/NotificationContext';
import { Button } from '../common/Button';
import { translations } from '../../constants';
import { CheckCircleSolidIcon } from '../icons/CheckCircleSolidIcon';
import { InformationCircleSolidIcon } from '../icons/InformationCircleSolidIcon';
import { ExclamationTriangleSolidIcon } from '../icons/ExclamationTriangleSolidIcon';
import { XCircleSolidIcon } from '../icons/XCircleSolidIcon';

const iconMap = {
  success: <CheckCircleSolidIcon className="h-5 w-5 text-green-400" />,
  info: <InformationCircleSolidIcon className="h-5 w-5 text-blue-400" />,
  warning: <ExclamationTriangleSolidIcon className="h-5 w-5 text-yellow-400" />,
  error: <XCircleSolidIcon className="h-5 w-5 text-red-400" />,
};

export const NotificationPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const t = translations['ar']; // Assuming a default for now

  return (
    <div className="absolute top-full right-0 rtl:left-0 rtl:right-auto mt-2 w-80 sm:w-96 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl z-50 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-semibold text-white">{t.notifications}</h3>
        {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              {t.markAllAsRead}
            </Button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>{t.noNotifications}</p>
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`border-b border-gray-700 last:border-b-0 p-3 transition-colors ${!n.read ? 'bg-primary-900/20' : ''} hover:bg-gray-700/50`}
            role="button"
            onClick={() => {
              if (n.link) {
                (window as any).appApi?.navigateTo?.(n.link.view, n.link.params || {});
                if(onClose) onClose();
              }
              if (!n.read) markAsRead(n.id);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">{n.severity && iconMap[n.severity]}</div>
              <div className="flex-grow">
                <p className="font-semibold text-sm text-gray-100">{n.title}</p>
                {n.message && <p className="text-xs text-gray-400 mt-1">{n.message}</p>}
                <p className="text-xs text-gray-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                 {!n.read && (
                    <button className="text-xs text-primary-400 hover:underline mt-2" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}>
                        تعليم كمقروء
                    </button>
                 )}
              </div>
              {!n.read && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
      