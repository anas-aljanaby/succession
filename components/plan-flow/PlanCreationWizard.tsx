import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { PlanStepSelectCandidate } from './steps/PlanStepSelectCandidate';
import { PlanStepSelectTemplate } from './steps/PlanStepSelectTemplate';
import { PlanStepConfigureStages } from './steps/PlanStepConfigureStages';
import { PlanStepReviewAndCreate } from './steps/PlanStepReviewAndCreate';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface PlanCreationWizardProps {
  organizationId?: string;
  preselectedCandidateId?: string;
  t: any;
  onCancel: () => void;
  onComplete: (plan: any) => void;
}

export const PlanCreationWizard: React.FC<PlanCreationWizardProps> = ({
  organizationId,
  preselectedCandidateId,
  t,
  onCancel,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [selectedCandidate, setSelectedCandidate] = React.useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
  const [configuredStages, setConfiguredStages] = React.useState<any[]>([]);
  const [saving, setSaving] = React.useState<boolean>(false);
  const totalSteps = 4;

  React.useEffect(() => {
    if (preselectedCandidateId && !selectedCandidate) {
      const candidate = (window as any).appApi?.getCandidateById?.(preselectedCandidateId);
      if (candidate) {
        setSelectedCandidate(candidate);
      }
    }
  }, [preselectedCandidateId, selectedCandidate]);

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleCreatePlan = async () => {
    if (!selectedCandidate || !selectedTemplate) return;
    setSaving(true);
    try {
      const planData = {
        candidateId: selectedCandidate.id,
        templateId: selectedTemplate.id,
        stages: configuredStages.length > 0 ? configuredStages : selectedTemplate.stages,
        organizationId
      };
      
      (window as any).appApi?.createCandidatePlan?.(planData);
      
      onCancel(); // Close wizard after creation

    } catch (e) {
      console.error("PlanCreationWizard: failed to create plan", e);
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { number: 1, label: 'اختيار المرشح' },
    { number: 2, label: 'اختيار نموذج الخطة' },
    { number: 3, label: 'ضبط مراحل الخطة' },
    { number: 4, label: 'المراجعة والإنشاء' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       <Button onClick={onCancel} variant="secondary">
            <ArrowLeftIcon />
            {t.backToDashboard}
        </Button>
      {/* Stepper */}
      <div className="flex items-center justify-between border border-gray-700 bg-gray-800/50 rounded-lg p-4">
        {steps.map((step, index) => (
            <React.Fragment key={step.number}>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${currentStep >= step.number ? 'bg-primary-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                        {currentStep > step.number ? '✓' : step.number}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${currentStep >= step.number ? 'text-white' : 'text-gray-400'}`}>{step.label}</span>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > index + 1 ? 'bg-primary-500' : 'bg-gray-700'}`}></div>}
            </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
            <PlanStepSelectCandidate
            organizationId={organizationId}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
            />
        )}
        {currentStep === 2 && (
            <PlanStepSelectTemplate
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            t={t}
            />
        )}
        {currentStep === 3 && (
            <PlanStepConfigureStages
            template={selectedTemplate}
            configuredStages={configuredStages}
            onChange={setConfiguredStages}
            />
        )}
        {currentStep === 4 && (
            <PlanStepReviewAndCreate
            candidate={selectedCandidate}
            template={selectedTemplate}
            stages={configuredStages}
            />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <Button variant="secondary" onClick={goBack} disabled={currentStep === 1}>
          رجوع
        </Button>
        {currentStep < totalSteps ? (
          <Button onClick={goNext} disabled={(currentStep === 1 && !selectedCandidate) || (currentStep === 2 && !selectedTemplate)}>
            التالي
          </Button>
        ) : (
          <Button onClick={handleCreatePlan} disabled={saving}>
            {saving ? 'جارٍ الإنشاء...' : 'إنشاء الخطة'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanCreationWizard;