import React from 'react';
import { Card } from '../common/Card';

interface StageKpiHeaderProps {
  stageName: string;
  totalCandidates: number;
  activeCandidates: number;
  completionRate: number;
  avgProgress: number;
  pendingTasks: number;
}

const KpiCard: React.FC<{ title: string; value: string | number; unit?: string }> = ({ title, value, unit }) => (
    <Card className="text-center p-4">
        <dt className="text-sm font-medium text-gray-400 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-bold tracking-tight text-white">
            {value}{unit && <span className="text-xl font-medium">{unit}</span>}
        </dd>
    </Card>
);

export const StageKpiHeader: React.FC<StageKpiHeaderProps> = (props) => {
  return (
    <div>
        <h2 className="text-2xl font-bold text-white mb-1">لوحة تحكم المرحلة: <span className="text-primary-400">{props.stageName}</span></h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
            <KpiCard title="إجمالي المرشحين" value={props.totalCandidates} />
            <KpiCard title="المرشحون النشطون" value={props.activeCandidates} />
            <KpiCard title="معدل الإنجاز" value={props.completionRate} unit="%" />
            <KpiCard title="متوسط التقدم" value={props.avgProgress} unit="%" />
            <KpiCard title="مهام معلقة" value={props.pendingTasks} />
        </div>
    </div>
  );
};
