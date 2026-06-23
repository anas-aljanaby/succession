import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { UserRole } from '../types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

// Phase 0: active role held locally so the shell is interactive. Phase 1 moves this
// into the app store / session state.
export const AppShell: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('CONSULTANT');

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar activeRole={activeRole} onRoleChange={setActiveRole} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
