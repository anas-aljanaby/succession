export const mockPlanTemplates = [
    {
        id: 'tpl-corp-standard',
        nameKey: 'template_standard_name',
        descriptionKey: 'template_standard_desc',
        stagesCount: 4,
        type: 'corporate',
        stages: [
            { name: "Assessment & Planning", duration: 30 },
            { name: "Building & Development", duration: 90 },
            { name: "Application & Evaluation", duration: 90 },
            { name: "Sustainability & Improvement", duration: 60 },
        ]
    },
    {
        id: 'tpl-corp-exec',
        nameKey: 'template_exec_name',
        descriptionKey: 'template_exec_desc',
        stagesCount: 4,
        type: 'corporate',
        stages: [
            { name: "Assessment & Planning", duration: 15 },
            { name: "Building & Development", duration: 60 },
            { name: "Application & Evaluation", duration: 60 },
            { name: "Sustainability & Improvement", duration: 45 },
        ]
    },
    {
        id: 'tpl-gov-standard',
        nameKey: 'template_gov_name',
        descriptionKey: 'template_gov_desc',
        stagesCount: 4,
        type: 'government',
        stages: [
            { name: "تحليل الاحتياجات ومواءمة التفويض", duration: 45 },
            { name: "بناء الكفاءات والتدريب على السياسات", duration: 120 },
            { name: "محاكاة تقديم الخدمة والمراجعة", duration: 90 },
            { name: "ثقة الجمهور والاستمرارية", duration: 60 },
        ]
    }
];