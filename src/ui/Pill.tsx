import React from 'react';
import { toneFill, toneText, type Tone } from './tone';

export const Pill: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <span
    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneFill[tone]} ${toneText[tone]}`}
  >
    {children}
  </span>
);
