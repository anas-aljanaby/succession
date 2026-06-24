import { describe, expect, it } from 'vitest';
import { seedState } from '../store/seed';
import { applyLanguageToState } from './localizeState';

describe('applyLanguageToState', () => {
  it('localizes seeded candidate names when switching to English', () => {
    const arabic = seedState();
    expect(arabic.candidates.find((c) => c.id === 'cand-khalid')?.name).toBe('خالد الغامدي');

    const english = applyLanguageToState(arabic, 'en');
    expect(english.candidates.find((c) => c.id === 'cand-khalid')?.name).toBe('Khalid Al-Ghamdi');
    expect(english.candidates.find((c) => c.id === 'cand-abdullatif')?.name).toBe(
      'Abdullatif Al-Kandari'
    );
  });

  it('localizes organization sectors and journey stages', () => {
    const english = applyLanguageToState(seedState(), 'en');

    expect(english.organizations.find((o) => o.id === 'org-gda')?.sector).toBe('Government');
    expect(english.functions.find((f) => f.id === 'fn-cto')?.criteria[0].label).toBe('Competence');

    const layla = english.candidates.find((c) => c.id === 'cand-layla');
    expect(layla?.journey[0]?.name).toBe('Needs Analysis & Mandate Alignment');
  });

  it('localizes back to Arabic', () => {
    const english = applyLanguageToState(seedState(), 'en');
    const arabic = applyLanguageToState(english, 'ar');

    expect(arabic.organizations.find((o) => o.id === 'org-acme')?.name).toBe('شركة ACME');
    expect(arabic.candidates.find((c) => c.id === 'cand-layla')?.name).toBe('ليلى القحطاني');
  });
});
