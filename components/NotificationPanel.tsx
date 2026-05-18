import React from 'react';
import type { NotificationData, Translations, UserRole } from '../types';
import { Button } from './common/Button';
import { CheckCircleSolidIcon } from './icons/CheckCircleSolidIcon';
import { InformationCircleSolidIcon } from './icons/InformationCircleSolidIcon';
import { ExclamationTriangleSolidIcon } from './icons/ExclamationTriangleSolidIcon';
import { XCircleSolidIcon } from './icons/XCircleSolidIcon';


const iconMap = {
  success: <CheckCircleSolidIcon className="h-5 w-5 text-green-400" />,
  info: <InformationCircleSolidIcon className="h-5 w-5 text-blue-400" />,
  warning: <ExclamationTriangleSolidIcon className="h-5 w-5 text-yellow-400" />,
  error: <XCircleSolidIcon className="h-5 w-5 text-red-400" />,
};

interface NotificationPanelProps {
  notifications: NotificationData[];
  activeRole: UserRole | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  t: Translations;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, activeRole, onMarkAsRead, onMarkAllAsRead, t }) => {
  const filteredNotifications = notifications
    .filter(n => activeRole && n.sendTo.includes(activeRole))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
  const hasUnread = filteredNotifications.some(n => !n.read);

  return (
    <div className="absolute top-full right-0 rtl:left-0 rtl:right-auto mt-2 w-80 sm:w-96 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl z-50 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-semibold text-white">{t.notifications}</h3>
        {hasUnread && (
            <Button variant="secondary" size="sm" onClick={onMarkAllAsRead}>
              {t.markAllAsRead}
            </Button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          <ul>
            {filteredNotifications.map(n => (
              <li
                key={n.id}
                className={`border-b border-gray-700 last:border-b-0 p-3 transition-colors ${!n.read ? 'bg-primary-900/20' : ''} hover:bg-gray-700/50`}
                onClick={() => onMarkAsRead(n.id)}
                role="button"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{iconMap[n.type]}</div>
                  <div className="flex-grow">
                    <p className="font-semibold text-sm text-gray-100">{n.title}</p>
                    {n.subtitle && <p className="text-xs text-gray-400 mt-1">{n.subtitle}</p>}
                    <p className="text-xs text-gray-500 mt-2">{n.timestamp.toLocaleString()}</p>
                  </div>
                   {!n.read && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>{t.noNotifications}</p>
          </div>
        )}
      </div>
    </div>
  );
};
