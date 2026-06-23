import React from 'react';
import type { FunctionStatus, Priority } from '../types';

const tone: Record<string, string> = {
  green: 'bg-green-500/15 text-green-300 border-green-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  gray: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export const Badge: React.FC<{ label: string; color: keyof typeof tone }> = ({
  label,
  color,
}) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${tone[color]}`}
  >
    {label}
  </span>
);

export const statusColor = (status: FunctionStatus): keyof typeof tone =>
  status === 'ready' ? 'green' : status === 'in-progress' ? 'amber' : 'gray';

export const priorityColor = (priority: Priority): keyof typeof tone =>
  priority === 'high' ? 'red' : priority === 'medium' ? 'amber' : 'gray';
