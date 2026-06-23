import React from 'react';
import type { Translations } from '../../types';
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
    };
    t: Translations;
}

const ConsultantMetrics: React.FC<ConsultantMetricsProps> = ({ metrics, t }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title={t.totalOrganizations} value={metrics.totalOrganizations} />
            <MetricCard title={t.totalActiveCandidates} value={metrics.activeCandidates} />
            <MetricCard title={t.overallCompletionRate} value={metrics.averageProgress} unit="%" />
            <MetricCard title={t.activeInactiveOrgs} value={`${metrics.activeOrganizations} / ${metrics.totalOrganizations - metrics.activeOrganizations}`} />
            <MetricCard title={t.stagesNeedingApproval} value={metrics.pendingApprovals} />
            <MetricCard title={t.plansCompletedThisMonth} value={metrics.monthlyGrowth} />
        </div>
    );
};

export default ConsultantMetrics;
