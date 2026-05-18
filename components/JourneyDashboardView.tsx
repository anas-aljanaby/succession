
import React from 'react';
import type { JourneyDashboardData, Translations } from '../types';
import { Card } from './common/Card';

interface JourneyDashboardViewProps {
  data: JourneyDashboardData;
  t: Translations;
}

const MetricDisplay: React.FC<{ label: string; value: string | number; unit?: string; valueClassName?: string, title?: string }> = ({ label, value, unit = '', valueClassName = 'text-white', title }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg text-center flex flex-col">
        <dt className="text-sm font-medium text-gray-400 truncate order-2">{label}</dt>
        <dd className={`text-3xl font-bold tracking-tight ${valueClassName} order-1 truncate`} title={title || (typeof value === 'string' ? value : undefined)}>
            {value}{unit && <span className="text-xl font-medium">{unit}</span>}
        </dd>
    </div>
);

export const JourneyDashboardView: React.FC<JourneyDashboardViewProps> = ({ data, t }) => {
  return (
    <div>
        <h3 className="text-xl font-semibold text-white mb-4">{t.journeySnapshot}</h3>
        <Card>
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricDisplay label={t.currentStage} value={data.currentStageName} valueClassName="text-primary-400 !text-2xl" title={data.currentStageName} />
                <MetricDisplay label={t.lriScore} value={data.lriScore} unit="%" />
                <MetricDisplay label={t.orlsScore} value={data.orlsScore} unit="%" />
                <MetricDisplay label={t.cri} value={data.cri} unit="%" valueClassName="text-red-400" />
                <MetricDisplay label={t.aei} value={data.aei} unit="%" valueClassName="text-green-400" />
                <MetricDisplay label={t.stageTasksStatus} value={`${data.stageTasks.completed}/${data.stageTasks.total}`} valueClassName="text-white" />
            </dl>
        </Card>
    </div>
  );
};