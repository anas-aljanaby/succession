import React from 'react';
import type { ClosureStatus, Translations } from '../../types';

interface StatusBadgeProps {
  status: ClosureStatus;
  t: Translations;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, t }) => {
  const statusInfo: Record<ClosureStatus, { labelKey: string; bgColor: string; textColor: string; }> = {
    pending: { labelKey: 'status_pending', bgColor: 'bg-yellow-800', textColor: 'text-yellow-200' },
    readyForReview: { labelKey: 'status_readyForReview', bgColor: 'bg-blue-800', textColor: 'text-blue-200' },
    archived: { labelKey: 'status_archived', bgColor: 'bg-gray-700', textColor: 'text-gray-300' },
  };

  const currentStatus = statusInfo[status] || statusInfo.pending;
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${currentStatus.bgColor} ${currentStatus.textColor}`}>
      {t[currentStatus.labelKey] || status}
    </span>
  );
};