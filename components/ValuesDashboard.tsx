import React, { useState, useMemo } from 'react';
import type { SuccessionPlan, Organization, Translations, BehavioralIndicators, ReflectionLog, User, UserRole, Language } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import ValueMirror from './ValueMirror';
import ReflectionLogView from './ReflectionLogView';
import { generateBehavioralInsight } from '../services/geminiService';
import { Spinner } from './common/Spinner';

interface ValuesDashboardProps {
  plan: SuccessionPlan;
  organization: Organization;
  t: Translations;
  onBack: () => void;
  reflectionLogs: ReflectionLog[];
  allUsers: User[];
  currentUser: User;
  activeRole: UserRole | null;
  onAddReflectionLog: (log: Omit<ReflectionLog, 'id' | 'timestamp'>) => void;
  language: Language;
}

const RadarChart: React.FC<{ data: BehavioralIndicators, labels: Record<keyof BehavioralIndicators, string>, size: number }> = ({ data, labels, size }) => {
    const center = size / 2;
    const radius = size * 0.4;
    const numLevels = 5;
    const dataKeys = Object.keys(data) as (keyof BehavioralIndicators)[];
    const angleSlice = (Math.PI * 2) / dataKeys.length;

    const points = dataKeys.map((key, i) => {
        const value = data[key];
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + radius * (value / 100) * Math.cos(angle);
        const y = center + radius * (value / 100) * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const axisLabels = dataKeys.map((key, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelRadius = radius * 1.15;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        // Fix: Explicitly type `textAnchor` to match the expected SVG attribute type.
        let textAnchor: 'middle' | 'end' | 'start' = "middle";
        if (x < center - 5) textAnchor = "end";
        if (x > center + 5) textAnchor = "start";
        
        return (
            <text key={key} x={x} y={y} dy="0.35em" textAnchor={textAnchor} fontSize="12" fill="white" className="font-semibold">
                {labels[key]}
            </text>
        );
    });

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid */}
            {[...Array(numLevels)].map((_, level) => (
                <polygon
                    key={level}
                    points={dataKeys.map((_, i) => {
                        const angle = angleSlice * i - Math.PI / 2;
                        const r = radius * ((level + 1) / numLevels);
                        const x = center + r * Math.cos(angle);
                        const y = center + r * Math.sin(angle);
                        return `${x},${y}`;
                    }).join(' ')}
                    className="stroke-gray-700 fill-none"
                />
            ))}

            {/* Axes */}
            {dataKeys.map((_, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return <line key={i} x1={center} y1={center} x2={x} y2={y} className="stroke-gray-700" />;
            })}

            {/* Data Polygon */}
            <polygon points={points} className="stroke-primary-400 fill-primary-500/30" strokeWidth="2" />
            
            {/* Data Points */}
            {dataKeys.map((key, i) => {
                 const value = data[key];
                 const angle = angleSlice * i - Math.PI / 2;
                 const x = center + radius * (value / 100) * Math.cos(angle);
                 const y = center + radius * (value / 100) * Math.sin(angle);
                 return <circle key={i} cx={x} cy={y} r="4" className="fill-primary-400" />
            })}

            {/* Labels */}
            {axisLabels}
        </svg>
    );
};


const ValuesDashboard: React.FC<ValuesDashboardProps> = (props) => {
    const { plan, t, onBack, organization, reflectionLogs, allUsers, currentUser, onAddReflectionLog, language, activeRole } = props;
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const labels: Record<keyof BehavioralIndicators, string> = {
        honesty: t.value_honesty,
        respect: t.value_respect,
        innovation: t.value_innovation,
        collaboration: t.value_collaboration,
        responsibility: t.value_responsibility,
    };

    const handleGenerateInsight = async () => {
        setIsGenerating(true);
        setAiInsight(null);
        const insight = await generateBehavioralInsight(plan.behavioralIndicators, reflectionLogs, plan.candidate.name, language);
        setAiInsight(insight);
        setIsGenerating(false);
    };
    
    const currentStage = useMemo(() => {
        const stage = organization.stages.find(s => plan.journey.some(m => m.stageCode === s.code && m.status !== 'Completed'));
        return stage || organization.stages[organization.stages.length - 1] || organization.stages[0];
    }, [plan.journey, organization.stages]);
    
    return (
        <div className="space-y-6">
            <Button onClick={onBack} variant="secondary">
                <ArrowLeftIcon />
                {t.backToMonitor}
            </Button>
            
            <div>
                <h2 className="text-3xl font-bold text-white">{t.valuesDashboardTitle}</h2>
                <p className="text-lg text-primary-400">{plan.candidate.name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-semibold text-white mb-6 text-center">{t.behavioralIndicators}</h3>
                    <div className="flex justify-center">
                        <RadarChart data={plan.behavioralIndicators} labels={labels} size={400} />
                    </div>
                </Card>
                <div>
                    {plan.weeklyValueMirror ? (
                        <ValueMirror data={plan.weeklyValueMirror} t={t} />
                    ) : (
                        <Card className="h-full flex flex-col justify-center items-center text-gray-500">
                            <p>Weekly value mirror will be generated after the next analysis cycle.</p>
                        </Card>
                    )}
                </div>
                <Card>
                    <h3 className="text-xl font-semibold text-white mb-4">{t.aiBehavioralInsight}</h3>
                    {aiInsight && !isGenerating && (
                        <div className="text-gray-300 text-sm space-y-3">
                            <p>{aiInsight}</p>
                            <Button onClick={handleGenerateInsight} variant="secondary" size="sm">{t.regenerateInsight}</Button>
                        </div>
                    )}
                    {!aiInsight && !isGenerating && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">{t.generateInsightDescription}</p>
                            <Button onClick={handleGenerateInsight}>{t.generateInsight}</Button>
                        </div>
                    )}
                    {isGenerating && (
                        <div className="flex justify-center items-center py-8">
                            <Spinner />
                            <p className="ms-3 text-gray-400">{t.generatingInsight}</p>
                        </div>
                    )}
                </Card>
                <ReflectionLogView
                    stage={currentStage}
                    logs={reflectionLogs}
                    allUsers={allUsers}
                    currentUser={currentUser}
                    orgId={plan.orgId}
                    onAddLog={onAddReflectionLog}
                    t={t}
                    language={language}
                />
            </div>
        </div>
    );
};

export default ValuesDashboard;