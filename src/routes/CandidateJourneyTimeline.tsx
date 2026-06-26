import React, { useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { journeyConfig } from '../../constants';
import { calculateStageDuration } from '../../services/durationEstimator';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';
import { CheckCircleIcon } from '@/components/icons/CheckCircleIcon';
import { ClockIcon } from '@/components/icons/ClockIcon';
import type { InstitutionType, JourneyStage } from '../types';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can } from '../lib/permissions';
import { computeReadiness, orgReadiness } from '../lib/selectors';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';

const ORLS_BY_TYPE: Record<
  InstitutionType,
  { governance: number; culture: number; systems: number; resources: number; strategic_support: number }
> = {
  corporate: { governance: 75, culture: 80, systems: 65, resources: 70, strategic_support: 85 },
  government: { governance: 90, culture: 85, systems: 95, resources: 88, strategic_support: 92 },
  education: { governance: 60, culture: 70, systems: 55, resources: 65, strategic_support: 75 },
  charity: { governance: 65, culture: 75, systems: 50, resources: 60, strategic_support: 70 },
};

const averageOrls = (type: InstitutionType) => {
  const scores = Object.values(ORLS_BY_TYPE[type]);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

type StageStatus = 'completed' | 'inProgress' | 'notStarted';

const stageStatus = (stage: JourneyStage): { status: StageStatus; percentage: number } => {
  const total = stage.tasks.length;
  const done = stage.tasks.filter((task) => task.status === 'completed').length;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

  if (percentage === 100 && total > 0) return { status: 'completed', percentage };
  if (percentage > 0 || stage.tasks.some((task) => task.status === 'inProgress')) {
    return { status: 'inProgress', percentage };
  }
  return { status: 'notStarted', percentage };
};

const ProgressRing: React.FC<{ progress: number; status: StageStatus }> = ({ progress, status }) => {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const arcClasses: Record<StageStatus, string> = {
    completed: 'text-[var(--ok)]',
    inProgress: 'text-[var(--accent-bright)]',
    notStarted: 'text-[var(--text-muted)]',
  };

  return (
    <div
      className={`relative rounded-full ${
        status === 'notStarted'
          ? 'bg-[var(--card-2)]'
          : status === 'inProgress'
            ? 'bg-[var(--accent-soft)]/30 ring-1 ring-[var(--accent)]/40'
            : ''
      }`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-current text-[var(--border-strong)]"
          fill="transparent"
        />
        {status !== 'notStarted' && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={`stroke-current ${arcClasses[status]}`}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {status === 'completed' ? (
          <CheckCircleIcon className="h-10 w-10 text-[var(--ok)]" />
        ) : status === 'inProgress' ? (
          <span className="text-sm font-bold text-[var(--accent-bright)]">{progress}%</span>
        ) : null}
      </div>
    </div>
  );
};

const stageColumnClass: Record<StageStatus, string> = {
  completed: 'border border-transparent',
  inProgress: 'border border-[var(--accent)]/35 bg-[var(--accent-soft)]/15',
  notStarted: 'border border-[var(--border-strong)] bg-[var(--card-2)]/50',
};

export const CandidateJourneyTimeline: React.FC = () => {
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
          to={`/organizations/${ownCandidate.organizationId}/candidates/${ownCandidate.id}/journey-timeline`}
          replace
        />
      );
    }
    return <Navigate to={`/organizations/${org.id}/candidates`} replace />;
  }

  const candidateReadiness = computeReadiness(candidate, fn);
  const organizationReadiness = orgReadiness(org.id, state.functions, state.candidates);
  const orlsScore = averageOrls(org.type);
  const backToCandidate = `/organizations/${org.id}/candidates/${candidate.id}`;

  const stageData = useMemo(() => {
    const stageDefs = journeyConfig[org.type][language];
    const stageByCode = new Map(candidate.journey.map((stage) => [stage.code, stage]));

    return stageDefs
      .map((def) => {
        const journeyStage = stageByCode.get(def.code);
        if (!journeyStage) return null;

        const { status, percentage } = stageStatus(journeyStage);
        return {
          ...def,
          name: journeyStage.name,
          status,
          percentage,
          cri: def.cri,
          aei: def.aei,
          estimatedDuration: calculateStageDuration(def, orlsScore, candidateReadiness),
        };
      })
      .filter(Boolean);
  }, [candidate.journey, org.type, language, orlsScore, candidateReadiness]);

  return (
    <section className="mx-auto max-w-[1180px] space-y-6">
      <PageHeader
        title={t('journeyTimeline.title')}
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
              {t('journeyTimeline.backToCandidate')}
            </span>
          </Button>
        }
      />

      <div className="surface-card p-5">
        <h2 className="text-center text-lg font-semibold text-[var(--text)]">
          {t('journeyTimeline.readinessSummary')}
        </h2>
        <div className="mt-6 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="border-e-0 px-4 text-center md:border-e md:border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--text-muted)]">
              {t('journeyTimeline.orgReadiness')}
            </p>
            <p className="my-2 text-6xl font-bold text-teal-400">
              {organizationReadiness}
              <span className="text-4xl">%</span>
            </p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">{t('journeyTimeline.orlsLabel')}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-sm font-medium text-[var(--text-muted)]">
              {t('journeyTimeline.candidateReadiness')}
            </p>
            <p className="my-2 text-6xl font-bold text-[var(--accent-bright)]">
              {candidateReadiness}
              <span className="text-4xl">%</span>
            </p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">
              {t('journeyTimeline.readinessIndex')}
            </p>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-x-auto p-4">
        <div className="flex w-full min-w-[700px] items-start justify-between gap-2">
          {stageData.map((stage, index) =>
            stage ? (
              <React.Fragment key={stage.code}>
                <Link
                  to={`${backToCandidate}#journey`}
                  className={`flex flex-1 flex-col items-center rounded-lg px-2 py-2 transition-colors hover:bg-[var(--card-2)] ${stageColumnClass[stage.status]}`}
                  aria-label={`${t('journeyTimeline.viewStage')}: ${stage.name}`}
                >
                  <ProgressRing progress={stage.percentage} status={stage.status} />
                  <h3
                    className={`mt-4 flex h-12 items-center text-center font-semibold ${
                      stage.status === 'notStarted'
                        ? 'text-[var(--text-muted)]'
                        : 'text-[var(--text)]'
                    }`}
                  >
                    {stage.name}
                  </h3>
                  <div
                    className={`mt-2 w-full space-y-1 text-center text-xs ${
                      stage.status === 'notStarted'
                        ? 'text-[var(--text-faint)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{t('journeyTimeline.cri')}:</span>
                      <span
                        className={`font-medium ${
                          stage.status === 'notStarted' ? 'text-[var(--text-muted)]' : 'text-[var(--bad)]'
                        }`}
                      >
                        {stage.cri}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('journeyTimeline.aei')}:</span>
                      <span
                        className={`font-medium ${
                          stage.status === 'notStarted' ? 'text-[var(--text-muted)]' : 'text-[var(--ok)]'
                        }`}
                      >
                        {stage.aei}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1 border-t border-[var(--border)] pt-2">
                      <ClockIcon className="h-3 w-3 text-cyan-400" />
                      <span>{t('journeyTimeline.estimatedDuration')}:</span>
                      <span className="font-medium text-cyan-400">
                        {stage.estimatedDuration} {t('journeyTimeline.days')}
                      </span>
                    </div>
                  </div>
                </Link>
                {index < stageData.length - 1 ? (
                  <div className="mt-10 h-px w-4 flex-shrink-0 sm:w-8 md:w-12 lg:w-16 bg-[var(--border)]" />
                ) : null}
              </React.Fragment>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
};
