import React from 'react';
import { toneFill, toneText, type Tone } from './tone';

export const Chip: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <span
    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg [&_svg]:!h-[18px] [&_svg]:!w-[18px] ${toneFill[tone]} ${toneText[tone]}`}
  >
    {children}
  </span>
);
