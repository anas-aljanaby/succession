

import React from 'react';

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
  heightClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, colorClass = 'bg-primary-500', heightClass = 'h-2' }) => {
  return (
    <div className={`w-full bg-gray-600 rounded-full ${heightClass}`}>
      <div className={`${colorClass} ${heightClass} rounded-full`} style={{ width: `${progress}%` }}></div>
    </div>
  );
};