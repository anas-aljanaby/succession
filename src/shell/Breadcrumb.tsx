import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';

// Phase 0: a simple path-derived breadcrumb. Real entity names are wired in later
// phases once the store exists.
const segmentLabelKey: Record<string, string> = {
  organizations: 'nav.organizations',
  functions: 'nav.functions',
  candidates: 'nav.candidates',
  'coming-soon': 'comingSoon.title',
};

export const Breadcrumb: React.FC = () => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const to = '/' + segments.slice(0, i + 1).join('/');
    const labelKey = segmentLabelKey[seg];
    const label = labelKey ? t(labelKey) : seg;
    return { to, label };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400">
      <Link to="/" className="hover:text-gray-100">
        {t('nav.home')}
      </Link>
      {crumbs.map((c, i) => (
        <React.Fragment key={c.to}>
          <span className="text-gray-600">/</span>
          {i === crumbs.length - 1 ? (
            <span className="text-gray-200">{c.label}</span>
          ) : (
            <Link to={c.to} className="hover:text-gray-100">
              {c.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
