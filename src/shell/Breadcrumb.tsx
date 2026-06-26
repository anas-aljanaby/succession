import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';

// Builds the breadcrumb from the URL, resolving entity ids to real names from the store.
export const Breadcrumb: React.FC = () => {
  const { t } = useLanguage();
  const { state } = useApp();
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs: { to: string; label: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const to = '/' + segments.slice(0, i + 1).join('/');
    const prev = segments[i - 1];

    let label = seg;
    if (seg === 'organizations') label = t('nav.organizations');
    else if (seg === 'functions') label = t('nav.functions');
    else if (seg === 'candidates') label = t('nav.candidates');
    else if (seg === 'ai-insights') label = t('nav.aiInsights');
    else if (seg === 'journey-timeline') label = t('journeyTimeline.title');
    else if (seg === 'values-dashboard') label = t('values.title');
    else if (seg === 'settings') label = t('nav.settings');
    else if (seg === 'more') label = t('nav.more');
    else if (seg === 'coming-soon') label = t('nav.more');
    else if (seg === 'new' || seg === 'edit') continue; // not a navigable crumb
    else if (prev === 'more' || prev === 'coming-soon') label = t(`comingSoon.feature.${seg}`);
    else if (prev === 'organizations')
      label = state.organizations.find((o) => o.id === seg)?.name ?? seg;
    else if (prev === 'functions')
      label = state.functions.find((f) => f.id === seg)?.title ?? seg;
    else if (prev === 'candidates')
      label = state.candidates.find((c) => c.id === seg)?.name ?? seg;

    crumbs.push({ to, label });
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400 min-w-0">
      <Link to="/" className="hover:text-gray-100 shrink-0">
        {t('nav.home')}
      </Link>
      {crumbs.map((c, i) => (
        <React.Fragment key={c.to}>
          <span className="text-gray-600">/</span>
          {i === crumbs.length - 1 ? (
            <span className="text-gray-200 truncate">{c.label}</span>
          ) : (
            <Link to={c.to} className="hover:text-gray-100 truncate">
              {c.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
