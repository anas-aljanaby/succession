import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';
import { useLanguage } from '../lib/i18n';
import { useApp } from '../store/AppContext';
import { Breadcrumb } from './Breadcrumb';
import { RoleSwitcher } from './RoleSwitcher';
import { OrgMenu } from './OrgMenu';
import { CandidateSwitcher } from './CandidateSwitcher';
import { NavIconButton } from './NavIconButton';
import { NotificationPanel } from './NotificationPanel';
import { AiChatbotPanel } from './AiChatbotPanel';
import { useShellNotifications } from './NotificationContext';
import { CalendarClockIcon } from '@/components/icons/CalendarClockIcon';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { GlobeAltIcon } from '@/components/icons/GlobeAltIcon';
import { BotIcon } from '@/components/icons/BotIcon';
import { BellIcon } from '@/components/icons/BellIcon';
import { LogoutIconV2 } from '@/components/icons/LogoutIconV2';

interface Props {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Topbar: React.FC<Props> = ({ activeRole, onRoleChange }) => {
  const { t, language, setLanguage } = useLanguage();
  const { state, dispatch } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useShellNotifications();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const orgMatch = pathname.match(/^\/organizations\/([^/]+)/);
  const routeOrgId = orgMatch?.[1];
  const candMatch = pathname.match(/^\/organizations\/[^/]+\/candidates\/([^/]+)/);
  const routeCandidateId = candMatch?.[1];
  const contextOrgId = routeOrgId ?? activeUser?.organizationId;
  const contextOrg = contextOrgId
    ? state.organizations.find((org) => org.id === contextOrgId)
    : undefined;

  const selectedCandidateName = useMemo(() => {
    if (!routeCandidateId) return null;
    return state.candidates.find((candidate) => candidate.id === routeCandidateId)?.name ?? null;
  }, [routeCandidateId, state.candidates]);

  const showNavIcons = ['ORGANIZATION_ADMIN', 'CONSULTANT', 'HR_MANAGER'].includes(activeRole);
  const hasJourneyContext = Boolean(routeCandidateId);
  const showOrgSwitcher = activeRole === 'CONSULTANT' && Boolean(routeOrgId);
  const showCandidateSwitcher = activeRole !== 'CANDIDATE' && Boolean(routeOrgId);

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const openJourneyTimeline = () => {
    if (!routeOrgId || !routeCandidateId) return;
    navigate(`/organizations/${routeOrgId}/candidates/${routeCandidateId}#journey`);
  };

  const openValuesDashboard = () => {
    if (!hasJourneyContext) return;
    navigate('/coming-soon/value-mirror');
  };

  return (
    <>
      <header className="glass-header sticky top-0 z-50 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {showNavIcons ? (
            <nav className="flex items-center gap-[18px] shrink-0 top-left-nav">
              <NavIconButton
                label={t('topbar.journeyTimeline')}
                disabled={!hasJourneyContext}
                onClick={openJourneyTimeline}
              >
                <CalendarClockIcon />
              </NavIconButton>
              <NavIconButton
                label={t('topbar.valuesDashboard')}
                disabled={!hasJourneyContext}
                onClick={openValuesDashboard}
              >
                <DiamondIcon />
              </NavIconButton>
            </nav>
          ) : null}
          <div className="min-w-0">
            <Breadcrumb />
            {selectedCandidateName ? (
              <span className="mt-0.5 block text-xs text-primary-300 truncate">
                {selectedCandidateName}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {activeRole !== 'CONSULTANT' && contextOrg ? (
            <span className="hidden md:inline text-sm font-semibold text-gray-400 max-w-[10rem] truncate">
              {contextOrg.name}
            </span>
          ) : null}

          {showOrgSwitcher ? <OrgMenu /> : null}
          {showCandidateSwitcher && routeOrgId ? (
            <CandidateSwitcher orgId={routeOrgId} />
          ) : null}
          <RoleSwitcher activeRole={activeRole} onRoleChange={onRoleChange} />

          <NavIconButton
            label={language === 'en' ? t('topbar.arabic') : t('topbar.english')}
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            <GlobeAltIcon className="h-6 w-6" />
          </NavIconButton>

          <NavIconButton
            label={t('topbar.aiAdvisor')}
            onClick={() => setChatbotOpen(true)}
          >
            <BotIcon />
          </NavIconButton>

          <div className="relative">
            <NavIconButton
              label={t('topbar.notifications')}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <BellIcon />
            </NavIconButton>
            {unreadCount > 0 ? (
              <span className="pointer-events-none absolute top-0 end-0 h-3 w-3 rounded-full bg-red-500 border-2 border-gray-800 animate-pulse" />
            ) : null}
            {notificationsOpen ? (
              <NotificationPanel onClose={() => setNotificationsOpen(false)} />
            ) : null}
          </div>

          <NavIconButton label={t('topbar.logout')} onClick={logout}>
            <LogoutIconV2 />
          </NavIconButton>
        </div>
      </header>

      <AiChatbotPanel open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};
