import React from 'react';
import type { Organization, SuccessionPlan, Translations } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PencilIcon } from '../icons/PencilIcon';

interface OrganizationDetailsProps {
  organization: Organization;
  plans: SuccessionPlan[];
  t: Translations;
  onBack: () => void;
  onEdit: (org: Organization) => void;
  onEnterWorkspace: () => void;
}

const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({ organization, plans, t, onBack, onEdit, onEnterWorkspace }) => {
  const avgReadiness = plans.length > 0
    ? Math.round(plans.reduce((acc, p) => acc + p.readiness, 0) / plans.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-start">
        <div>
          <Button onClick={onBack} variant="secondary" className="mb-4">
            <ArrowLeftIcon />
            {t.backToList}
          </Button>
          <h2 className="text-3xl font-bold text-white">{organization.name}</h2>
          <p className="text-gray-400">{organization.sector}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onEnterWorkspace}>
            {t.enterWorkspace}
          </Button>
          <Button onClick={() => onEdit(organization)} variant="secondary">
            <PencilIcon />
            {t.edit}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">{t.generalInfo}</h3>
          <div className="space-y-4">
            <p className="text-gray-300">{organization.description || t.noDescription}</p>
            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-semibold text-gray-200 mb-2">{t.contactInfo}</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li><strong>{t.email}:</strong> {organization.contactInfo?.email || 'N/A'}</li>
                <li><strong>{t.phone}:</strong> {organization.contactInfo?.phone || 'N/A'}</li>
                <li><strong>{t.address}:</strong> {organization.contactInfo?.address || 'N/A'}</li>
              </ul>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold text-white mb-4">{t.statistics}</h3>
          <div className="space-y-4 text-center">
            <div>
              <p className="text-5xl font-bold text-white">{plans.length}</p>
              <p className="text-gray-400">{t.activeCandidate}</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary-400">{avgReadiness}%</p>
              <p className="text-gray-400">{t.avgReadiness}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-white mb-4">{t.candidateList}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-400">{t.candidate}</th>
                <th className="p-4 text-sm font-semibold text-gray-400">{t.role}</th>
                <th className="p-4 text-sm font-semibold text-gray-400">{t.lriScore}</th>
                <th className="p-4 text-sm font-semibold text-gray-400">{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="border-b border-gray-700 last:border-b-0">
                  <td className="p-4 whitespace-nowrap text-white font-medium">{plan.candidate.name}</td>
                  <td className="p-4 whitespace-nowrap text-gray-300">{plan.roleTitle}</td>
                  <td className="p-4 whitespace-nowrap text-gray-300">{plan.readiness}%</td>
                  <td className="p-4 whitespace-nowrap text-gray-300">{plan.closureStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {plans.length === 0 && <p className="text-center py-8 text-gray-500">{t.noCandidatesForOrg}</p>}
        </div>
      </Card>
    </div>
  );
};

export default OrganizationDetails;
