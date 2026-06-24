import type { CandidateStatus, FunctionStatus, TaskStatus } from '../types';

export type Tone = 'accent' | 'ok' | 'warn' | 'bad' | 'info';

export const toneText: Record<Tone, string> = {
  accent: 'text-[var(--accent-bright)]',
  ok: 'text-[var(--ok)]',
  warn: 'text-[var(--warn)]',
  bad: 'text-[var(--bad)]',
  info: 'text-[var(--info)]',
};

export const toneFill: Record<Tone, string> = {
  accent: 'bg-[var(--accent-soft)]',
  ok: 'bg-[var(--ok-soft)]',
  warn: 'bg-[var(--warn-soft)]',
  bad: 'bg-[var(--bad-soft)]',
  info: 'bg-[var(--info-soft)]',
};

export const candidateStatusTone = (status: CandidateStatus): Tone => {
  if (status === 'selected') return 'ok';
  if (status === 'paused') return 'warn';
  if (status === 'withdrawn') return 'bad';
  return 'info';
};

export const functionStatusTone = (status: FunctionStatus): Tone => {
  if (status === 'ready') return 'ok';
  if (status === 'in-progress') return 'warn';
  return 'bad';
};

export const taskStatusTone = (status: TaskStatus): Tone => {
  if (status === 'completed') return 'ok';
  if (status === 'inProgress') return 'warn';
  return 'info';
};
