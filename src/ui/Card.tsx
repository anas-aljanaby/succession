import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  className?: string;
  to?: string;
}

const base =
  'block rounded-lg border border-gray-800 bg-gray-800/40 p-4';

export const Card: React.FC<Props> = ({ children, className = '', to }) => {
  if (to) {
    return (
      <Link to={to} className={`${base} hover:border-primary-500 transition-colors ${className}`}>
        {children}
      </Link>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
};
