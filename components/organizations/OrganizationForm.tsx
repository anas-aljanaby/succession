import React, { useState, useEffect } from 'react';
import type { Organization, Translations } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface OrganizationFormProps {
  organization: Organization | null;
  t: Translations;
  onSave: (orgData: Omit<Organization, 'id'>) => void;
  onCancel: () => void;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({ organization, t, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        email: organization.contactInfo?.email || '',
        phone: organization.contactInfo?.phone || '',
        address: organization.contactInfo?.address || '',
        logo: organization.logo || '',
        status: organization.status || 'active',
      });
    }
  }, [organization]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert(t.alert_orgNameRequired);
      return;
    }
    const orgDataToSave: Omit<Organization, 'id'> = {
      ...organization!,
      name: formData.name,
      description: formData.description,
      contactInfo: {
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      },
      logo: formData.logo,
      status: formData.status,
    };
    onSave(orgDataToSave);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <Button onClick={onCancel} variant="secondary">
        <ArrowLeftIcon />
        {t.backToList}
      </Button>
      <h2 className="text-3xl font-bold text-white">
        {organization ? t.editOrg.replace('{name}', organization.name) : t.addNewOrg}
      </h2>
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{t.orgName}</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="input-style" />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">{t.status}</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className="input-style">
                  <option value="active">{t.active}</option>
                  <option value="inactive">{t.inactive}</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">{t.description}</label>
              <textarea name="description" id="description" rows={4} value={formData.description} onChange={handleChange} className="input-style"></textarea>
            </div>
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">{t.logoUrl}</label>
              <input type="url" name="logo" id="logo" value={formData.logo} onChange={handleChange} className="input-style" />
            </div>
            <fieldset className="border-t border-gray-700 pt-6">
              <legend className="text-lg font-semibold text-white mb-4">{t.contactInfo}</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">{t.email}</label>
                  <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="input-style" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">{t.phone}</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="input-style" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">{t.address}</label>
                  <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="input-style" />
                </div>
              </div>
            </fieldset>
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
              <Button type="button" variant="secondary" onClick={onCancel}>{t.cancel}</Button>
              <Button type="submit">{t.save}</Button>
            </div>
          </div>
        </Card>
      </form>
       <style>{`.input-style { display: block; width: 100%; background-color: #374151; border: 1px solid #4B5563; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: white; }`}</style>
    </div>
  );
};

export default OrganizationForm;
