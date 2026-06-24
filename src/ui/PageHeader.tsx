import React from 'react';

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">{title}</h1>
      {subtitle && <div className="mt-1.5 text-sm text-[var(--text-muted)]">{subtitle}</div>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);
