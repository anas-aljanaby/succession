import React from 'react';

export const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--card-2)]">
        <div
          className="h-full rounded-full transition-[width]"
          style={{
            width: `${clamped}%`,
            background:
              'linear-gradient(90deg, rgb(var(--color-primary-500)), rgb(var(--color-primary-400)))',
          }}
        />
      </div>
      <span className="w-9 text-end text-[13px] font-semibold text-[var(--text)]">{clamped}%</span>
    </div>
  );
};
