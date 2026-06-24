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
import { Badge, candidateStatusColor, statusColor } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Field, TextInput } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { ProgressBar } from '../ui/ProgressBar';

const taskStatusColor = (status: TaskStatus) =>
  status === 'completed' ? 'green' : status === 'inProgress' ? 'amber' : 'gray';

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
    <section className="space-y-6">
      <PageHeader
        title={candidate.name}
        subtitle={`${org.name} · ${fn.title}`}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
            {t('candidates.profile')}
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                {t('functions.current')}
              </dt>
              <dd className="mt-1 text-sm text-gray-100">{candidate.currentPosition}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                {t('functions.target')}
              </dt>
              <dd className="mt-1 text-sm text-gray-100">{candidate.targetPosition}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                {t('functions.department')}
              </dt>
              <dd className="mt-1 text-sm text-gray-100">{candidate.department}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                {t('functions.status')}
              </dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                <Badge
                  label={t(`status.${candidate.status}`)}
                  color={candidateStatusColor(candidate.status)}
                />
                <Badge
                  label={t(`fnStatus.${functionStatus}`)}
                  color={statusColor(functionStatus)}
                />
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
            {t('candidates.readiness')}
          </h2>
          <div className="mt-5">
            <ProgressBar value={readiness} />
          </div>
          <p className="mt-3 text-sm text-gray-300">
            {t('candidates.functionStatus')}: {t(`fnStatus.${functionStatus}`)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
            {t('candidates.scores')}
          </h2>
          <span className="text-sm text-gray-300">
            {t('functions.criteria')}: {fn.criteria.length}
          </span>
        </div>
        {!canScore ? (
          <p className="mb-4 text-sm text-gray-400">{t('permissions.readOnly')}</p>
        ) : null}

        <div className="space-y-3">
          {fn.criteria.map((criterion) => (
            <div
              key={criterion.key}
              className="grid gap-3 rounded-lg border border-gray-700 bg-gray-900/50 p-3 sm:grid-cols-[minmax(0,1fr)_160px]"
            >
              <div>
                <h3 className="font-medium text-gray-100">{criterion.label}</h3>
                <p className="mt-1 text-sm text-gray-400">
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
                  <span className="block mb-1 text-sm text-gray-300">
                    {t('candidates.score')}
                  </span>
                  <span className="block rounded-md border border-gray-700 bg-gray-950/40 px-3 py-2 text-sm text-gray-200">
                    {scoreFor(criterion.key)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card id="journey">
        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
              {t('candidates.journey')}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {t('candidates.overallProgress')}: {overallProgress}%
            </p>
            {!canManageJourney ? (
              <p className="mt-2 text-sm text-gray-400">{t('permissions.readOnly')}</p>
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
                className="rounded-lg border border-gray-700 bg-gray-900/50 p-4"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">{stage.name}</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {t('candidates.stageProgress')}: {counts.done}/{counts.total}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{stage.code}</span>
                </div>
                <ProgressBar value={counts.progress} />

                <div className="mt-4 space-y-3">
                  {stage.tasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-start gap-3 rounded-md border border-gray-700 bg-gray-950/40 p-3"
                    >
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        disabled={!canManageJourney}
                        aria-label={`${t('candidates.markDone')}: ${task.title}`}
                        className="mt-1 h-4 w-4 rounded border-gray-700 bg-gray-800 text-primary-500 focus:ring-primary-500"
                        onChange={() => toggleTask(stage.code, task.id, task.status)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-gray-100">{task.title}</span>
                        <span className="mt-2 inline-block">
                          <Badge
                            label={t(`taskStatus.${task.status}`)}
                            color={taskStatusColor(task.status)}
                          />
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
};
