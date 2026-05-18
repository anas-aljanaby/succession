

import React, { useState, useCallback } from 'react';
import type { Translations, JourneyMilestone, SuccessionPlan, Organization, SuccessionJourneyStage } from '../types';
import { generateSuccessionPlan } from '../services/geminiService';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

function parseMarkdownToMilestones(markdown: string, stages: SuccessionJourneyStage[]): JourneyMilestone[] {
    const milestones: JourneyMilestone[] = [];
    const lines = markdown.split('\n');
    let idCounter = Date.now();
    let currentStageCode: string | null = null;

    // Create a map of stage name to code for easy lookup, case-insensitively
    const stageNameMap = new Map(stages.map(s => [s.name.trim().toLowerCase(), s.code]));
    
    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Check if the line is a stage heading (## Stage Name)
        if (trimmedLine.startsWith('## ')) {
            const stageName = trimmedLine.substring(3).trim().toLowerCase();
            if (stageNameMap.has(stageName)) {
                currentStageCode = stageNameMap.get(stageName)!;
            } else {
                 console.warn(`AI generated an unknown stage heading: "${stageName}"`);
            }
            return; // Skip to the next line
        }

        // Check if the line is a milestone
        if ((trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) && currentStageCode) {
            milestones.push({
                id: idCounter++,
                title: trimmedLine.substring(2).trim().replace(/\*\*/g, ''), // Remove bolding
                description: '', // Can enhance AI to provide descriptions later
                status: 'NotStarted',
                stageCode: currentStageCode,
            });
        }
    });

    return milestones;
}


const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content
      .replace(/### (.*)/g, '<h3 class="text-xl font-semibold text-primary-300 mt-4 mb-2">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-2xl font-bold text-primary-400 mt-6 mb-3">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- (.*)/g, '\n<li class="ms-6 list-disc">$1</li>')
      .replace(/\n\* (.*)/g, '\n<li class="ms-6 list-disc">$1</li>')
      .replace(/\n/g, '<br />');

    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

// Fix: Added missing 'SuccessionPlannerProps' interface to resolve type error.
interface SuccessionPlannerProps {
  t: Translations;
  onSave: (newPlan: Omit<SuccessionPlan, 'id' | 'orgId'>) => void;
  onCancel: () => void;
  organization: Organization;
}

const SuccessionPlanner: React.FC<SuccessionPlannerProps> = ({ t, onSave, onCancel, organization }) => {
  const [role, setRole] = useState('');
  const [competencies, setCompetencies] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!role || !competencies || !candidateName) {
      alert(t.alert_fillAllFields);
      return;
    }
    setIsLoading(true);
    setGeneratedPlan(null);
    const plan = await generateSuccessionPlan(role, competencies, candidateName, organization.language_pref, organization);
    setGeneratedPlan(plan);
    setIsLoading(false);
  }, [role, competencies, candidateName, organization, t]);

  const handleSave = () => {
      if (!generatedPlan || !candidateName || !role) return;
      
      const aiMilestones = parseMarkdownToMilestones(generatedPlan, organization.stages);
      
      const defaultMilestones: JourneyMilestone[] = [];
      let milestoneIdCounter = Date.now() + 1000; // Offset to avoid collisions

      organization.stages.forEach(stage => {
          (stage.default_tasks || []).forEach(taskTitle => {
              defaultMilestones.push({
                  id: milestoneIdCounter++,
                  title: taskTitle,
                  description: '', // Keep description empty consistent with AI milestones
                  status: 'NotStarted',
                  stageCode: stage.code,
              });
          });
      });

      const combinedMilestones = [...defaultMilestones, ...aiMilestones];

      const newPlan: Omit<SuccessionPlan, 'id' | 'orgId'> = {
          roleTitle: role,
          candidate: { id: Date.now(), name: candidateName, currentRole: t.toBeDefined },
          readiness: 10, // Initial readiness from default LRI
          maturity: 10,
          closureStatus: 'pending',
          lriAssessment: {
              competence: 10,
              behavior: 10,
              value_alignment: 10,
              learning_agility: 10,
          },
          journey: combinedMilestones,
          aiGeneratedPlan: generatedPlan,
          bvi: 50,
          lqm: 50,
          behavioralIndicators: {
            honesty: 50,
            respect: 50,
            innovation: 50,
            collaboration: 50,
            responsibility: 50,
          },
      };
      onSave(newPlan);
  };

  return (
    <div>
       <Button onClick={onCancel} variant="secondary" className="mb-6">
        <ArrowLeftIcon />
        {t.backToDashboard}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <div className="space-y-6">
            <div>
                 <h2 className="text-3xl font-bold text-white">{t.plannerTitle}</h2>
                 <p className="text-gray-400 mt-1">{t.plannerSubtitle}</p>
            </div>
          
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-400 rtl:text-right">{t.targetRole}</label>
                        <input type="text" id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder={t.targetRolePlaceholder} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="competencies" className="block text-sm font-medium text-gray-400 rtl:text-right">{t.keyCompetencies}</label>
                        <textarea id="competencies" rows={4} value={competencies} onChange={(e) => setCompetencies(e.target.value)} placeholder={t.keyCompetenciesPlaceholder} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="candidate" className="block text-sm font-medium text-gray-400 rtl:text-right">{t.potentialCandidate}</label>
                        <input type="text" id="candidate" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder={t.potentialCandidatePlaceholder} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                        {isLoading && <Spinner />}
                        {isLoading ? t.generating : t.generatePlan}
                    </Button>
                </div>
            </Card>
        </div>

        {/* AI Output Column */}
        <div className="space-y-6">
             <h3 className="text-2xl font-bold text-white">{t.aiGeneratedPlan}</h3>
             <Card className="min-h-[300px]">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <Spinner />
                    </div>
                )}
                {generatedPlan && (
                    <div className="space-y-4">
                        <MarkdownRenderer content={generatedPlan} />
                        <div className="flex gap-4 pt-4 border-t border-gray-700">
                             <Button onClick={handleSave} className="w-full">{t.saveAndClose}</Button>
                             <Button onClick={onCancel} variant='secondary' className="w-full">{t.cancel}</Button>
                        </div>
                    </div>
                )}
                 {!isLoading && !generatedPlan && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>{t.generatedPlanWillAppearHere}</p>
                    </div>
                )}
             </Card>
        </div>
      </div>
    </div>
  );
};

export default SuccessionPlanner;