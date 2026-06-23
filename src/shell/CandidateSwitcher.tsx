import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/i18n';
import { visibleCandidatesForOrg } from '../lib/permissions';
import { useApp } from '../store/AppContext';

export const CandidateSwitcher: React.FC<{ orgId: string }> = ({ orgId }) => {
  const { t } = useLanguage();
  const { state } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeRole = state.session.activeRole;
  const activeUser = state.users.find((user) => user.id === state.session.userId);
  const candidates = visibleCandidatesForOrg(
    state.candidates,
    activeRole,
    activeUser,
    orgId
  );

  if (candidates.length <= 1) return null;

  const candMatch = pathname.match(
    /^\/organizations\/[^/]+\/candidates\/([^/]+)/
  );
  const activeCandidateId = candMatch?.[1] ?? '';

  return (
    <label className="flex items-center gap-2 text-sm text-gray-400">
      <span className="hidden sm:inline">{t('topbar.candidate')}</span>
      <select
        value={activeCandidateId}
        onChange={(e) =>
          navigate(`/organizations/${orgId}/candidates/${e.target.value}`)
        }
        className="max-w-[10rem] bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 truncate"
      >
        <option value="" disabled>
          {t('topbar.selectCandidate')}
        </option>
        {candidates.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.name}
          </option>
        ))}
      </select>
    </label>
  );
};
