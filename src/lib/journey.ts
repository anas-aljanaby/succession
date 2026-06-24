import type { InstitutionType, JourneyStage, Language, TaskStatus } from '../types';

type StageTemplate = { code: string; name: string; tasks: string[] };

const JOURNEY_TEMPLATES: Record<InstitutionType, Record<Language, StageTemplate[]>> = {
  corporate: {
    en: [
      {
        code: 'STG1',
        name: 'Assessment & Planning',
        tasks: [
          'Review the current leadership structure',
          'Define the target role profile',
          'Agree on selection criteria',
        ],
      },
      {
        code: 'STG2',
        name: 'Building & Development',
        tasks: [
          'Run the qualification program',
          'Assign a mentor',
          'Track progress against the plan',
        ],
      },
      {
        code: 'STG3',
        name: 'Application & Evaluation',
        tasks: [
          'Lead a stretch assignment',
          'Evaluate development outcomes',
          'Refine the plan',
        ],
      },
      {
        code: 'STG4',
        name: 'Sustainability & Improvement',
        tasks: ['Follow up after transition', 'Monitor sustained impact'],
      },
    ],
    ar: [
      {
        code: 'STG1',
        name: 'التقييم والتخطيط',
        tasks: [
          'مراجعة الهيكل القيادي الحالي',
          'تحديد ملف المنصب المستهدف',
          'الاتفاق على معايير الاختيار',
        ],
      },
      {
        code: 'STG2',
        name: 'البناء والتطوير',
        tasks: [
          'تنفيذ برنامج التأهيل',
          'تعيين مرشد',
          'متابعة التقدم وفق الخطة',
        ],
      },
      {
        code: 'STG3',
        name: 'التطبيق والتقويم',
        tasks: [
          'قيادة مهمة تطويرية',
          'تقييم نتائج التطوير',
          'تحسين الخطة',
        ],
      },
      {
        code: 'STG4',
        name: 'الاستدامة والتحسين',
        tasks: ['المتابعة بعد الانتقال', 'رصد الأثر المستدام'],
      },
    ],
  },
  government: {
    en: [
      {
        code: 'STG1',
        name: 'Needs Analysis & Mandate Alignment',
        tasks: [
          'Review the current leadership structure',
          'Define the target role profile',
          'Agree on selection criteria',
        ],
      },
      {
        code: 'STG2',
        name: 'Competency Building & Policy Training',
        tasks: [
          'Run the qualification program',
          'Assign a mentor',
          'Track progress against the plan',
        ],
      },
      {
        code: 'STG3',
        name: 'Service Delivery Simulation & Review',
        tasks: [
          'Lead a stretch assignment',
          'Evaluate development outcomes',
          'Refine the plan',
        ],
      },
      {
        code: 'STG4',
        name: 'Public Trust & Continuity',
        tasks: ['Follow up after transition', 'Monitor sustained impact'],
      },
    ],
    ar: [
      {
        code: 'STG1',
        name: 'تحليل الاحتياجات ومواءمة التفويض',
        tasks: [
          'مراجعة الهيكل القيادي الحالي',
          'تحديد ملف المنصب المستهدف',
          'الاتفاق على معايير الاختيار',
        ],
      },
      {
        code: 'STG2',
        name: 'بناء الكفاءات والتدريب على السياسات',
        tasks: [
          'تنفيذ برنامج التأهيل',
          'تعيين مرشد',
          'متابعة التقدم وفق الخطة',
        ],
      },
      {
        code: 'STG3',
        name: 'محاكاة تقديم الخدمة والمراجعة',
        tasks: [
          'قيادة مهمة تطويرية',
          'تقييم نتائج التطوير',
          'تحسين الخطة',
        ],
      },
      {
        code: 'STG4',
        name: 'ثقة الجمهور والاستمرارية',
        tasks: ['المتابعة بعد الانتقال', 'رصد الأثر المستدام'],
      },
    ],
  },
  education: {
    en: [
      {
        code: 'STG1',
        name: 'Curriculum Review & Vision Setting',
        tasks: [
          'Review the current leadership structure',
          'Define the target role profile',
          'Agree on selection criteria',
        ],
      },
      {
        code: 'STG2',
        name: 'Pedagogical Leadership Development',
        tasks: [
          'Run the qualification program',
          'Assign a mentor',
          'Track progress against the plan',
        ],
      },
      {
        code: 'STG3',
        name: 'Academic Program Implementation',
        tasks: [
          'Lead a stretch assignment',
          'Evaluate development outcomes',
          'Refine the plan',
        ],
      },
      {
        code: 'STG4',
        name: 'Scholarly Excellence & Succession',
        tasks: ['Follow up after transition', 'Monitor sustained impact'],
      },
    ],
    ar: [
      {
        code: 'STG1',
        name: 'مراجعة المناهج ووضع الرؤية',
        tasks: [
          'مراجعة الهيكل القيادي الحالي',
          'تحديد ملف المنصب المستهدف',
          'الاتفاق على معايير الاختيار',
        ],
      },
      {
        code: 'STG2',
        name: 'تطوير القيادة التربوية',
        tasks: [
          'تنفيذ برنامج التأهيل',
          'تعيين مرشد',
          'متابعة التقدم وفق الخطة',
        ],
      },
      {
        code: 'STG3',
        name: 'تنفيذ البرامج الأكاديمية',
        tasks: [
          'قيادة مهمة تطويرية',
          'تقييم نتائج التطوير',
          'تحسين الخطة',
        ],
      },
      {
        code: 'STG4',
        name: 'التميز العلمي والتعاقب',
        tasks: ['المتابعة بعد الانتقال', 'رصد الأثر المستدام'],
      },
    ],
  },
  charity: {
    en: [
      {
        code: 'STG1',
        name: 'Mission Alignment & Stakeholder Analysis',
        tasks: [
          'Review the current leadership structure',
          'Define the target role profile',
          'Agree on selection criteria',
        ],
      },
      {
        code: 'STG2',
        name: 'Fundraising & Community Engagement',
        tasks: [
          'Run the qualification program',
          'Assign a mentor',
          'Track progress against the plan',
        ],
      },
      {
        code: 'STG3',
        name: 'Program Impact Assessment',
        tasks: [
          'Lead a stretch assignment',
          'Evaluate development outcomes',
          'Refine the plan',
        ],
      },
      {
        code: 'STG4',
        name: 'Legacy & Volunteer Leadership',
        tasks: ['Follow up after transition', 'Monitor sustained impact'],
      },
    ],
    ar: [
      {
        code: 'STG1',
        name: 'التقييم والتخطيط',
        tasks: [
          'مراجعة الهيكل القيادي الحالي',
          'تحديد ملف المنصب المستهدف',
          'الاتفاق على معايير الاختيار',
        ],
      },
      {
        code: 'STG2',
        name: 'البناء والتطوير',
        tasks: [
          'تنفيذ برنامج التأهيل',
          'تعيين مرشد',
          'متابعة التقدم وفق الخطة',
        ],
      },
      {
        code: 'STG3',
        name: 'التطبيق والتقويم',
        tasks: [
          'قيادة مهمة تطويرية',
          'تقييم نتائج التطوير',
          'تحسين الخطة',
        ],
      },
      {
        code: 'STG4',
        name: 'الاستدامة والتحسين',
        tasks: ['المتابعة بعد الانتقال', 'رصد الأثر المستدام'],
      },
    ],
  },
};

