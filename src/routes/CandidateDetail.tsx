import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import type { JourneyStage, TaskStatus } from '../types';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { can, visibleCandidatesForOrg } from '../lib/permissions';
import {
  computeReadiness,
  functionStatusFor,
  journeyProgress,
} from '../lib/selectors';
import { Field, TextInput } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { Pill } from '../ui/Pill';
import { ProgressBar } from '../ui/ProgressBar';
import {
  candidateStatusTone,
  functionStatusTone,
  taskStatusTone,
} from '../ui/tone';

const stageCounts = (stage: JourneyStage) => {
  const total = stage.tasks.length;
  const done = stage.tasks.filter((task) => task.status === 'completed').length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, progress };
};

export const CandidateDetail: React.FC = () => {
  const { orgId, candId } = useParams();
  const { state, dispatch } = useApp();
  const { t } = useLanguage();
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
          to={`/organizations/${ownCandidate.organizationId}/candidates/${ownCandidate.id}`}
          replace
        />
      );
    }
    return <Navigate to={`/organizations/${org.id}/candidates`} replace />;
  }

  const readiness = computeReadiness(candidate, fn);
  const visibleCandidates = visibleCandidatesForOrg(
    state.candidates,
    activeRole,
    activeUser,
    org.id
  );
  const functionStatus = functionStatusFor(fn, visibleCandidates);
  const overallProgress = journeyProgress(candidate);
  const canScore = can(activeRole, 'candidate.score', { user: activeUser, candidate });
  const canManageJourney = can(activeRole, 'candidate.journey', {
    user: activeUser,
    candidate,
  });

  const scoreFor = (criterionKey: string) =>
    candidate.scores.find((score) => score.criterionKey === criterionKey)?.value ?? 0;

  const updateScore = (criterionKey: string, value: string) => {
    if (!canScore) return;
    const nextValue = Number(value);
    dispatch({
      type: 'SET_SCORE',
      candidateId: candidate.id,
      criterionKey,
      value: Number.isFinite(nextValue) ? nextValue : 0,
    });
  };

  const toggleTask = (stageCode: string, taskId: string, status: TaskStatus) => {
    if (!canManageJourney) return;
    dispatch({
      type: 'SET_TASK_STATUS',
      candidateId: candidate.id,
      stageCode,
      taskId,
      status: status === 'completed' ? 'notStarted' : 'completed',
    });
  };

  return (
    <section className="mx-auto max-w-[1180px] space-y-6">
      <PageHeader
        title={candidate.name}
        subtitle={
          <>
            <span className="text-[var(--text)]">{org.name}</span>
            <span className="text-[var(--text-faint)]"> · </span>
            <span>{fn.title}</span>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('candidates.profile')}</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-[var(--text-faint)]">
                {t('functions.current')}
              </dt>
              <dd className="mt-1 text-sm text-[var(--text)]">{candidate.currentPosition}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--text-faint)]">
                {t('functions.target')}
              </dt>
              <dd className="mt-1 text-sm text-[var(--text)]">{candidate.targetPosition}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--text-faint)]">
                {t('functions.department')}
              </dt>
              <dd className="mt-1 text-sm text-[var(--text)]">{candidate.department}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--text-faint)]">
                {t('functions.status')}
              </dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                <Pill tone={candidateStatusTone(candidate.status)}>
                  {t(`status.${candidate.status}`)}
                </Pill>
                <Pill tone={functionStatusTone(functionStatus)}>
                  {t(`fnStatus.${functionStatus}`)}
                </Pill>
              </dd>
            </div>
          </dl>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('candidates.readiness')}</h2>
          <div className="mt-5">
            <ProgressBar value={readiness} />
          </div>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            {t('candidates.functionStatus')}: {t(`fnStatus.${functionStatus}`)}
          </p>
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('candidates.scores')}</h2>
          <span className="text-sm text-[var(--text-muted)]">
            {t('functions.criteria')}: {fn.criteria.length}
          </span>
        </div>
        {!canScore ? (
          <p className="mb-4 text-sm text-[var(--text-faint)]">{t('permissions.readOnly')}</p>
        ) : null}

        <div className="space-y-3">
          {fn.criteria.map((criterion) => (
            <div
              key={criterion.key}
              className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card-2)] p-3 sm:grid-cols-[minmax(0,1fr)_160px]"
            >
              <div>
                <h3 className="font-medium text-[var(--text)]">{criterion.label}</h3>
                <p className="mt-1 text-sm text-[var(--text-faint)]">
                  {t('functions.weight')}: {criterion.weight}
                </p>
              </div>
              {canScore ? (
                <Field label={t('candidates.score')}>
                  <TextInput
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={scoreFor(criterion.key)}
                    onChange={(event) => updateScore(criterion.key, event.target.value)}
                  />
                </Field>
              ) : (
                <div>
                  <span className="mb-1 block text-sm text-[var(--text-muted)]">
                    {t('candidates.score')}
                  </span>
                  <span className="block rounded-md border border-[var(--border)] bg-[var(--card-3)] px-3 py-2 text-sm text-[var(--text)]">
                    {scoreFor(criterion.key)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-5" id="journey">
        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">{t('candidates.journey')}</h2>
            <p className="mt-1 text-sm text-[var(--text-faint)]">
              {t('candidates.overallProgress')}: {overallProgress}%
            </p>
            {!canManageJourney ? (
              <p className="mt-2 text-sm text-[var(--text-faint)]">{t('permissions.readOnly')}</p>
            ) : null}
          </div>
          <ProgressBar value={overallProgress} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {candidate.journey.map((stage) => {
            const counts = stageCounts(stage);

            return (
              <div
                key={stage.code}
                className="rounded-lg border border-[var(--border)] bg-[var(--card-2)] p-4"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-[var(--text)]">{stage.name}</h3>
                    <p className="mt-1 text-sm text-[var(--text-faint)]">
                      {t('candidates.stageProgress')}: {counts.done}/{counts.total}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[var(--text-faint)]">{stage.code}</span>
                </div>
                <ProgressBar value={counts.progress} />

                <div className="mt-4 space-y-3">
                  {stage.tasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--card-3)] p-3"
                    >
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        disabled={!canManageJourney}
                        aria-label={`${t('candidates.markDone')}: ${task.title}`}
                        className="mt-1 h-4 w-4 rounded border-[var(--border)] bg-[var(--card-2)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        onChange={() => toggleTask(stage.code, task.id, task.status)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-[var(--text)]">{task.title}</span>
                        <span className="mt-2 inline-block">
                          <Pill tone={taskStatusTone(task.status)}>
                            {t(`taskStatus.${task.status}`)}
                          </Pill>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
