import React from 'react';
import { useLanguage } from '../lib/i18n';
import { Button } from '../ui/Button';
import { useShellNotifications } from './NotificationContext';

const severityClass: Record<string, string> = {
  success: 'text-green-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
};

export const NotificationPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useShellNotifications();

  return (
    <div className="absolute top-full end-0 mt-2 w-80 sm:w-96 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl z-50">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-semibold text-white">{t('topbar.notifications')}</h3>
        {unreadCount > 0 ? (
          <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={markAllAsRead}>
            {t('topbar.markAllRead')}
          </Button>
        ) : null}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{t('topbar.noNotifications')}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={`w-full text-start border-b border-gray-700 last:border-b-0 p-3 transition-colors ${
                !notification.read ? 'bg-primary-900/20' : ''
              } hover:bg-gray-700/50`}
              onClick={() => {
                markAsRead(notification.id);
                onClose();
              }}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  severityClass[notification.severity ?? 'info']
                }`}
              >
                {notification.severity ?? 'info'}
              </p>
              <p className="font-semibold text-sm text-gray-100 mt-1">{notification.title}</p>
              {notification.message ? (
                <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
              ) : null}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
