import React from 'react';

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500';

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="block">
    <span className="block mb-1 text-sm text-gray-300">{label}</span>
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
