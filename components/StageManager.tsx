import React, { useState } from 'react';
import type { Organization, SuccessionJourneyStage, Translations } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { TrashIcon } from './icons/TrashIcon';

interface StageManagerProps {
  organization: Organization;
  onSave: (updatedStages: SuccessionJourneyStage[]) => void;
  onCancel: () => void;
  t: Translations;
}

const StageManager: React.FC<StageManagerProps> = ({ organization, onSave, onCancel, t }) => {
  const [stages, setStages] = useState<SuccessionJourneyStage[]>(JSON.parse(JSON.stringify(organization.stages)));

  const handleStageNameChange = (code: string, newName: string) => {
    setStages(currentStages =>
      currentStages.map(stage => (stage.code === code ? { ...stage, name: newName } : stage))
    );
  };

  const handleMetricChange = (code: string, metric: 'cri' | 'aei', value: number) => {
    if (isNaN(value)) return;
    const clampedValue = Math.max(0, Math.min(100, value));
    setStages(currentStages =>
      currentStages.map(stage => (stage.code === code ? { ...stage, [metric]: clampedValue } : stage))
    );
  };

  const handleTaskChange = (stageCode: string, taskIndex: number, newText: string) => {
      setStages(currentStages => currentStages.map(stage => {
          if (stage.code === stageCode) {
              const updatedTasks = [...(stage.default_tasks || [])];
              updatedTasks[taskIndex] = newText;
              return { ...stage, default_tasks: updatedTasks };
          }
          return stage;
      }));
  };

  const handleAddTask = (stageCode: string) => {
       setStages(currentStages => currentStages.map(stage => {
          if (stage.code === stageCode) {
              const updatedTasks = [...(stage.default_tasks || []), ''];
              return { ...stage, default_tasks: updatedTasks };
          }
          return stage;
      }));
  };

  const handleDeleteTask = (stageCode: string, taskIndex: number) => {
       setStages(currentStages => currentStages.map(stage => {
          if (stage.code === stageCode) {
              const updatedTasks = [...(stage.default_tasks || [])];
              updatedTasks.splice(taskIndex, 1);
              return { ...stage, default_tasks: updatedTasks };
          }
          return stage;
      }));
  };

  const handleSaveChanges = () => {
    const cleanedStages = stages.map(stage => ({
        ...stage,
        default_tasks: stage.default_tasks?.filter(task => task.trim() !== '')
    }));
    onSave(cleanedStages);
  };

  return (
    <Card>
      <h3 className="text-xl font-semibold text-white mb-4">{t.manageStages}</h3>
      <div className="space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.code} className="p-4 bg-gray-900/50 rounded-lg">
            <div className="mb-4">
              <label htmlFor={`stage-${stage.code}`} className="block text-sm font-medium text-gray-400">
                {t.stage} {index + 1} ({stage.code})
              </label>
              <input
                type="text"
                id={`stage-${stage.code}`}
                value={stage.name}
                onChange={e => handleStageNameChange(stage.code, e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`stage-cri-${stage.code}`} className="block text-sm font-medium text-gray-400">{t.cri}</label>
                    <input
                        type="number"
                        id={`stage-cri-${stage.code}`}
                        value={stage.cri || 0}
                        onChange={e => handleMetricChange(stage.code, 'cri', parseInt(e.target.value, 10))}
                        min="0"
                        max="100"
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                </div>
                <div>
                    <label htmlFor={`stage-aei-${stage.code}`} className="block text-sm font-medium text-gray-400">{t.aei}</label>
                    <input
                        type="number"
                        id={`stage-aei-${stage.code}`}
                        value={stage.aei || 0}
                        onChange={e => handleMetricChange(stage.code, 'aei', parseInt(e.target.value, 10))}
                        min="0"
                        max="100"
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                </div>
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">{t.defaultTasks}</h4>
                <div className="space-y-2">
                    {(stage.default_tasks || []).map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={task}
                                onChange={(e) => handleTaskChange(stage.code, taskIndex, e.target.value)}
                                className="block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-1.5 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder={t.taskPlaceholder}
                            />
                            <Button onClick={() => handleDeleteTask(stage.code, taskIndex)} variant="secondary" size="sm" className="!p-2">
                               <TrashIcon />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button onClick={() => handleAddTask(stage.code)} variant="secondary" size="sm" className="mt-3">
                    {t.addTask}
                </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onCancel} variant="secondary">{t.cancel}</Button>
        <Button onClick={handleSaveChanges}>{t.saveChanges}</Button>
      </div>
    </Card>
  );
};

export default StageManager;