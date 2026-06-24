import React from 'react';

export const SectionLabel: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="mb-4 mt-8 flex items-center gap-2.5">
    <span className="h-3.5 w-1 rounded-full bg-[var(--accent)]" />
    <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
    {hint ? <span className="text-xs text-[var(--text-faint)]">{hint}</span> : null}
  </div>
);
