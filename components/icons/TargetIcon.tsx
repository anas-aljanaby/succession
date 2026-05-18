import React from 'react';

export const TargetIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a17.953 17.953 0 01-2.62 3.32m2.62-3.32l2.62 3.32m0 0v4.82a6 6 0 01-5.84-7.38m5.84 2.56l-2.62-3.32m2.62 3.32l-2.62-3.32m0 0a6 6 0 019.12-3.32m-5.84 7.38l-2.62-3.32" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);