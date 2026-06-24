import React, { createContext, useContext, useMemo, useState } from 'react';
import { notificationContent, pickLocalized } from '../lib/contentCatalog';
import { useApp } from '../store/AppContext';

export interface ShellNotification {
  id: string;
  title: string;
  message?: string;
  createdAt: string;
  read: boolean;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationMeta {
  id: string;
  createdAt: string;
  read: boolean;
  severity?: ShellNotification['severity'];
}

interface NotificationContextValue {
  notifications: ShellNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const seedNotificationMeta: NotificationMeta[] = [
  {
    id: 'notif-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    severity: 'info',
  },
  {
    id: 'notif-2',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    severity: 'success',
  },
  {
    id: 'notif-3',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    severity: 'warning',
  },
];

const NotificationContext = createContext<NotificationContextValue | null>(null);

function localizeNotifications(
  meta: NotificationMeta[],
  language: 'en' | 'ar'
): ShellNotification[] {
  return meta.map((item) => {
    const content = notificationContent[item.id];
    return {
      ...item,
      title: content
        ? pickLocalized(content.title, language, item.id)
        : item.id,
      message: content ? pickLocalized(content.message, language, '') : undefined,
    };
  });
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useApp();
  const [meta, setMeta] = useState(seedNotificationMeta);

  const notifications = useMemo(
    () => localizeNotifications(meta, state.ui.language),
    [meta, state.ui.language]
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAsRead = (id: string) => {
    setMeta((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setMeta((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useShellNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useShellNotifications must be used within NotificationProvider');
  }
  return ctx;
};
