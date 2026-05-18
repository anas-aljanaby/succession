/**
 * ملف: navigationMap.ts
 * الغرض: تعريف خريطة التنقل الثابتة بين الشاشات الأساسية داخل تطبيق التعاقب القيادي.
 * ملاحظة: هذا الملف للمرجعية فقط ولا يحتوي على أي منطق تنفيذي.
 */

export const NavigationMap = {
  StageClosure: 'stage-closure',
  StageEvaluation: 'survey-modal',
  LearningExperience: 'learning-experience'
} as const;

/**
 * الاستخدام المقترح:
 * setCurrentView(NavigationMap.StageClosure);
 * setCurrentView(NavigationMap.LearningExperience);
 *
 * يحظر تعديل هذه القيم لضمان ثبات الروابط عبر التطبيق.
 */
