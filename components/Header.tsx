
import React, { useMemo, useState } from 'react';
import type { Language, Organization, Translations, User, UserRole, Candidate } from '../types';
import { Select } from './common/Select';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { SwitchHorizontalIcon } from './icons/SwitchHorizontalIcon';
import { BellIcon } from './icons/BellIcon';
import { NotificationPanel } from './notifications/NotificationPanel';
import { usePermissions } from '../lib/permissions/PermissionContext';
import { useNotifications } from '../lib/notifications/NotificationContext';
import { BotIcon } from './icons/BotIcon';
import { LogoutIconV2 } from './icons/LogoutIconV2';

interface HeaderProps {
  t: Translations;
  language: Language;
  setLanguage: (lang: Language) => void;
  orgs: Organization[];
  selectedOrgId: number | null;
  onOrgChange: (id: number) => void;
  user: User | null;
  activeRole: UserRole | null;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onToggleChatbot: () => void;
}

const Header: React.FC<HeaderProps> = ({
  t,
  language,
  setLanguage,
  orgs,
  selectedOrgId,
  onOrgChange,
  user,
  activeRole,
  onRoleSwitch,
  onLogout,
  onNavigateHome,
  onToggleChatbot,
}) => {
  const { hasRole } = usePermissions();
  const selectedOrgName = orgs.find(o => o.id === selectedOrgId)?.name;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="glass-header sticky top-0 z-50 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-white cursor-pointer" onClick={onNavigateHome}>
          {t.appTitle}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {hasRole('CONSULTANT') ? (
          <div className="w-56 hidden sm:block">
            <Select
              options={orgs.map(o => ({ value: o.id, label: o.name }))}
              onChange={(e) => onOrgChange(parseInt(e.target.value))}
              value={selectedOrgId || ''}
              placeholder={t.selectOrg}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        ) : (
          <div className="hidden sm:block text-gray-400 font-semibold">
            {selectedOrgName}
          </div>
        )}

        {user && user.roles.length > 1 && (
          <div className="hidden sm:flex items-center gap-2 bg-gray-900/50 p-1 rounded-lg">
            <SwitchHorizontalIcon />
            <div className="w-44">
              <Select
                options={user.roles.map(r => ({ value: r, label: t[`role_${r}`] }))}
                onChange={(e) => onRoleSwitch(e.target.value as UserRole)}
                value={activeRole || ''}
                className="bg-gray-700 border-gray-600 text-white !py-1.5 !text-xs"
              />
            </div>
          </div>
        )}

        <button onClick={handleLanguageToggle} className="nav-icon-button" aria-label={t.changeLanguage}>
          <GlobeAltIcon className="h-6 w-6" />
          <span className="tooltip">{language === 'en' ? t.arabic : t.english}</span>
        </button>

        <button onClick={onToggleChatbot} className="nav-icon-button" aria-label={t.aiChatbotTitle}>
          <BotIcon />
          <span className="tooltip">{t.aiChatbotTitle}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="nav-icon-button"
            aria-label={t.notifications}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-gray-800 animate-pulse"></span>
            )}
            <span className="tooltip">{t.notifications}</span>
          </button>
          {isNotificationsOpen && (
            <NotificationPanel onClose={() => setIsNotificationsOpen(false)} />
          )}
        </div>

        <button onClick={onLogout} className="nav-icon-button" aria-label={t.logout}>
          <LogoutIconV2 />
          <span className="tooltip">{t.logout}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
