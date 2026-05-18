import React from 'react';

export const LogoutIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logout-grad" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#f43f5e" />
                <stop offset="1" stopColor="#fb7185" />
            </linearGradient>
        </defs>
        <path d="M15 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H15" stroke="url(#logout-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 12H9M19 12L16 15M19 12L16 9" stroke="url(#logout-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
