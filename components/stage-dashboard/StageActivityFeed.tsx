import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { mockStageActivities } from '../../data/mockStageDashboard';
import type { StageActivity } from '../../types';
import { Spinner } from '../common/Spinner';

interface StageActivityFeedProps {
  stageCode: string;
}

export const StageActivityFeed: React.FC<StageActivityFeedProps> = ({ stageCode }) => {
  const [activities, setActivities] = useState<StageActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching activities for the specific stage
    setTimeout(() => {
      setActivities(mockStageActivities);
      setLoading(false);
    }, 1000);
  }, [stageCode]);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-3">آخر الأنشطة في هذه المرحلة</h3>
      {loading && <div className="flex justify-center p-8"><Spinner /></div>}
      
      {!loading && activities.length === 0 && (
        <div className="text-sm text-center text-gray-500 py-8">لا توجد أنشطة مسجلة لهذه المرحلة.</div>
      )}

      {!loading && activities.length > 0 && (
          <ul className="flex flex-col gap-3 max-h-96 overflow-y-auto">
            {activities.map((act) => (
              <li key={act.id} className="flex items-center gap-3 border-b border-gray-700/50 pb-3 last:border-none last:pb-0">
                <div className="flex-grow">
                  <div className="text-sm font-medium text-gray-200">{act.title}</div>
                  <div className="text-xs text-gray-400">{act.candidateName} • {act.time}</div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">{act.type}</div>
              </li>
            ))}
          </ul>
      )}
    </Card>
  );
};
