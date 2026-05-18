import React from 'react';
import { Button } from '../common/Button';
import { Select } from '../common/Select';

const ConsultantFilters: React.FC = () => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg flex flex-wrap items-center gap-4">
        <p className="text-gray-400 text-sm">الفلاتر المتقدمة (سيتم تنفيذها لاحقاً)</p>
        <div className="w-full sm:w-auto min-w-[150px]">
            <Select options={[{value: 'active', label: 'نشطة'}]} placeholder="فلتر بحالة المؤسسة" disabled/>
        </div>
        <input type="date" disabled className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-500"/>
        <Button variant="secondary" disabled>حفظ الفلتر</Button>
    </div>
  );
};

export default ConsultantFilters;
