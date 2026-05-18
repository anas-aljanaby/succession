import React from 'react';

export const ChatBubbleLeftEllipsisIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-.388m-5.34-4.435a2.25 2.25 0 01-.622-1.625V8.375c0-1.036.84-1.875 1.875-1.875h12.75c1.035 0 1.875.84 1.875 1.875v3.375c0 .621-.504 1.125-1.125 1.125h-8.25a1.125 1.125 0 01-1.125-1.125v-1.5a1.125 1.125 0 00-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125z" />
    </svg>
);
