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
import { ComingSoon } from './routes/ComingSoon';
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
            <Route path="/organizations/:orgId/edit" element={<OrganizationForm />} />

            <Route path="/organizations/:orgId/functions" element={<FunctionsList />} />
            <Route path="/organizations/:orgId/functions/new" element={<FunctionForm />} />
            <Route path="/organizations/:orgId/functions/:fnId" element={<FunctionDetail />} />
            <Route path="/organizations/:orgId/functions/:fnId/edit" element={<FunctionForm />} />

            <Route path="/organizations/:orgId/candidates" element={<CandidatesList />} />
            <Route path="/organizations/:orgId/candidates/:candId" element={<CandidateDetail />} />

            <Route path="/settings" element={<Settings />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/coming-soon/:feature" element={<ComingSoon />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};
