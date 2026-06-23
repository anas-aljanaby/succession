import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { InstitutionType, Language, Organization } from '../types';
import { useApp } from '../store/AppContext';
import { useLanguage } from '../lib/i18n';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Field, TextInput, TextArea, SelectInput } from '../ui/Field';

const TYPES: InstitutionType[] = ['corporate', 'government', 'education', 'charity'];
const LANGS: Language[] = ['en', 'ar'];
const MATURITIES: Organization['maturityLevel'][] = ['Emerging', 'Maturing', 'Advanced'];
const STATUSES: Organization['status'][] = ['active', 'inactive'];

export const OrganizationForm: React.FC = () => {
  const { orgId } = useParams();
  const { state, dispatch } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const existing = orgId ? state.organizations.find((o) => o.id === orgId) : undefined;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    sector: existing?.sector ?? '',
    type: existing?.type ?? ('corporate' as InstitutionType),
    languagePref: existing?.languagePref ?? ('ar' as Language),
    maturityLevel: existing?.maturityLevel ?? 'Emerging',
    status: existing?.status ?? 'active',
    description: existing?.description ?? '',
    email: existing?.contactInfo?.email ?? '',
    phone: existing?.contactInfo?.phone ?? '',
    address: existing?.contactInfo?.address ?? '',
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const org: Organization = {
      id: existing?.id ?? `org-${Date.now()}`,
      name: form.name.trim(),
      sector: form.sector.trim(),
      type: form.type,
      languagePref: form.languagePref,
      maturityLevel: form.maturityLevel,
      status: form.status,
      description: form.description.trim() || undefined,
      contactInfo: { email: form.email, phone: form.phone, address: form.address },
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    dispatch(existing ? { type: 'UPDATE_ORG', org } : { type: 'ADD_ORG', org });
    navigate(`/organizations/${org.id}`);
  };

  return (
    <section className="max-w-2xl">
      <PageHeader title={existing ? t('form.editOrg') : t('form.createOrg')} />
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label={t('form.name')}>
          <TextInput
            value={form.name}
            required
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>
        <Field label={t('form.sector')}>
          <TextInput value={form.sector} onChange={(e) => set('sector', e.target.value)} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t('form.type')}>
            <SelectInput
              value={form.type}
              onChange={(e) => set('type', e.target.value as InstitutionType)}
            >
              {TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(`type.${ty}`)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t('form.language')}>
            <SelectInput
              value={form.languagePref}
              onChange={(e) => set('languagePref', e.target.value as Language)}
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {t(`lang.${l}`)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t('form.maturity')}>
            <SelectInput
              value={form.maturityLevel}
              onChange={(e) =>
                set('maturityLevel', e.target.value as Organization['maturityLevel'])
              }
            >
              {MATURITIES.map((m) => (
                <option key={m} value={m}>
                  {t(`maturity.${m}`)}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label={t('form.status')}>
            <SelectInput
              value={form.status}
              onChange={(e) => set('status', e.target.value as Organization['status'])}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <Field label={t('form.description')}>
          <TextArea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label={t('form.email')}>
            <TextInput value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label={t('form.phone')}>
            <TextInput value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label={t('form.address')}>
            <TextInput
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </Field>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit">{t('form.save')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            {t('form.cancel')}
          </Button>
        </div>
      </form>
    </section>
  );
};
