
import { notificationService } from './NotificationService';

export function notifyStageClosure(stageId: string, candidateName: string) {
  notificationService.add({
    type: 'stage_closure',
    title: 'تم إغلاق مرحلة',
    message: 'تم إغلاق مرحلة للمرشح: ' + candidateName,
    link: {
      view: 'stage-closure',
      params: { stageId }
    },
    severity: 'success'
  });
}

export function notifyPlanApproval(candidateId: string) {
  notificationService.add({
    type: 'plan_approval',
    title: 'تمت الموافقة على الخطة',
    message: 'تم اعتماد خطة المرشح بنجاح.',
    link: {
      view: 'candidate-plan',
      params: { candidateId }
    },
    severity: 'info'
  });
}

export function notifyReminder(message: string) {
  notificationService.add({
    type: 'reminder',
    title: 'تذكير',
    message,
    severity: 'warning'
  });
}
      