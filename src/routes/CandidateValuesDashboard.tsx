import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';
import type { BehavioralIndicatorKey, BehavioralIndicators } from '../lib/valuesData';
import { behavioralIndicatorsFor, valueMirrorFor } from '../lib/valuesData';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can } from '../lib/permissions';
import { computeReadiness, journeyProgress } from '../lib/selectors';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';
import { ProgressBar } from '../ui/ProgressBar';

const INDICATOR_KEYS: BehavioralIndicatorKey[] = [
  'honesty',
  'respect',
  'innovation',
  'collaboration',
  'responsibility',
];

const RadarChart: React.FC<{
  data: BehavioralIndicators;
  labels: Record<BehavioralIndicatorKey, string>;
  size: number;
}> = ({ data, labels, size }) => {
  const center = size / 2;
  const radius = size * 0.4;
  const numLevels = 5;
  const angleSlice = (Math.PI * 2) / INDICATOR_KEYS.length;

  const points = INDICATOR_KEYS.map((key, i) => {
    const value = data[key];
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + radius * (value / 100) * Math.cos(angle);
    const y = center + radius * (value / 100) * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[...Array(numLevels)].map((_, level) => (
        <polygon
          key={level}
          points={INDICATOR_KEYS.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const r = radius * ((level + 1) / numLevels);
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ')}
          className="fill-none stroke-[var(--border-strong)]"
        />
      ))}

      {INDICATOR_KEYS.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            className="stroke-[var(--border-strong)]"
          />
        );
      })}

      <polygon
        points={points}
        className="fill-[var(--accent-soft)] stroke-[var(--accent-bright)]"
        strokeWidth="2"
      />

      {INDICATOR_KEYS.map((key, i) => {
        const value = data[key];
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + radius * (value / 100) * Math.cos(angle);
        const y = center + radius * (value / 100) * Math.sin(angle);
        const labelRadius = radius * 1.15;
        const labelX = center + labelRadius * Math.cos(angle);
        const labelY = center + labelRadius * Math.sin(angle);
        let textAnchor: 'middle' | 'end' | 'start' = 'middle';
        if (labelX < center - 5) textAnchor = 'end';
        if (labelX > center + 5) textAnchor = 'start';

        return (
          <React.Fragment key={key}>
            <circle cx={x} cy={y} r="4" className="fill-[var(--accent-bright)]" />
            <text
              x={labelX}
              y={labelY}
              dy="0.35em"
              textAnchor={textAnchor}
              fontSize="12"
              fill="currentColor"
              className="font-semibold text-[var(--text-muted)]"
            >
              {labels[key]}
            </text>
          </React.Fragment>
        );
      })}
    </svg>
  );
};

export const CandidateValuesDashboard: React.FC = () => {
  const { orgId, candId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state } = useApp();

  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const ownCandidate = activeUser?.candidateId
    ? state.candidates.find((item) => item.id === activeUser.candidateId)
    : undefined;

  const org = state.organizations.find((item) => item.id === orgId);
  if (!org) return <Navigate to="/organizations" replace />;

  const candidate = state.candidates.find((item) => item.id === candId);
  const fn = candidate
    ? state.functions.find((item) => item.id === candidate.criticalFunctionId)
    : undefined;

  if (!candidate || candidate.organizationId !== org.id || !fn) {
    return <Navigate to={`/organizations/${org.id}/candidates`} replace />;
  }
  if (!can(activeRole, 'candidate.viewProfile', { user: activeUser, candidate })) {
    if (activeRole === 'CANDIDATE' && ownCandidate) {
      return (
        <Navigate
          to={`/organizations/${ownCandidate.organizationId}/candidates/${ownCandidate.id}/values-dashboard`}
          replace
        />
      );
    }
    return <Navigate to={`/organizations/${org.id}/candidates`} replace />;
  }

  const backToCandidate = `/organizations/${org.id}/candidates/${candidate.id}`;
  const readiness = computeReadiness(candidate, fn);
  const progress = journeyProgress(candidate);
  const valuesAlignment =
    candidate.scores.find((score) => score.criterionKey === 'values_alignment')?.value ?? 0;

  const indicators = useMemo(() => behavioralIndicatorsFor(candidate.id), [candidate.id]);
  const valueMirror = useMemo(() => valueMirrorFor(progress, language), [progress, language]);

  const labels: Record<BehavioralIndicatorKey, string> = {
    honesty: t('values.honesty'),
    respect: t('values.respect'),
    innovation: t('values.innovation'),
    collaboration: t('values.collaboration'),
    responsibility: t('values.responsibility'),
  };

  return (
    <section className="mx-auto max-w-[1180px] space-y-6">
      <PageHeader
        title={t('values.title')}
        subtitle={
          <>
            <span className="text-[var(--text)]">{fn.title}</span>
            <span className="text-[var(--text-faint)]"> · </span>
            <span>{candidate.name}</span>
          </>
        }
        actions={
          <Button variant="secondary" onClick={() => navigate(backToCandidate)}>
            <span className="inline-flex items-center gap-2">
              <ArrowLeftIcon />
              {t('values.backToCandidate')}
            </span>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-center text-sm font-semibold text-[var(--text)]">
            {t('values.behavioralIndicators')}
          </h2>
          <div className="mt-4 flex justify-center">
            <RadarChart data={indicators} labels={labels} size={360} />
          </div>
        </div>

        <div className="surface-card flex flex-col justify-between p-5">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">{t('values.valueMirror')}</h2>
            <div className="mt-6 px-4 py-2 text-center">
              <span className="text-6xl" role="img" aria-label="feedback emoji">
                {valueMirror.emoji}
              </span>
              <p className="mt-4 text-xl font-semibold text-[var(--text)]">
                &ldquo;{valueMirror.quote}&rdquo;
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">{valueMirror.feedback}</p>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('values.alignmentSummary')}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-[var(--text-faint)]">
                {t('values.valuesAlignment')}
              </p>
              <div className="mt-3">
                <ProgressBar value={valuesAlignment} />
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{valuesAlignment}%</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-faint)]">
                {t('values.overallReadiness')}
              </p>
              <div className="mt-3">
                <ProgressBar value={readiness} />
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{readiness}%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
