import React from 'react';
import { Card } from '../../common/Card';

interface PlanStepSelectCandidateProps {
  organizationId?: string;
  selectedCandidate?: any;
  onSelectCandidate: (c: any) => void;
}

export const PlanStepSelectCandidate: React.FC<PlanStepSelectCandidateProps> = ({
  organizationId,
  selectedCandidate,
  onSelectCandidate
}) => {
  const [candidates, setCandidates] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Fetch candidates from the existing app API - read-only
    const data = (window as any).appApi?.getCandidatesForOrganization?.(organizationId) || [];
    setCandidates(data);
  }, [organizationId]);

  return (
    <Card className="p-4 animate-fade-in-up">
      <h3 className="text-lg font-semibold mb-4">اختر المرشح الذي تريد إنشاء خطة له</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto">
        {candidates.map((c) => (
          <div
            key={c.id}
            className={`p-4 cursor-pointer rounded-lg border-2 ${selectedCandidate?.id === c.id ? 'border-primary-500 bg-primary-900/20' : 'border-gray-700 bg-gray-800 hover:bg-gray-700/50'}`}
            onClick={() => onSelectCandidate(c)}
          >
            <img src={c.profileImage || `https://ui-avatars.com/api/?name=${c.name}&background=374151&color=fff`} alt={c.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
            <div className="font-medium mb-1 text-center">{c.name}</div>
            <div className="text-sm text-gray-400 text-center truncate">{c.targetPosition || 'منصب غير محدد'}</div>
          </div>
        ))}
      </div>
      {candidates.length === 0 && (
        <div className="text-sm text-center py-10 text-gray-500">لا يوجد مرشحون متاحون حاليًا لهذه المؤسسة.</div>
      )}
    </Card>
  );
};