let taskCounter = 0;

export function getJourneyTemplate(
  institutionType: InstitutionType,
  language: Language
): StageTemplate[] {
  return JOURNEY_TEMPLATES[institutionType][language];
}

export function defaultJourney(
  initialStatuses: TaskStatus[][] = [],
  institutionType: InstitutionType = 'corporate',
  language: Language = 'en'
): JourneyStage[] {
  return getJourneyTemplate(institutionType, language).map((stage, stageIndex) => ({
    code: stage.code,
    name: stage.name,
    tasks: stage.tasks.map((title, taskIndex) => ({
      id: `task-${stage.code}-${taskIndex}-${taskCounter++}`,
      title,
      status: initialStatuses[stageIndex]?.[taskIndex] ?? ('notStarted' as TaskStatus),
    })),
  }));
}

export function localizeJourney(
  journey: JourneyStage[],
  institutionType: InstitutionType,
  language: Language
): JourneyStage[] {
  const template = getJourneyTemplate(institutionType, language);
  const templateByCode = new Map(template.map((stage) => [stage.code, stage]));

  return journey.map((stage) => {
    const localized = templateByCode.get(stage.code);
    if (!localized) return stage;

    return {
      ...stage,
      name: localized.name,
      tasks: stage.tasks.map((task, taskIndex) => ({
        ...task,
        title: localized.tasks[taskIndex] ?? task.title,
      })),
    };
  });
}
