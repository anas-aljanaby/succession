import React, { createContext, useContext, useMemo, useState } from 'react';

export interface ShellNotification {
  id: string;
  title: string;
  message?: string;
  createdAt: string;
  read: boolean;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextValue {
  notifications: ShellNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const seedNotifications: ShellNotification[] = [
  {
    id: 'notif-1',
    title: 'Stage closure ready for review',
    message: 'Khalid Al-Ghamdi — Development stage',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    severity: 'info',
  },
  {
    id: 'notif-2',
    title: 'Readiness threshold reached',
    message: 'Sara Mansour is now at 88% for CTO',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    severity: 'success',
  },
  {
    id: 'notif-3',
    title: 'Survey reminder',
    message: 'Mid-stage evaluation due this week',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    severity: 'warning',
  },
];

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState(seedNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
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
