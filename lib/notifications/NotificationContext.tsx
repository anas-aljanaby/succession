
import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationService, AppNotification } from './NotificationService';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  add: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsub = notificationService.subscribe((list) => {
      setNotifications(list);
    });
    return () => unsub();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        add: (n) => notificationService.add(n),
        markAsRead: (id) => notificationService.markAsRead(id),
        markAllAsRead: () => notificationService.markAllAsRead()
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
      