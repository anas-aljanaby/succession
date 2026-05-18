
import React from 'react';
import { StageTransitionController } from './StageTransitionController';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { Card } from '../common/Card';
import { notifyStageTransitionBlocked } from '../../lib/notifications/stageTransitionHooks';

interface StageTransitionBarProps {
  currentStageId: string;
  candidateId?: string;
}

export const StageTransitionBar: React.FC<StageTransitionBarProps> = ({ currentStageId, candidateId }) => {
  const [checking, setChecking] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [nextStageId, setNextStageId] = React.useState<string | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    setErrorMsg(null);
    setNextStageId(null);
    const result = await StageTransitionController.checkBeforeTransition(currentStageId, candidateId);
    setChecking(false);
    if (!result.canProceed) {
      const reason = result.reason || 'لا يمكن الانتقال للمرحلة التالية.';
      setErrorMsg(reason);
      notifyStageTransitionBlocked(currentStageId, reason);
      return;
    }
    setNextStageId(result.nextStageId || null);
  };

  const handleTransition = async () => {
    if (!nextStageId) return;
    const ok = await StageTransitionController.performTransition(nextStageId, candidateId);
    if (ok) {
      // نستخدم نظام التنقل الحالي دون تغييره
      (window as any).appApi?.navigateTo?.('stage-detail-screen', { stageId: nextStageId, candidateId });
    } else {
      const reason = 'حدث خطأ أثناء الانتقال، الرجاء المحاولة مرة أخرى.';
      setErrorMsg(reason);
      notifyStageTransitionBlocked(currentStageId, reason);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40">
        <Card className="!p-3">
            <div className="flex items-center gap-3">
            <Button
                onClick={handleCheck}
                disabled={checking}
            >
                {checking && <Spinner />}
                {checking ? 'جارٍ التحقق...' : 'التحقق من جاهزية الانتقال'}
            </Button>
            {nextStageId && !errorMsg && (
                <Button
                className="bg-green-600 hover:bg-green-500"
                onClick={handleTransition}
                >
                الانتقال للمرحلة التالية
                </Button>
            )}
            {errorMsg && (
                <span className="text-xs text-red-400 max-w-xs">{errorMsg}</span>
            )}
            </div>
        </Card>
    </div>
  );
};
      