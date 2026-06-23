import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-500 text-white',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700',
  ghost: 'text-gray-300 hover:text-white hover:bg-gray-800',
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button: React.FC<Props> = ({ variant = 'primary', className = '', ...rest }) => (
  <button
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    {...rest}
  />
);
