import React from 'react';

export const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-primary-500 transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-12 text-end text-sm text-gray-300">{clamped}%</span>
    </div>
  );
};
