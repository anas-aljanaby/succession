import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AppShell } from './shell/AppShell';
import { Login } from './routes/Login';
import { Home } from './routes/Home';
import { OrganizationsList } from './routes/OrganizationsList';
import { OrganizationDashboard } from './routes/OrganizationDashboard';
import { OrganizationForm } from './routes/OrganizationForm';
import { FunctionsList } from './routes/FunctionsList';
import { FunctionForm } from './routes/FunctionForm';
import { FunctionDetail } from './routes/FunctionDetail';
import { CandidatesList } from './routes/CandidatesList';
import { CandidateDetail } from './routes/CandidateDetail';
import { CandidateJourneyTimeline } from './routes/CandidateJourneyTimeline';
import { CandidateValuesDashboard } from './routes/CandidateValuesDashboard';
import { ComingSoon, ComingSoonLegacyRedirect } from './routes/ComingSoon';
import { AiInsightsHub } from './routes/AiInsightsHub';
import { OrgAiInsights } from './routes/OrgAiInsights';
import { Settings } from './routes/Settings';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />

            <Route path="/organizations" element={<OrganizationsList />} />
            <Route path="/organizations/new" element={<OrganizationForm />} />
            <Route path="/organizations/:orgId" element={<OrganizationDashboard />} />
            <Route path="/organizations/:orgId/ai-insights" element={<OrgAiInsights />} />
            <Route path="/organizations/:orgId/more" element={<ComingSoon />} />
            <Route path="/organizations/:orgId/more/:feature" element={<ComingSoon />} />
            <Route path="/organizations/:orgId/edit" element={<OrganizationForm />} />

            <Route path="/organizations/:orgId/functions" element={<FunctionsList />} />
            <Route path="/organizations/:orgId/functions/new" element={<FunctionForm />} />
            <Route path="/organizations/:orgId/functions/:fnId" element={<FunctionDetail />} />
            <Route path="/organizations/:orgId/functions/:fnId/edit" element={<FunctionForm />} />

            <Route path="/organizations/:orgId/candidates" element={<CandidatesList />} />
            <Route path="/organizations/:orgId/candidates/:candId" element={<CandidateDetail />} />
            <Route
              path="/organizations/:orgId/candidates/:candId/journey-timeline"
              element={<CandidateJourneyTimeline />}
            />
            <Route
              path="/organizations/:orgId/candidates/:candId/values-dashboard"
              element={<CandidateValuesDashboard />}
            />

            <Route path="/ai-insights" element={<AiInsightsHub />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/coming-soon" element={<ComingSoonLegacyRedirect />} />
            <Route path="/coming-soon/ai-insights" element={<Navigate to="/ai-insights" replace />} />
            <Route path="/coming-soon/:feature" element={<ComingSoonLegacyRedirect />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};
