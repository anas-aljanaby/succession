import React from 'react';
import { Card } from '../../common/Card';

interface PlanStepReviewAndCreateProps {
  candidate: any;
  template: any;
  stages: any[];
}

export const PlanStepReviewAndCreate: React.FC<PlanStepReviewAndCreateProps> = ({
  candidate,
  template,
  stages
}) => {
  const finalStages = stages.length > 0 ? stages : template?.stages || [];

  return (
    <Card className="p-6 animate-fade-in-up">
      <h3 className="text-lg font-semibold mb-6 text-center">مراجعة بيانات الخطة قبل الإنشاء</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">المرشح</div>
            <div className="font-semibold text-xl text-white">{candidate ? candidate.name : 'لم يتم اختيار مرشح'}</div>
            <div className="text-sm text-gray-300">{candidate ? candidate.targetPosition : ''}</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">نموذج الخطة</div>
            <div className="font-semibold text-xl text-white">{template ? template.name : 'لم يتم اختيار نموذج'}</div>
             <div className="text-sm text-gray-300">{template ? template.description : ''}</div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">مراحل الخطة</div>
          <ul className="list-disc ps-5 text-sm text-gray-300 space-y-2">
            {finalStages.length > 0
              ? finalStages.map((s: any, idx: number) => (
                  <li key={idx}>
                    <span className="font-semibold text-white">{s.name || `مرحلة رقم ${idx + 1}`}</span> — 
                    المدة: {s.duration || '?'} يوم
                    {s.expectedOutputs && ` — المخرجات: ${s.expectedOutputs}`}
                  </li>
                ))
              : <li>لا توجد مراحل مهيأة، سيتم استخدام مراحل النموذج الافتراضية.</li>}
          </ul>
        </div>

        <p className="text-xs text-gray-500 text-center pt-4">
          عند الضغط على "إنشاء الخطة" سيتم حفظ الخطة للمرشح المحدد دون التأثير على أي خطط أخرى موجودة.
        </p>
      </div>
    </Card>
  );
};
