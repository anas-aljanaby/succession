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
