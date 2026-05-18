import React, { useMemo } from 'react';
import type { SuccessionPlan, Translations, User } from '../types';
import { Card } from './common/Card';
import { ListBulletIcon } from './icons/ListBulletIcon';

interface RemainingTasksCardProps {
  plan: SuccessionPlan;
  allUsers: User[];
  t: Translations;
}

const RemainingTasksCard: React.FC<RemainingTasksCardProps> = ({ plan, allUsers, t }) => {
  const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);

  const remainingTasks = useMemo(() => {
    const currentStageCode = plan.journey.find(task => task.status !== 'Completed')?.stageCode;
    if (!currentStageCode) return [];
    return plan.journey.filter(m => m.status !== 'Completed' && m.stageCode === currentStageCode);
  }, [plan.journey]);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <ListBulletIcon className="w-6 h-6 text-primary-400" />
        <h4 className="text-lg font-semibold text-white">{t.remainingTasks}</h4>
      </div>
      {remainingTasks.length > 0 ? (
        <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {remainingTasks.map(task => (
            <li key={task.id} className="p-2 bg-gray-900/50 rounded-md">
              <p className="text-sm text-gray-200">{task.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t.owner}: {userMap.get(task.ownerId || -1) || t.no_owner}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">{t.noUpcomingTasks}</p>
      )}
    </Card>
  );
};

export default RemainingTasksCard;
