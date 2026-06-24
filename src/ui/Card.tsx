import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  className?: string;
  to?: string;
  id?: string;
}

const base =
  'block rounded-lg border border-gray-700 bg-gray-800/70 p-4 shadow-lg shadow-black/20';

export const Card: React.FC<Props> = ({ children, className = '', to, id }) => {
  if (to) {
    return (
      <Link id={id} to={to} className={`${base} hover:border-primary-500 transition-colors ${className}`}>
        {children}
      </Link>
    );
  }
  return <div id={id} className={`${base} ${className}`}>{children}</div>;
};
