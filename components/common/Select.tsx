
import React from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, placeholder, className = '', ...props }) => {
  const baseClasses = "appearance-none block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 ps-3 pe-10 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

  return (
    <div className="relative">
      <select className={`${baseClasses} ${className}`} {...props}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 rtl:left-0 rtl:right-auto">
        <ChevronDownIcon className="h-5 w-5" />
      </div>
    </div>
  );
};
