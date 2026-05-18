

import React, { useState, useMemo } from 'react';
import type { Translations, UserRole, Language } from '../types';
import { Select } from './common/Select';
import { Button } from './common/Button';

// Icons for different times of day
const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L6.343 6.343" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
    </svg>
);
const MoonIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);
const BuildingOfficeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full p-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m3.75-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);


const getAdvisorAvatar = () => {
    const hour = new Date().getHours();
    // Morning (5am - 11:59am)
    if (hour >= 5 && hour < 12) { 
        return <SunIcon />; 
    }
    // Evening (12pm - 6:59pm)
    if (hour >= 12 && hour < 19) {
        return <BuildingOfficeIcon />;
    }
    // Night (7pm - 4:59am)
    return <MoonIcon />;
}

interface WelcomeMessageProps {
  t: Translations;
  onStart: (role: UserRole) => void;
  language: Language;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ t, onStart, language }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const advisorAvatar = useMemo(() => getAdvisorAvatar(), []);

  const roleOptions: { value: UserRole, label: string }[] = [
    { value: 'CANDIDATE', label: t.role_CANDIDATE },
    { value: 'SUPERVISOR', label: t.role_SUPERVISOR },
    { value: 'HR_MANAGER', label: t.role_HR_MANAGER },
    { value: 'ORGANIZATION_ADMIN', label: t.role_ORGANIZATION_ADMIN },
    { value: 'CONSULTANT', label: t.role_CONSULTANT },
    { value: 'VIEWER', label: t.role_VIEWER },
  ];

  const handleStart = () => {
      if(selectedRole) {
          onStart(selectedRole);
      }
  };

  return (
    <div className="animate-fade-in-up w-full max-w-lg">
      <div className="welcome-container p-10 md:p-14 text-center">
        <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-primary-500/50 flex items-center justify-center text-primary-400 p-2">
              {advisorAvatar}
            </div>
        </div>
        <div className="space-y-4">
            <h1
              style={{
                textAlign: "center",
                color: "#f9fafb",
                fontWeight: 700,
                lineHeight: "2.2",
                letterSpacing: language === 'ar' ? 'normal' : '0.4px',
                fontSize: "2.6rem",
                marginBottom: "0.8rem",
              }}
            >
              {t.welcomeGreeting}
              <br />
              <span style={{ fontWeight: 800, display: "inline-block", marginTop: "8px", whiteSpace: 'nowrap' }}>
                {t.welcomeJourney}
              </span>
              <br />
              <span
                className="inline-block mt-3 text-lg font-light text-primary-400 opacity-90"
              >
                {t.welcomeAdvisorName}
              </span>
            </h1>
            <div className="pt-8">
                <Select
                    options={roleOptions}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    placeholder={t.selectYourRole}
                />
            </div>
            <div className="pt-4">
                <Button onClick={handleStart} className="w-full" size="lg" disabled={!selectedRole}>
                    {t.startExperience}
                </Button>
            </div>
        </div>
      </div>
      <style>
        {`
          .preview, [data-testid="preview-icon"], .close-icon {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default WelcomeMessage;