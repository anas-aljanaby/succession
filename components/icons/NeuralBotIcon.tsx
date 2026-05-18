import React from 'react';

export const NeuralBotIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="neural-grad" x1="0" y1="0" x2="24" y2="24">
        <stop stopColor="#a78bfa" />
        <stop offset="1" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#neural-grad)" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" fill="url(#neural-grad)" fillOpacity="0.5"/>
    <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.929 4.929L6.343 6.343M17.657 17.657L19.071 19.071M4.929 19.071L6.343 17.657M17.657 6.343L19.071 4.929" stroke="url(#neural-grad)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
