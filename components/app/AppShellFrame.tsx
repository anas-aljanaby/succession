import React from 'react';
import type { Language, Organization, SuccessionPlan, Translations, User, UserRole, View } from '../../types';
import type { NavigateFn } from '../../lib/navigation/types';
import Header from '../Header';
import { AppSectionNav } from '../AppSectionNav';
import { Breadcrumb } from '../Breadcrumb';

interface AppShellFrameProps {
  t: Translations;
  language: Language;
  setLanguage: (lang: Language) => void;
  organizations: Organization[];
  selectedOrgId: number | null;
  selectedOrg: Organization | null;
  onOrgChange: (id: number) => void;
  user: User;
  activeRole: UserRole | null;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onToggleChatbot: () => void;
  activePlan: SuccessionPlan | null;
  selectedStageCode: string | null;
  currentView: View;
  onNavigateSection: (view: View) => void;
  navigate: NavigateFn;
  onClearOrg: () => void;
  children: React.ReactNode;
  mainClassName?: string;
}

export const AppShellFrame: React.FC<AppShellFrameProps> = ({
  t,
  language,
  setLanguage,
  organizations,
  selectedOrgId,
  selectedOrg,
  onOrgChange,
  user,
  activeRole,
  onRoleSwitch,
  onLogout,
  onNavigateHome,
  onToggleChatbot,
  activePlan,
  selectedStageCode,
  currentView,
  onNavigateSection,
  navigate,
  onClearOrg,
  children,
  mainClassName = 'p-4 sm:p-6 lg:p-8',
}) => {
  return (
    <div className="min-h-screen">
      <Header
        t={t}
        language={language}
        setLanguage={setLanguage}
        orgs={organizations}
        selectedOrgId={selectedOrgId}
        onOrgChange={onOrgChange}
        user={user}
        activeRole={activeRole}
        onRoleSwitch={onRoleSwitch}
        onLogout={onLogout}
        onNavigateHome={onNavigateHome}
        onToggleChatbot={onToggleChatbot}
      />
      <AppSectionNav
        t={t}
        activeRole={activeRole}
        currentView={currentView}
        hasSelectedOrganization={Boolean(selectedOrgId)}
        selectedOrgName={selectedOrg?.name || null}
        onNavigate={onNavigateSection}
      />
      <Breadcrumb
        currentView={currentView}
        activeRole={activeRole}
        selectedOrg={selectedOrg}
        activePlan={activePlan}
        selectedStageCode={selectedStageCode}
        t={t}
        navigate={navigate}
        onClearOrg={onClearOrg}
      />
      <main className={mainClassName}>{children}</main>
    </div>
  );
};
