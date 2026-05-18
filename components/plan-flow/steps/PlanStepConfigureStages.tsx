import React, { useEffect } from 'react';
import { Card } from '../../common/Card';

interface PlanStepConfigureStagesProps {
  template: any;
  configuredStages: any[];
  onChange: (v: any[]) => void;
}

export const PlanStepConfigureStages: React.FC<PlanStepConfigureStagesProps> = ({
  template,
  configuredStages,
  onChange
}) => {

  const baseStages = template?.stages || [];

  useEffect(() => {
    // Initialize configuredStages with template data if it's empty
    if (configuredStages.length === 0 && baseStages.length > 0) {
      onChange(baseStages);
    }
  }, [template, configuredStages, onChange, baseStages]);


  const handleStageChange = (index: number, field: string, value: any) => {
    const next = [...configuredStages];
    next[index] = {
      ...next[index],
      [field]: value
    };
    onChange(next);
  };

  return (
    <Card className="p-4 animate-fade-in-up">
      <h3 className="text-lg font-semibold mb-4">ضبط مراحل الخطة</h3>
      {!template && <div className="text-sm text-center py-10 text-gray-500">اختر نموذج الخطة أولاً.</div>}
      {template && (
        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">
          {configuredStages.map((stage: any, idx: number) => (
            <div key={stage.id || idx} className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
              <div className="font-medium mb-2 text-white">{stage.name}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">المدة (أيام)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-white"
                    value={stage.duration || ''}
                    onChange={(e) => handleStageChange(idx, 'duration', Number(e.target.value))}
                  />
                </div>
                <div>
                   <label className="text-xs text-gray-400 mb-1 block">المخرجات المتوقعة (اختياري)</label>
                    <input
                        type="text"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-white"
                        value={stage.expectedOutputs || ''}
                        onChange={(e) => handleStageChange(idx, 'expectedOutputs', e.target.value)}
                    />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
