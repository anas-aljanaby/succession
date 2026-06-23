import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import type { Candidate } from '../types';
import { useApp } from '../store/AppContext';
import { defaultJourney } from '../lib/journey';
import { useLanguage } from '../lib/i18n';
import { can, canAccessOrg, visibleCandidatesForOrg } from '../lib/permissions';
import {
  candidatesForFunction,
  computeReadiness,
  functionStatusFor,
} from '../lib/selectors';
import { Badge, priorityColor, statusColor } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Field, TextInput } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { ProgressBar } from '../ui/ProgressBar';

export const FunctionDetail: React.FC = () => {
  const { orgId, fnId } = useParams();
  const { state, dispatch } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);

  const org = state.organizations.find((item) => item.id === orgId);
  const fn = state.functions.find((item) => item.id === fnId);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    currentPosition: '',
    targetPosition: fn?.title ?? '',
    department: fn?.department ?? '',
  });

  if (!org) return <Navigate to="/organizations" replace />;
  if (!fn || fn.organizationId !== org.id) {
    return <Navigate to={`/organizations/${org.id}/functions`} replace />;
  }
  if (!canAccessOrg(activeRole, { user: activeUser, orgId: org.id })) {
    return <Navigate to="/organizations" replace />;
  }

  const status = functionStatusFor(fn, state.candidates);
  const visibleCandidates = visibleCandidatesForOrg(
    candidatesForFunction(fn.id, state.candidates),
    activeRole,
    activeUser,
    org.id
  );
  const selectedCandidate = fn.selectedCandidateId
    ? visibleCandidates.find((candidate) => candidate.id === fn.selectedCandidateId)
    : undefined;
  const canAddCandidate = can(activeRole, 'candidate.addToPool', {
    user: activeUser,
    orgId: org.id,
  });
  const canEditFunction = can(activeRole, 'fn.edit', { user: activeUser, orgId: org.id });
  const canSelectSuccessor = can(activeRole, 'fn.selectSuccessor', {
    user: activeUser,
    orgId: org.id,
  });

  const rankedCandidates = visibleCandidates
    .map((candidate) => ({
      candidate,
      readiness: computeReadiness(candidate, fn),
    }))
    .sort(
      (a, b) =>
        b.readiness - a.readiness || a.candidate.name.localeCompare(b.candidate.name)
    );

  const openAddCandidate = () => {
    if (!canAddCandidate) return;
    setCandidateForm({
      name: '',
      currentPosition: '',
      targetPosition: fn.title,
      department: fn.department,
    });
    setIsAddOpen(true);
  };

  const selectSuccessor = (candidateId: string) => {
    if (!canSelectSuccessor) return;
    dispatch({ type: 'SELECT_SUCCESSOR', fnId: fn.id, candidateId });
  };

  const addCandidate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canAddCandidate) return;

    const candidate: Candidate = {
      id: `cand-${Date.now()}`,
      organizationId: org.id,
      criticalFunctionId: fn.id,
      name: candidateForm.name.trim(),
      currentPosition: candidateForm.currentPosition.trim(),
      targetPosition: candidateForm.targetPosition.trim(),
      department: candidateForm.department.trim(),
      status: 'active',
      scores: [],
      journey: defaultJourney(),
    };

    dispatch({ type: 'ADD_CANDIDATE', candidate });
    setIsAddOpen(false);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={fn.title}
        subtitle={org.name}
        actions={
          canAddCandidate || canEditFunction ? (
            <>
              {canAddCandidate ? (
                <Button variant="secondary" onClick={openAddCandidate}>
                  {t('functions.addToPool')}
                </Button>
              ) : null}
              {canEditFunction ? (
                <Button onClick={() => navigate(`/organizations/${org.id}/functions/${fn.id}/edit`)}>
                  {t('org.edit')}
                </Button>
              ) : null}
            </>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-400">{fn.department}</span>
        <Badge label={t(`priority.${fn.priority}`)} color={priorityColor(fn.priority)} />
        <Badge label={t(`fnStatus.${status}`)} color={statusColor(status)} />
        <span className="text-gray-400">
          {t('functions.selectedSuccessor')}:{' '}
          <span className="text-gray-100">
            {selectedCandidate?.name ?? t('functions.noneSelected')}
          </span>
        </span>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {t('functions.criteria')}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {fn.criteria.map((criterion) => (
              <div
                key={criterion.key}
                className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2"
              >
                <span className="text-sm text-gray-200">{criterion.label}</span>
                <span className="text-xs text-gray-500">
                  {t('functions.weight')}: {criterion.weight}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {t('functions.pool')}
            </h2>
            <span className="text-sm text-gray-400">
              {t('functions.poolSize')}: {rankedCandidates.length}
            </span>
          </div>

          {rankedCandidates.length === 0 ? (
            <p className="text-sm text-gray-400">{t('functions.noCandidates')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-2 py-3 text-start font-medium">{t('functions.candidate')}</th>
                    <th className="px-2 py-3 text-start font-medium">{t('functions.current')}</th>
                    <th className="px-2 py-3 text-start font-medium">{t('functions.target')}</th>
                    {fn.criteria.map((criterion) => (
                      <th key={criterion.key} className="px-2 py-3 text-start font-medium">
                        {criterion.label}
                      </th>
                    ))}
                    <th className="px-2 py-3 text-start font-medium">{t('functions.readiness')}</th>
                    <th className="px-2 py-3 text-start font-medium">{t('functions.status')}</th>
                    <th className="px-2 py-3 text-start font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {rankedCandidates.map(({ candidate, readiness }) => {
                    const isSelected = fn.selectedCandidateId === candidate.id;

                    return (
                      <tr
                        key={candidate.id}
                        className={isSelected ? 'bg-primary-500/10' : 'border-t border-gray-900'}
                      >
                        <td className="px-2 py-3 align-top">
                          <Link
                            to={`/organizations/${org.id}/candidates/${candidate.id}`}
                            className="font-medium text-white transition-colors hover:text-primary-300"
                          >
                            {candidate.name}
                          </Link>
                        </td>
                        <td className="px-2 py-3 align-top text-gray-300">
                          {candidate.currentPosition}
                        </td>
                        <td className="px-2 py-3 align-top text-gray-300">
                          {candidate.targetPosition}
                        </td>
                        {fn.criteria.map((criterion) => (
                          <td key={criterion.key} className="px-2 py-3 align-top text-gray-300">
                            {candidate.scores.find((score) => score.criterionKey === criterion.key)?.value ?? 0}
                          </td>
                        ))}
                        <td className="min-w-28 px-2 py-3 align-top">
                          <ProgressBar value={readiness} />
                        </td>
                        <td className="px-2 py-3 align-top">
                          <Badge
                            label={t(`status.${candidate.status}`)}
                            color={isSelected ? 'green' : 'gray'}
                          />
                        </td>
                        <td className="px-2 py-3 align-top">
                          {isSelected ? (
                            <Badge label={t('functions.selected')} color="green" />
                          ) : canSelectSuccessor ? (
                            <Button
                              type="button"
                              variant="ghost"
                              className="whitespace-nowrap"
                              onClick={() => selectSuccessor(candidate.id)}
                            >
                              {t('functions.selectSuccessor')}
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {isAddOpen ? (
        <Modal title={t('functions.addToPool')} onClose={() => setIsAddOpen(false)}>
          <form onSubmit={addCandidate} className="space-y-4">
            <Field label={t('form.name')}>
              <TextInput
                value={candidateForm.name}
                required
                onChange={(event) =>
                  setCandidateForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('functions.current')}>
                <TextInput
                  value={candidateForm.currentPosition}
                  required
                  onChange={(event) =>
                    setCandidateForm((current) => ({
                      ...current,
                      currentPosition: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label={t('functions.target')}>
                <TextInput
                  value={candidateForm.targetPosition}
                  required
                  onChange={(event) =>
                    setCandidateForm((current) => ({
                      ...current,
                      targetPosition: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <Field label={t('functions.department')}>
              <TextInput
                value={candidateForm.department}
                required
                onChange={(event) =>
                  setCandidateForm((current) => ({
                    ...current,
                    department: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="flex items-center gap-2 pt-2">
              <Button type="submit">{t('form.save')}</Button>
              <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                {t('form.cancel')}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
};
