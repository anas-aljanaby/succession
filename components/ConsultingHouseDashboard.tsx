import React, { useMemo, useState } from 'react';
import type { SuccessionPlan, Organization, ReflectionLog, Translations, Language, MonthlyReport, ReportData, DevelopmentRecommendation, InstitutionalArchiveEntry } from '../types';
import { Card } from './common/Card';
import { analyzeValuesFromReflections } from '../services/valueAnalysisService';
import { Button } from './common/Button';
import { PlayIcon } from './icons/PlayIcon';
import { Spinner } from './common/Spinner';
import { Modal } from './common/Modal';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import DonutChart from './common/DonutChart';
import { improvementAreas } from '../constants';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

interface ConsultingHouseDashboardProps {
  allPlans: SuccessionPlan[];
  allOrganizations: Organization[];
  allReflectionLogs: ReflectionLog[];
  t: Translations;
  language: Language;
  onRunDailyAnalysis: () => Promise<void>;
  onUpdateOrganization: (org: Organization) => void;
}

function MetricCard({ title, value }: { title: string; value: string; }) {
    return (
        <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-300">{title}</h3>
            <p className="text-5xl font-bold text-white mt-2">{value}</p>
        </Card>
    );
}

function ReportDetailView({ reportData, t }: { reportData: ReportData, t: Translations }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">{t.avgLriScore}</p>
                    <p className="text-2xl font-bold">{reportData.avgLri}%</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">{t.orlsScore}</p>
                    <p className="text-2xl font-bold">{reportData.orls}%</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">{t.avgBvi}</p>
                    <p className="text-2xl font-bold">{reportData.avgBvi}</p>
                </div>
                 <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">{t.avgCri}</p>
                    <p className="text-2xl font-bold text-red-400">{reportData.avgCri}%</p>
                </div>
                 <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">{t.avgAei}</p>
                    <p className="text-2xl font-bold text-green-400">{reportData.avgAei}%</p>
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-2">{t.insightHistoryTitle}</h4>
                <div className="space-y-2 bg-gray-800 p-3 rounded-lg max-h-40 overflow-y-auto">
                {reportData.insights.length > 0 ? reportData.insights.map((insight, index) => (
                    <p key={index} className="text-xs text-gray-300 border-b border-gray-700 pb-1 last:border-b-0">{insight}</p>
                )) : <p className="text-xs text-gray-500">{t.noInsights}</p>}
                </div>
            </div>
        </div>
    );
}

// Fix: Converted StarIcon to a React.FC component to correctly handle React's `key` prop type and resolve the assignment error.
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`h-6 w-6 transition-colors ${filled ? 'text-amber-400' : 'text-gray-600'}`}
        >
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
        </svg>
    );
};

