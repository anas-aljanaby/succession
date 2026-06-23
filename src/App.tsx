import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './lib/i18n';
import { AppShell } from './shell/AppShell';
import { Login } from './routes/Login';
import { Home } from './routes/Home';
import { ComingSoon } from './routes/ComingSoon';
import { Placeholder } from './ui/Placeholder';

// Phase 0: screens not yet built render a labelled placeholder so navigation,
// the shell, breadcrumb, and back/forward can be verified end to end.
const Stub: React.FC<{ titleKey: string }> = ({ titleKey }) => {
  const { t } = useLanguage();
  return <Placeholder title={t(titleKey)} />;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />

            <Route path="/organizations" element={<Stub titleKey="nav.organizations" />} />
            <Route path="/organizations/new" element={<Stub titleKey="nav.organizations" />} />
            <Route path="/organizations/:orgId" element={<Stub titleKey="nav.dashboard" />} />
            <Route path="/organizations/:orgId/edit" element={<Stub titleKey="nav.organizations" />} />

            <Route path="/organizations/:orgId/functions" element={<Stub titleKey="nav.functions" />} />
            <Route path="/organizations/:orgId/functions/new" element={<Stub titleKey="nav.functions" />} />
            <Route path="/organizations/:orgId/functions/:fnId" element={<Stub titleKey="nav.functions" />} />
            <Route path="/organizations/:orgId/functions/:fnId/edit" element={<Stub titleKey="nav.functions" />} />

            <Route path="/organizations/:orgId/candidates" element={<Stub titleKey="nav.candidates" />} />
            <Route path="/organizations/:orgId/candidates/:candId" element={<Stub titleKey="nav.candidates" />} />

            <Route path="/coming-soon/:feature" element={<ComingSoon />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};
