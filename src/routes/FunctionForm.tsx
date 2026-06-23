import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import type { CriticalFunction, Priority } from '../types';
import { useApp } from '../store/AppContext';
import { DEFAULT_CRITERIA } from '../lib/criteria';
import { useLanguage } from '../lib/i18n';
import { Button } from '../ui/Button';
import { Field, SelectInput, TextInput } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

const copyCriteria = (criteria: CriticalFunction['criteria']) =>
  criteria.map((criterion) => ({ ...criterion }));

export const FunctionForm: React.FC = () => {
  const { orgId, fnId } = useParams();
  const { state, dispatch } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const org = state.organizations.find((item) => item.id === orgId);
  const existing = fnId ? state.functions.find((item) => item.id === fnId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [department, setDepartment] = useState(existing?.department ?? '');
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'high');
  const [criteria, setCriteria] = useState(
    copyCriteria(existing?.criteria ?? DEFAULT_CRITERIA)
  );

  if (!org) return <Navigate to="/organizations" replace />;
  if (fnId && (!existing || existing.organizationId !== org.id)) {
    return <Navigate to={`/organizations/${org.id}/functions`} replace />;
  }

  const updateCriterion = (
    index: number,
    field: 'label' | 'weight',
    value: string | number
  ) => {
    setCriteria((current) =>
      current.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, [field]: value } : criterion
      )
    );
  };

  const addCriterion = () => {
    setCriteria((current) => [
      ...current,
      { key: `crit-${Date.now()}`, label: '', weight: 1 },
    ]);
  };

  const removeCriterion = (index: number) => {
    setCriteria((current) => current.filter((_, criterionIndex) => criterionIndex !== index));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const fn: CriticalFunction = {
      id: existing?.id ?? `fn-${Date.now()}`,
      organizationId: org.id,
      title: title.trim(),
      department: department.trim(),
      priority,
      status: existing?.status ?? 'vacant',
      criteria: criteria.map((criterion) => ({
        ...criterion,
        label: criterion.label.trim(),
        weight: Number(criterion.weight) || 0,
      })),
      selectedCandidateId: existing?.selectedCandidateId,
    };

    dispatch(existing ? { type: 'UPDATE_FUNCTION', fn } : { type: 'ADD_FUNCTION', fn });
    navigate(`/organizations/${org.id}/functions/${fn.id}`);
  };

  return (
    <section className="max-w-4xl">
      <PageHeader
        title={existing ? t('functions.editTitle') : t('functions.createTitle')}
        subtitle={org.name}
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('functions.functionTitle')}>
              <TextInput
                value={title}
                required
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field>
            <Field label={t('functions.department')}>
              <TextInput
                value={department}
                required
                onChange={(event) => setDepartment(event.target.value)}
              />
            </Field>
            <Field label={t('functions.priority')}>
              <SelectInput
                value={priority}
                onChange={(event) => setPriority(event.target.value as Priority)}
              >
                {PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {t(`priority.${item}`)}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {t('functions.criteriaEditor')}
            </h2>
            <Button type="button" variant="secondary" onClick={addCriterion}>
              {t('functions.addCriterion')}
            </Button>
          </div>

          <div className="space-y-3">
            {criteria.map((criterion, index) => (
              <div
                key={criterion.key}
                className="grid gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 sm:grid-cols-[minmax(0,1fr)_140px_auto]"
              >
                <Field label={t('functions.criterionLabel')}>
                  <TextInput
                    value={criterion.label}
                    required
                    onChange={(event) =>
                      updateCriterion(index, 'label', event.target.value)
                    }
                  />
                </Field>
                <Field label={t('functions.criterionWeight')}>
                  <TextInput
                    type="number"
                    min="0"
                    step="1"
                    value={criterion.weight}
                    required
                    onChange={(event) =>
                      updateCriterion(index, 'weight', Number(event.target.value))
                    }
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeCriterion(index)}
                  >
                    {t('functions.removeCriterion')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-2">
          <Button type="submit">{t('form.save')}</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(existing ? `/organizations/${org.id}/functions/${existing.id}` : `/organizations/${org.id}/functions`)}
          >
            {t('form.cancel')}
          </Button>
        </div>
      </form>
    </section>
  );
};
