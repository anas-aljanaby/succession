

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#1a1f2e] border border-white/10 rounded-lg p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  );
};