import React, { useState, useEffect, useMemo } from 'react';
import type { Translations, SuccessionPlan, Organization } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { mockConsultantMetrics } from '../../data/mockConsultantMetrics';
import ConsultantMetrics from './ConsultantMetrics';
import ActivityTimeline from './ActivityTimeline';
import QuickActions from './QuickActions';

interface ConsultantDashboardProps {
    allPlans: SuccessionPlan[];
    allOrganizations: Organization[];
    t: Translations;
    onEnterOrg: (orgId: number) => void;
}

const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ allPlans, allOrganizations, t, onEnterOrg }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const organizationsWithCandidateCount = useMemo(() => {
        return allOrganizations.map(org => ({
            ...org,
            candidateCount: allPlans.filter(p => p.orgId === org.id).length,
        }));
    }, [allOrganizations, allPlans]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner />
                <span className="ml-4 text-gray-400">{t.loadingConsultantDashboard}</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h2 className="text-3xl font-bold text-white">{t.consultantDashboardTitle}</h2>
                <p className="text-gray-400 mt-1">{t.allOrgsOverview}</p>
            </div>

            <ConsultantMetrics metrics={mockConsultantMetrics} t={t} />

            <Card className="col-span-1 lg:col-span-3">
                <h3 className="text-xl font-semibold text-white mb-4">{t.orgsTable}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-400">{t.orgName}</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">{t.candidateCount}</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">{t.lastActivity}</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizationsWithCandidateCount.map(org => (
                                <tr key={org.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50">
                                    <td className="p-4 whitespace-nowrap text-white font-medium">{org.name}</td>
                                    <td className="p-4 whitespace-nowrap text-gray-300">{org.candidateCount}</td>
                                    <td className="p-4 whitespace-nowrap text-gray-400">{new Date(Date.now() - Math.random() * 10 * 24 * 3600 * 1000).toLocaleDateString()}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <Button variant="secondary" size="sm" onClick={() => onEnterOrg(org.id)}>{t.enterWorkspace}</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-xl font-semibold text-white mb-4">{t.alerts}</h3>
                     <div className="space-y-3">
                        <div className="p-3 bg-yellow-900/50 rounded-md text-yellow-300">{t.delayedCandidates.replace('{count}', '4')}</div>
                        <div className="p-3 bg-red-900/50 rounded-md text-red-300">{t.atRiskOrgs.replace('{count}', '2')}</div>
                     </div>
                </Card>
                <Card className="lg:col-span-2">
                     <h3 className="text-xl font-semibold text-white mb-4">{t.quickActions}</h3>
                     <QuickActions t={t} />
                </Card>
            </div>

            <ActivityTimeline t={t} />
        </div>
    );
};

export default ConsultantDashboard;
