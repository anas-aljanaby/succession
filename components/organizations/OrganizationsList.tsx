import React from 'react';
import type { Organization, SuccessionPlan, Translations } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface OrganizationsListProps {
  organizations: Organization[];
  plans: SuccessionPlan[];
  t: Translations;
  onView: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onDelete: (orgId: number) => void;
  onAdd: () => void;
}

const OrganizationsList: React.FC<OrganizationsListProps> = ({ organizations, plans, t, onView, onEdit, onDelete, onAdd }) => {
  const getCandidateCount = (orgId: number) => {
    return plans.filter(p => p.orgId === orgId).length;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">إدارة المؤسسات</h2>
        <Button onClick={onAdd}>
          <PlusIcon />
          إضافة مؤسسة جديدة
        </Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-400">اسم المؤسسة</th>
                <th className="p-4 text-sm font-semibold text-gray-400">تاريخ الإنشاء</th>
                <th className="p-4 text-sm font-semibold text-gray-400">عدد المرشحين</th>
                <th className="p-4 text-sm font-semibold text-gray-400">الحالة</th>
                <th className="p-4 text-sm font-semibold text-gray-400">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map(org => (
                <tr key={org.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50">
                  <td className="p-4 whitespace-nowrap text-white font-medium">{org.name}</td>
                  <td className="p-4 whitespace-nowrap text-gray-400">
                    {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 whitespace-nowrap text-gray-300">{getCandidateCount(org.id)}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${org.status === 'active' ? 'bg-green-800 text-green-200' : 'bg-gray-700 text-gray-300'}`}>
                      {org.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap space-x-2 rtl:space-x-reverse">
                    <Button onClick={() => onView(org)} variant="secondary" size="sm">{t.view}</Button>
                    <Button onClick={() => onEdit(org)} variant="secondary" size="sm" className="!p-2"><PencilIcon /></Button>
                    <Button onClick={() => onDelete(org.id)} variant="secondary" size="sm" className="!p-2 hover:bg-red-800/50 hover:text-red-300"><TrashIcon /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {organizations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>لم يتم العثور على مؤسسات.</p>
              <p>اضغط على "إضافة مؤسسة جديدة" للبدء.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OrganizationsList;
