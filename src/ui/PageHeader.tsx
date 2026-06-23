import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);