function ArchiveDetailModal({ entry, onClose, t }: { entry: InstitutionalArchiveEntry, onClose: () => void, t: Translations }) {
    return (
        <Modal isOpen={true} onClose={onClose} title={t.archiveDetails}>
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div><strong className="text-gray-400">{t.archiveDate}:</strong> {new Date(entry.archiveDate).toLocaleString()}</div>
                    <div><strong className="text-gray-400">{t.plan}:</strong> {entry.candidateName} - {entry.roleTitle}</div>
                    <div><strong className="text-gray-400">{t.stage}:</strong> {entry.stageName} ({entry.stageCode})</div>
                </div>
                <div className="space-y-4 pt-4 mt-4 border-t border-gray-700">
                     <p><strong className="text-gray-400">{t.readinessIndex}:</strong> <span className="font-mono text-lg">{entry.data.readinessIndex}%</span></p>
                     <p><strong className="text-gray-400">{t.maturityIndex}:</strong> <span className="font-mono text-lg">{entry.data.maturityIndex}%</span></p>
                     <div>
                        <strong className="text-gray-400 block mb-1">{t.expectedResults}:</strong>
                        <p className="p-2 bg-gray-900/50 rounded-md text-gray-300">{entry.data.expectedResults || t.none}</p>
                    </div>
                    <div>
                        <strong className="text-gray-400 block mb-1">{t.actualResults}:</strong>
                        <p className="p-2 bg-gray-900/50 rounded-md text-gray-300">{entry.data.actualResults || t.none}</p>
                    </div>
                    <div>
                        <strong className="text-gray-400 block mb-1">{t.gapAnalysis}:</strong>
                        <p className="p-2 bg-gray-900/50 rounded-md text-gray-300">{entry.data.gapAnalysis || t.none}</p>
                    </div>
                     <div>
                        <strong className="text-gray-400 block mb-1">{t.stageClosure_lessonsLearned}:</strong>
                        <p className="p-2 bg-gray-900/50 rounded-md text-gray-300">{entry.data.lessonsLearned || t.none}</p>
                    </div>
                    <div>
                        <strong className="text-gray-400 block mb-2">{t.finalRating}:</strong>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                                <StarIcon key={star} filled={star <= entry.data.finalRating} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <strong className="text-gray-400 block mb-2">{t.stageClosure_processReview}:</strong>
                        <ul className="space-y-1 pl-2">
                            <li><span className="font-medium text-gray-400">{t.stageClosure_clarityOfGoals}:</span> {entry.data.processRatings.clarity}/5</li>
                            <li><span className="font-medium text-gray-400">{t.stageClosure_resourceQuality}:</span> {entry.data.processRatings.resources}/5</li>
                            <li><span className="font-medium text-gray-400">{t.stageClosure_feedbackEffectiveness}:</span> {entry.data.processRatings.feedback}/5</li>
                        </ul>
                    </div>
                    <div>
                        <strong className="text-gray-400 block mb-1">{t.signatures}:</strong>
                        <ul className="list-disc pl-5 text-gray-300">
                            {/* Fix: Explicitly type the destructured array from Object.entries to resolve type inference issue. */}
                            {Object.entries(entry.data.signatures).map(([role, timestamp]: [string, string | null]) => (
                                <li key={role}><strong>{t[`stageClosure_signature_${role}`] || role}:</strong> {timestamp ? `${t.stageClosure_signed} @ ${new Date(timestamp).toLocaleString()}` : t.notSigned}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                 <div className="flex justify-end mt-6">
                    <Button onClick={onClose}>{t.close}</Button>
                </div>
            </div>
        </Modal>
    );
}

type PendingReport = { org: Organization, report: MonthlyReport };

function ConsultingHouseDashboard({ allPlans, allOrganizations, allReflectionLogs, t, language, onRunDailyAnalysis, onUpdateOrganization }: ConsultingHouseDashboardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ org: Organization, report: MonthlyReport } | null>(null);
  const [selectedOrgForArchive, setSelectedOrgForArchive] = useState<Organization | null>(null);
  const [selectedArchiveEntry, setSelectedArchiveEntry] = useState<InstitutionalArchiveEntry | null>(null);

  const avgLri = useMemo(() => {
    if (allPlans.length === 0) return 0;
    const total = allPlans.reduce((acc, plan) => acc + plan.readiness, 0);
    return Math.round(total / allPlans.length);
  }, [allPlans]);

  const avgOrls = useMemo(() => {
    if (allOrganizations.length === 0) return 0;
    const total = allOrganizations.reduce((acc, org) => {
        const scores = Object.values(org.orlsAssessment) as number[];
        const orgTotal = scores.reduce((sum, score) => sum + score, 0);
        return acc + (scores.length > 0 ? orgTotal / scores.length : 0);
    }, 0);
    return Math.round(total / allOrganizations.length);
  }, [allOrganizations]);
  
  const avgBvi = useMemo(() => {
    if (allPlans.length === 0) return 0;
    const total = allPlans.reduce((acc, plan) => acc + plan.bvi, 0);
    return Math.round(total / allPlans.length);
  }, [allPlans]);

// Fix: Refactored to use `flatMap` for better type safety and immutability, which should resolve the type inference error in the `sort` callback. Also, changed the sort order to be descending (most recent first).
  const pendingReports = useMemo(() => {
    const reports: PendingReport[] = allOrganizations.flatMap(org =>
        (org.monthly_reports || [])
            .filter(report => report.status === 'pending_review')
            .map(report => ({ org, report }))
    );
    // Fix: Explicitly type the parameters of the sort callback function to resolve a TypeScript type inference issue.
    return reports.sort((a: PendingReport, b: PendingReport) => new Date(b.report.date).getTime() - new Date(a.report.date).getTime());
  }, [allOrganizations]);

    const globalImprovementThemesData = useMemo(() => {
        // Fix: Explicitly type allRecommendations to help with type inference in the following reduce function.
        const allRecommendations: DevelopmentRecommendation[] = allPlans.flatMap(p => p.developmentRecommendations || []);
        if (allRecommendations.length === 0) return [];
        
        const counts = allRecommendations.reduce((acc, rec) => {
            acc[rec.improvementArea] = (acc[rec.improvementArea] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const languageKey = language === 'ar' ? 'name_ar' : 'name_en';

        return Object.entries(counts)
            .map(([key, value]) => ({
                label: improvementAreas.find(area => area.key === key)?.[languageKey] || key,
                value,
            }))
            .sort((a, b) => b.value - a.value);

    }, [allPlans, language]);


  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    await onRunDailyAnalysis();
    setIsAnalyzing(false);
    alert(t.analysisComplete);
  };

  const handleViewReport = (org: Organization, report: MonthlyReport) => {
      setSelectedReport({ org, report });
      setIsReportModalOpen(true);
  };

  const handleMarkAsReviewed = (orgId: number, reportDate: string) => {
      const org = allOrganizations.find(o => o.id === orgId);
      if (!org) return;
      
      const updatedReports = (org.monthly_reports || []).map(r => 
        r.date === reportDate ? { ...r, status: 'reviewed' as 'reviewed' } : r
      );
      
      onUpdateOrganization({ ...org, monthly_reports: updatedReports });
  };
  
  const handleViewArchive = (org: Organization) => {
      setSelectedOrgForArchive(org);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-white">{t.consultingDashboardTitle}</h2>
            <p className="text-gray-400 mt-1">{t.overview}</p>
        </div>
        <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? <Spinner/> : <PlayIcon />}
            {isAnalyzing ? t.analyzing : t.runDailyAnalysis}
        </Button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title={t.avgLriScore} value={`${avgLri}%`} />
        <MetricCard title={t.avgOrls} value={`${avgOrls}%`} />
        <MetricCard title={t.avgBvi} value={`${avgBvi}`} />
      </div>
      
       {/* Monthly Reports & Global Themes */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className={pendingReports.length === 0 ? 'border-dashed !border-white/[.08]' : ''}>
                <div className="flex items-center gap-3 mb-4">
                    <DocumentTextIcon className="text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">{t.monthlyReports}</h3>
                </div>
                {pendingReports.length > 0 ? (
                    <ul className="space-y-3 max-h-60 overflow-y-auto">
                        {pendingReports.map(({ org, report }) => (
                            <li key={`${org.id}-${report.date}`} className="p-3 bg-gray-900/50 rounded-md">
                                <div className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-200">{org.name}</p>
                                        <p className="text-xs text-gray-400">{new Date(report.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleViewReport(org, report)} variant="secondary" size="sm">{t.viewReport}</Button>
                                        <Button onClick={() => handleMarkAsReviewed(org.id, report.date)} size="sm">{t.markReviewed}</Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-4 min-h-[240px]">
                        <DocumentTextIcon className="w-16 h-16 text-gray-500 opacity-30" />
                        <p className="mt-4 text-sm text-gray-500">{t.noPendingReports}</p>
                    </div>
                )}
            </Card>

            <Card>
                <h3 className="text-xl font-semibold text-white mb-4">{t.globalTopImprovementThemes}</h3>
                {globalImprovementThemesData.length > 0 ? (
                    <DonutChart data={globalImprovementThemesData} />
                ) : (
                    <div className="text-center py-10 text-gray-500">{t.noData}</div>
                )}
            </Card>
        </div>

      {/* Organizational Overview */}
      <div>
        <h3 className="text-2xl font-semibold text-white mb-4">{t.organizationalOverview}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {allOrganizations.map(org => {
                const orgPlans = allPlans.filter(p => p.orgId === org.id);
                const orgLogs = allReflectionLogs.filter(r => r.org_id === org.id);

                const avgReadiness = orgPlans.length > 0
                    ? Math.round(orgPlans.reduce((acc, plan) => acc + plan.readiness, 0) / orgPlans.length)
                    : 0;
                
                const topValues = analyzeValuesFromReflections(orgLogs, language);

                const orlsScores = Object.values(org.orlsAssessment) as number[];
                const orlsAverage = orlsScores.length > 0 ? Math.round(orlsScores.reduce((sum, score) => sum + score, 0) / orlsScores.length) : 0;
                
                const stagesWithMetrics = org.stages.filter(s => typeof s.cri === 'number');
                const highCri = stagesWithMetrics.some(s => s.cri! > 70);

                return (
                    <Card key={org.id}>
                        <div className="flex justify-between items-start">
                             <div>
                                <h4 className="text-lg font-bold text-white">{org.name}</h4>
                                <p className="text-sm text-gray-400">{org.sector}</p>
                             </div>
                              {highCri && (
                                <div className="flex items-center gap-1 text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-full" title={t.highCriAlert}>
                                    <ExclamationTriangleIcon />
                                </div>
                              )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center my-4 pt-4 border-t border-gray-700/50">
                            <div>
                                <p className="text-3xl font-bold text-primary-400">{avgReadiness}%</p>
                                <p className="text-xs text-gray-400">{t.avgReadiness}</p>
                            </div>
                             <div>
                                <p className="text-3xl font-bold text-teal-400">{orlsAverage}%</p>
                                <p className="text-xs text-gray-400">{t.orlsScore}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">{t.topValues}</h5>
                            {topValues.length > 0 ? (
                                <div className="flex justify-around">
                                    {topValues.map(v => (
                                        <div key={v.value} className="text-center">
                                            <span className="text-2xl">{v.emoji}</span>
                                            <p className="text-xs text-gray-400">{t[`value_${v.value}`] || v.value}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                 <p className="text-xs text-gray-500 text-center">{t.noData}</p>
                            )}
                        </div>
                         <div className="mt-4 pt-3 border-t border-gray-700/50">
                             <Button onClick={() => handleViewArchive(org)} variant="secondary" size="sm" className="w-full">
                                <ArchiveBoxIcon className="h-4 w-4" />
                                {t.viewArchive}
                            </Button>
                         </div>
                    </Card>
                )
            })}
        </div>
      </div>
      
      {isReportModalOpen && selectedReport && (
        <Modal 
            isOpen={isReportModalOpen} 
            onClose={() => setIsReportModalOpen(false)} 
            title={`${t.reportDetails} - ${selectedReport.org.name}`}
        >
            <ReportDetailView reportData={selectedReport.report.summary_json} t={t} />
            <div className="flex justify-end gap-4 mt-6">
                <Button variant="secondary" onClick={() => alert('PDF Download coming soon!')}>{t.downloadPdf}</Button>
                <Button onClick={() => { handleMarkAsReviewed(selectedReport.org.id, selectedReport.report.date); setIsReportModalOpen(false); }}>{t.markReviewed}</Button>
            </div>
        </Modal>
      )}
      
      {selectedOrgForArchive && (
         <Modal isOpen={true} onClose={() => setSelectedOrgForArchive(null)} title={`${t.institutionalArchive} - ${selectedOrgForArchive.name}`}>
            <div className="max-h-[60vh] overflow-y-auto">
                {(selectedOrgForArchive.institutional_archive || []).length > 0 ? (
                    <ul className="space-y-3">
                        {(selectedOrgForArchive.institutional_archive || []).map(entry => (
                            <li key={entry.archiveDate} className="p-3 bg-gray-900/50 rounded-md">
                                <div className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-200">{entry.candidateName} - {entry.roleTitle}</p>
                                        <p className="text-xs text-gray-400">{entry.stageName} - {new Date(entry.archiveDate).toLocaleDateString()}</p>
                                    </div>
                                    <Button onClick={() => setSelectedArchiveEntry(entry)} variant="secondary" size="sm">{t.details}</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center py-8 text-gray-500">{t.noArchivedData}</p>
                )}
            </div>
             <div className="flex justify-end mt-6">
                <Button onClick={() => setSelectedOrgForArchive(null)}>{t.close}</Button>
            </div>
         </Modal>
      )}
      
      {selectedArchiveEntry && (
          <ArchiveDetailModal entry={selectedArchiveEntry} onClose={() => setSelectedArchiveEntry(null)} t={t} />
      )}

    </div>
  );
}

export default ConsultingHouseDashboard;