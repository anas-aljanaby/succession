import React, { useState, useEffect } from 'react';
import type { Candidate, Translations } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface CandidateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: Omit<Candidate, 'id'>) => void;
  editingCandidate: Candidate | null;
  t: Translations;
}

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  currentPosition: '',
  targetPosition: '',
  department: '',
  profileImage: '',
};

export const CandidateForm: React.FC<CandidateFormProps> = ({ isOpen, onClose, onSave, editingCandidate, t }) => {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editingCandidate) {
      setFormData({
        name: editingCandidate.name,
        email: editingCandidate.email,
        phone: editingCandidate.phone,
        currentPosition: editingCandidate.currentPosition,
        targetPosition: editingCandidate.targetPosition,
        department: editingCandidate.department,
        profileImage: editingCandidate.profileImage || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingCandidate, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetPosition) {
      alert(t.alert_nameAndTargetRequired);
      return;
    }
    const candidateData: Omit<Candidate, 'id'> = {
      ...formData,
      organizationId: 1,
      startDate: new Date().toISOString(),
      journeyProgress: 0,
      status: 'active',
      lastActivityDate: new Date().toISOString(),
    };
    onSave(candidateData);
  };

  const title = editingCandidate ? t.editCandidateData : t.addNewCandidate;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={t.fullName} name="name" value={formData.name} onChange={handleChange} required />
            <InputField label={t.email} name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={t.phone} name="phone" value={formData.phone} onChange={handleChange} />
            <InputField label={t.department} name="department" value={formData.department} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={t.currentPosition} name="currentPosition" value={formData.currentPosition} onChange={handleChange} />
            <InputField label={t.targetPosition} name="targetPosition" value={formData.targetPosition} onChange={handleChange} required />
        </div>
        <InputField label={t.profilePictureUrl} name="profileImage" value={formData.profileImage} onChange={handleChange} />

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>{t.cancel}</Button>
          <Button type="submit">{t.save}</Button>
        </div>
      </form>
    </Modal>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            {...props}
            id={props.name}
            className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
    </div>
);
