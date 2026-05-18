import type { StageDashboardData, StageActivity } from '../types';

export const mockStageDashboardData: StageDashboardData = {
  stageName: 'البناء والتطوير',
  totalCandidates: 8,
  activeCandidates: 6,
  completionRate: 75,
  avgProgress: 68,
  pendingTasks: 12,
  candidates: [
    { id: 'cand-101', name: 'Khalid Al-Ghamdi', targetPosition: 'Chief Technology Officer', progress: 45, status: 'active', nextAction: 'Complete cloud architecture course', lastActivity: 'قبل يومين', planId: 1 },
    { id: 'cand-105', name: 'Youssef Mansour', targetPosition: 'Director of Digital Transformation', progress: 90, status: 'active', nextAction: 'Post-transition follow-up', lastActivity: 'قبل 5 أيام', planId: 2 },
    { id: 'cand-108', name: 'Mariam Adel', targetPosition: 'Head of Legal Affairs', progress: 33, status: 'active', nextAction: 'Review new legislation', lastActivity: 'قبل 7 أيام', planId: 3 }, // Assuming planId 3
    { id: 'cand-109', name: 'Sami Hassan', targetPosition: 'Director of Admissions', progress: 60, status: 'active', nextAction: 'Analyze admission trends', lastActivity: 'قبل 3 أيام', planId: 4 }, // Assuming planId 4
    { id: 'cand-104', name: 'Nora Faisal', targetPosition: 'HR Director', progress: 25, status: 'paused', nextAction: 'Resume development plan', lastActivity: 'قبل 45 يوماً', planId: 5 }, // Assuming planId 5
    { id: 'cand-103', name: 'Omar Abdullah', targetPosition: 'Chief Marketing Officer', progress: 100, status: 'completed', nextAction: '-', lastActivity: 'الشهر الماضي', planId: 6 }, // Assuming planId 6
  ],
};

export const mockStageActivities: StageActivity[] = [
  { id: 'act-1', title: 'اكتملت المهمة', candidateName: 'خالد الغامدي', time: 'منذ ساعتين', type: 'تقدم' },
  { id: 'act-2', title: 'تمت إضافة تأمل جديد', candidateName: 'يوسف منصور', time: 'منذ 5 ساعات', type: 'تفاعل' },
  { id: 'act-3', title: 'تم إرجاع المهمة للمراجعة', candidateName: 'سامي حسن', time: 'أمس', type: 'ملاحظات' },
  { id: 'act-4', title: 'تم إرسال ملاحظات', candidateName: 'مريم عادل', time: 'أمس', type: 'توجيه' },
  { id: 'act-5', title: 'تأخرت المهمة', candidateName: 'نورة فيصل', time: 'قبل 3 أيام', type: 'تنبيه' },
];
