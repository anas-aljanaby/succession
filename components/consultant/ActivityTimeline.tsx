import React, { useState } from 'react';
import type { Translations } from '../../types';
import { Card } from '../common/Card';
import { Select } from '../common/Select';
import { mockActivityLog } from '../../data/mockActivityLog';

interface ActivityTimelineProps {
  t: Translations;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ t }) => {
  const [filter, setFilter] = useState('');

  const filteredActivities = mockActivityLog.filter(
    (activity) => !filter || activity.type === filter
  );

  const activityTypes = [...new Set(mockActivityLog.map(a => a.type))];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">{t.latestActivities}</h3>
        <div className="w-48">
          <Select
            options={activityTypes.map(type => ({ value: type, label: type }))}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t.filterByActivity}
          />
        </div>
      </div>
      <ul className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.map((activity) => (
          <li key={activity.id} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-md">
            <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"></div>
            <div className="flex-grow text-sm">
              <span className="font-semibold text-gray-200">{activity.type}</span>
              <span className="text-gray-400"> - {activity.organization} ({activity.candidate})</span>
            </div>
            <div className="text-xs text-gray-500">{activity.timestamp.toLocaleTimeString()}</div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default ActivityTimeline;
