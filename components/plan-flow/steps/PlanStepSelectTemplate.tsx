import React from 'react';
import { Card } from '../../common/Card';

interface PlanStepSelectTemplateProps {
  selectedTemplate?: any;
  onSelectTemplate: (t: any) => void;
  t: any;
}

export const PlanStepSelectTemplate: React.FC<PlanStepSelectTemplateProps> = ({
  selectedTemplate,
  onSelectTemplate,
  t
}) => {
  const [templates, setTemplates] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Read existing templates from the app
    const data = (window as any).appApi?.getPlanTemplates?.() || [];
    setTemplates(data);
  }, []);

  return (
    <Card className="p-4 animate-fade-in-up">
      <h3 className="text-lg font-semibold mb-4">اختر نموذج الخطة</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 cursor-pointer rounded-lg border-2 h-full flex flex-col justify-between ${selectedTemplate?.id === template.id ? 'border-primary-500 bg-primary-900/20' : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'}`}
            onClick={() => onSelectTemplate(template)}
          >
            <div>
              <div className="font-medium mb-1 text-white">{t[template.nameKey] || template.name}</div>
              <div className="text-sm text-gray-400">{t[template.descriptionKey] || template.description}</div>
            </div>
            <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-700">يشمل {template.stagesCount || 4} مراحل</div>
          </div>
        ))}
      </div>
      {templates.length === 0 && (
        <div className="text-sm text-center py-10 text-gray-500">لا توجد قوالب خطط متاحة حالياً.</div>
      )}
    </Card>
  );
};