import React from 'react';

const inputClass =
  'w-full rounded-md border border-[var(--border)] bg-[var(--card-2)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]';

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="block">
    <span className="mb-1 block text-sm text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={inputClass} />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (
  props
) => <textarea {...props} className={`${inputClass} min-h-24`} />;

export const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props
) => <select {...props} className={inputClass} />;
