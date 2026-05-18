import React from 'react';
import type { StageCandidateRow, Translations } from '../../types';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

interface StageCandidatesTableProps {
  rows: StageCandidateRow[];
  onSelectCandidate?: (planId: number) => void;
  t: Translations;
}

export const StageCandidatesTable: React.FC<StageCandidatesTableProps> = ({ rows, onSelectCandidate, t }) => {
  if (!rows || rows.length === 0) {
    return <div className="p-4 text-sm text-center text-gray-500">لا يوجد مرشحون في هذه المرحلة حاليًا.</div>;
  }

  const statusStyles: Record<StageCandidateRow['status'], { text: string, color: string }> = {
    active: { text: 'نشط', color: 'text-green-400' },
    paused: { text: 'متوقف مؤقتاً', color: 'text-yellow-400' },
    completed: { text: 'مكتمل', color: 'text-blue-400' },
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-right rtl:text-left">
        <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
          <tr>
            <th className="py-3 px-4">المرشح</th>
            <th className="py-3 px-4">المنصب المستهدف</th>
            <th className="py-3 px-4">التقدم</th>
            <th className="py-3 px-4">الحالة</th>
            <th className="py-3 px-4">الإجراء التالي</th>
            <th className="py-3 px-4 text-left rtl:text-right">إدارة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-800/50">
              <td className="py-3 px-4 font-medium text-white">{row.name}</td>
              <td className="py-3 px-4 text-gray-300">{row.targetPosition || '-'}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <ProgressBar progress={row.progress} />
                  <span className="text-gray-400 font-mono text-xs">{row.progress}%</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`font-semibold ${statusStyles[row.status].color}`}>
                  {statusStyles[row.status].text}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-400">{row.nextAction || '—'}</td>
              <td className="py-3 px-4 text-left rtl:text-right">
                <Button size="sm" variant="secondary" onClick={() => onSelectCandidate && row.planId && onSelectCandidate(row.planId)} disabled={!row.planId}>
                  متابعة
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
