
export interface StageTransitionCheckResult {
  canProceed: boolean;
  reason?: string;
  nextStageId?: string;
}

export const StageTransitionController = {
  async checkBeforeTransition(currentStageId: string, candidateId?: string): Promise<StageTransitionCheckResult> {
    // قراءة فقط من الـ API الحالي — لا نعدّل البيانات
    const currentStageStatus = await (window as any).appApi?.getStageStatus?.(currentStageId, candidateId);
    const closureStatus = await (window as any).appApi?.getStageClosureStatus?.(currentStageId, candidateId);
    const nextStage = await (window as any).appApi?.getNextStageForCandidate?.(currentStageId, candidateId);

    // شرط 1: يجب أن تكون المرحلة الحالية مغلقة أو مكتملة
    if (closureStatus && closureStatus.approved !== true) {
      return {
        canProceed: false,
        reason: 'لا يمكن الانتقال: مرحلة الإغلاق الحالية غير معتمدة من المؤسسة أو المستشار.'
      };
    }

    // شرط 2: التأكد من عدم وجود مهام معلّقة
    if (currentStageStatus && currentStageStatus.pendingTasks && currentStageStatus.pendingTasks.length > 0) {
      return {
        canProceed: false,
        reason: 'لا يمكن الانتقال: توجد مهام معلّقة في المرحلة الحالية.'
      };
    }

    // شرط 3: التأكد من وجود مرحلة تالية
    if (!nextStage || !nextStage.id) {
      return {
        canProceed: false,
        reason: 'لا توجد مرحلة تالية لهذا المرشح.'
      };
    }

    return {
      canProceed: true,
      nextStageId: nextStage.id
    };
  },

  async performTransition(nextStageId: string, candidateId?: string): Promise<boolean> {
    try {
      await (window as any).appApi?.moveCandidateToStage?.(nextStageId, candidateId);
      return true;
    } catch (e) {
      console.error("StageTransitionController: transition failed", e);
      return false;
    }
  }
};
      