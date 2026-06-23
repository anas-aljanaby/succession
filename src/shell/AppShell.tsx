import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  const { state, dispatch } = useApp();
  const activeRole = state.session.activeRole ?? 'CONSULTANT';

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          activeRole={activeRole}
          onRoleChange={(role) => dispatch({ type: 'SET_ROLE', role })}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
