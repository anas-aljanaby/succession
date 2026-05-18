import React from 'react';
import { Card } from '../common/Card';

interface MetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit }) => (
    <Card className="text-center">
        <dt className="text-sm font-medium text-gray-400 truncate">{title}</dt>
        <dd className="mt-1 text-4xl font-bold tracking-tight text-white">
            {value}{unit && <span className="text-2xl font-medium">{unit}</span>}
        </dd>
    </Card>
);

interface ConsultantMetricsProps {
    metrics: {
        totalOrganizations: number;
        activeCandidates: number;
        averageProgress: number;
        activeOrganizations: number;
        pendingApprovals: number;
        monthlyGrowth: number;
    }
}

const ConsultantMetrics: React.FC<ConsultantMetricsProps> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="إجمالي المؤسسات" value={metrics.totalOrganizations} />
            <MetricCard title="إجمالي المرشحين النشطين" value={metrics.activeCandidates} />
            <MetricCard title="معدل الإنجاز العام" value={metrics.averageProgress} unit="%" />
            <MetricCard title="المؤسسات النشطة/غير النشطة" value={`${metrics.activeOrganizations} / ${metrics.totalOrganizations - metrics.activeOrganizations}`} />
            <MetricCard title="مراحل تحتاج موافقة" value={metrics.pendingApprovals} />
            <MetricCard title="الخطط المكتملة هذا الشهر" value={metrics.monthlyGrowth} />
        </div>
    );
};

export default ConsultantMetrics;
