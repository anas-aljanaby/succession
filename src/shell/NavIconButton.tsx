import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: React.ReactNode;
}

export const NavIconButton: React.FC<Props> = ({
  label,
  children,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    aria-label={label}
    className={`nav-icon-button ${className}`}
    {...rest}
  >
    {children}
    <span className="tooltip">{label}</span>
  </button>
);
