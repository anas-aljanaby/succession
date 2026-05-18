

import React, { useState } from 'react';
import type { Translations, UserRole } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Select } from './common/Select';

interface SetupReadinessScreenProps {
  t: Translations;
  onSubmit: (role: UserRole, readinessScores: any) => void;
}

const SetupReadinessScreen: React.FC<SetupReadinessScreenProps> = ({ t, onSubmit }) => {
  // Fix: Corrected the initial UserRole to a valid type 'CANDIDATE'.
  const [role, setRole] = useState<UserRole>('CANDIDATE');
  const [familiarity, setFamiliarity] = useState<string>('');
  const [hasPlan, setHasPlan] = useState<string>('');

  const roleOptions: { value: UserRole, label: string }[] = [
    // Fix: Corrected UserRole values to match the type definition.
    { value: 'CANDIDATE', label: t.userTypeLeader },
    { value: 'HR_MANAGER', label: t.userTypeHR },
    { value: 'ORGANIZATION_ADMIN', label: t.userTypeInstitution },
    { value: 'CONSULTANT', label: t.userTypeConsultant },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familiarity || !hasPlan) {
      alert('Please answer all questions.');
      return;
    }
    const readinessScores = { familiarity, hasPlan };
    onSubmit(role, readinessScores);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">{t.setupReadinessTitle}</h1>
            <p className="text-gray-400 mt-2">{t.setupReadinessSubtitle}</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selector */}
            <div>
              <label className="block text-lg font-medium text-gray-200 mb-2">{t.selectYourRole}</label>
              <Select
                options={roleOptions}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              />
            </div>

            {/* Readiness Questions */}
            <div className="space-y-6">
                {/* Question 1 */}
                <div>
                    <label className="block text-lg font-medium text-gray-200">{t.readinessQuestion1}</label>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                        {[
                            { value: 'Low', label: t.readinessAnswerLow },
                            { value: 'Medium', label: t.readinessAnswerMedium },
                            { value: 'High', label: t.readinessAnswerHigh },
                        ].map(item => (
                            <label key={item.value} className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="familiarity" value={item.value} checked={familiarity === item.value} onChange={(e) => setFamiliarity(e.target.value)} className="h-4 w-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500" />
                                <span className="text-gray-300">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Question 2 */}
                <div>
                    <label className="block text-lg font-medium text-gray-200">{t.readinessQuestion2}</label>
                     <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                        {[
                            { value: 'No', label: t.readinessAnswerNo },
                            { value: 'InProgress', label: t.readinessAnswerInProgress },
                            { value: 'Yes', label: t.readinessAnswerYes },
                        ].map(item => (
                            <label key={item.value} className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="hasPlan" value={item.value} checked={hasPlan === item.value} onChange={(e) => setHasPlan(e.target.value)} className="h-4 w-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500" />
                                <span className="text-gray-300">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            
            <Button type="submit" className="w-full" size="lg">
              {t.submitAndContinue}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SetupReadinessScreen;
