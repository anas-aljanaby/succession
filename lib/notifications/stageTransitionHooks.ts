
import { notificationService } from './NotificationService';

export function notifyStageTransitionBlocked(stageId: string, reason: string) {
  notificationService.add({
    type: 'warning',
    title: 'تعذّر الانتقال للمرحلة التالية',
    message: reason,
    severity: 'warning'
  });
}
      