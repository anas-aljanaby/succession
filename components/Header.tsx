
import React, { useMemo, useState } from 'react';
import type { Language, Organization, Translations, User, UserRole, SuccessionPlan, Candidate } from '../types';
import { Select } from './common/Select';
import { Button } from './common/Button';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { SwitchHorizontalIcon } from './icons/SwitchHorizontalIcon';
import { BellIcon } from './icons/BellIcon';
import { NotificationPanel } from './notifications/NotificationPanel';
import { BuildingOffice2Icon } from './icons/BuildingOffice2Icon';
import { usePermissions } from '../lib/permissions/PermissionContext';
import { PERMISSIONS } from '../lib/permissions/roles';
import { ProtectedComponent } from '../lib/permissions/ProtectedComponent';
import { useNotifications } from '../lib/notifications/NotificationContext';

// Import newly created icon components
import { CalendarClockIcon } from './icons/CalendarClockIcon';
import { DiamondIcon } from './icons/DiamondIcon';
import { BotIcon } from './icons/BotIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIconV2 } from './icons/LogoutIconV2';
import { LayoutDashboardIcon } from './icons/LayoutDashboardIcon';

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
  onNavigateToGlobalDashboard: () => void;
  onNavigateToOrganizations: () => void;
  onNavigateToConsultantDashboard: () => void;
  onToggleChatbot: () => void;
  activePlan: SuccessionPlan | null;
  onNavigateToJourneyTimelinePreview: () => void;
  onNavigateToValuesDashboard: () => void;
  onSettingsClick: () => void;
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { t, language, setLanguage, orgs, selectedOrgId, onOrgChange, user, activeRole, onRoleSwitch, onLogout, onNavigateToGlobalDashboard, onNavigateToOrganizations, onNavigateToConsultantDashboard, onToggleChatbot, activePlan, onNavigateToJourneyTimelinePreview, onNavigateToValuesDashboard, onSettingsClick, candidates, selectedCandidateId, onSelectCandidate } = props;
  const { hasPermission, hasRole } = usePermissions();
  const selectedOrgName = orgs.find(o => o.id === selectedOrgId)?.name;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();


  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const showNavIcons = useMemo(() => {
    if (!activeRole) return false;
    return ['ORGANIZATION_ADMIN', 'CONSULTANT', 'HR_MANAGER'].includes(activeRole);
  }, [activeRole]);

  const selectedCandidateName = useMemo(() => {
    if (!selectedCandidateId) return null;
    return candidates.find(c => c.id === selectedCandidateId)?.name;
  }, [selectedCandidateId, candidates]);

  return (
    <header className="glass-header sticky top-0 z-50 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showNavIcons && (
          <nav className="flex items-center gap-[18px]">
            <button
              onClick={onNavigateToJourneyTimelinePreview}
              disabled={!activePlan}
              className="nav-icon-button"
              aria-label={t.journeyTimelinePreview}
            >
              <CalendarClockIcon />
              <span className="tooltip">{t.journeyTimelinePreview}</span>
            </button>
            <button
              onClick={onNavigateToValuesDashboard}
              disabled={!activePlan}
              className="nav-icon-button"
              aria-label={t.valuesDashboard}
            >
              <DiamondIcon />
              <span className="tooltip">{t.valuesDashboard}</span>
            </button>
          </nav>
        )}
        <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-white cursor-pointer" onClick={onNavigateToGlobalDashboard}>
            {t.appTitle}
            </h1>
            {selectedCandidateName && (
                <span className="text-xs text-primary-300">{selectedCandidateName}</span>
            )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {hasRole('CONSULTANT') ? (
          <>
             <ProtectedComponent permission={PERMISSIONS.VIEW_ALL_ORGANIZATIONS}>
                <Button onClick={onNavigateToOrganizations} variant="secondary" size="sm">
                    <BuildingOffice2Icon />
                    <span>{t.manageOrganizations}</span>
                </Button>
            </ProtectedComponent>
            <ProtectedComponent role="CONSULTANT">
                <Button onClick={onNavigateToConsultantDashboard} variant="secondary" size="sm">
                    <LayoutDashboardIcon />
                    <span>{t.comprehensiveDashboard}</span>
                </Button>
            </ProtectedComponent>
            {selectedOrgId && (
              <Button onClick={onNavigateToGlobalDashboard} variant="secondary" size="sm">
                <GlobeAltIcon />
                {t.globalView}
              </Button>
            )}
            <div className="w-48 hidden sm:block">
              <Select
                options={orgs.map(o => ({ value: o.id, label: o.name }))}
                onChange={(e) => onOrgChange(parseInt(e.target.value))}
                value={selectedOrgId || ''}
                placeholder={t.selectOrg}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </>
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
        
        {candidates.length > 0 && hasPermission(PERMISSIONS.VIEW_CANDIDATES) && (
            <div className="hidden sm:flex items-center gap-2 bg-gray-900/50 p-1 rounded-lg">
                <span className="text-xs font-semibold text-gray-400 px-2">{t.quickCandidateSwitch}:</span>
                <div className="w-44">
                     <Select
                        options={candidates.map(c => ({ value: c.id, label: c.name }))}
                        onChange={(e) => onSelectCandidate(e.target.value)}
                        value={selectedCandidateId || ''}
                        placeholder="Switch candidate..."
                        className="bg-gray-700 border-gray-600 !py-1.5 !text-xs"
                    />
                </div>
            </div>
        )}

        <button
            onClick={handleLanguageToggle}
            className="nav-icon-button"
            aria-label={t.changeLanguage}
        >
            <GlobeAltIcon className="h-6 w-6" />
            <span className="tooltip">{language === 'en' ? t.arabic : t.english}</span>
        </button>
        
        <button onClick={onToggleChatbot} className="nav-icon-button" aria-label={t.aiChatbotTitle}>
            <BotIcon />
            <span className="tooltip">{t.aiChatbotTitle}</span>
        </button>

        <button onClick={onSettingsClick} className="nav-icon-button" aria-label={t.settings}>
            <SettingsIcon />
            <span className="tooltip">{t.settings}</span>
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
