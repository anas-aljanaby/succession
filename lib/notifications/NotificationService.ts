
export type NotificationType =
  | 'system'
  | 'stage_closure'
  | 'plan_approval'
  | 'candidate_activity'
  | 'reminder'
  | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: string;
  read: boolean;
  link?: {
    view: string; // مثل: 'stage-closure', 'candidate-plan', 'monitor'
    params?: Record<string, any>;
  };
  severity?: 'info' | 'success' | 'warning' | 'error';
}

class NotificationService {
  private listeners: ((list: AppNotification[]) => void)[] = [];
  private notifications: AppNotification[] = [];

  getAll() {
    return this.notifications;
  }

  subscribe(cb: (list: AppNotification[]) => void) {
    this.listeners.push(cb);
    cb(this.notifications);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyAll() {
    this.listeners.forEach((l) => l(this.notifications));
  }

  add(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const newNotification: AppNotification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        read: false,
    }
    // لا نستبدل الإشعارات الموجودة
    this.notifications = [newNotification, ...this.notifications];
    this.notifyAll();
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifyAll();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notifyAll();
  }
}

export const notificationService = new NotificationService();

// توحيد نقطة الإدخال للنظام الحالي
// يمكن استدعاؤها من أي مكوّن دون تغيير بنيته
// window.appApi?.notify(...) سيستخدم هذه الخدمة
if (typeof window !== 'undefined') {
  (window as any).appNotifications = notificationService;
}
      