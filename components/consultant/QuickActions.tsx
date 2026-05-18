import React, { useState } from 'react';
import { Button } from '../common/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

const QuickActions: React.FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="secondary">
        <PlusIcon />
        إضافة مؤسسة
      </Button>
      <div className="relative inline-block text-left rtl:text-right">
        <div>
          <Button variant="secondary" onClick={() => setIsExportOpen(!isExportOpen)}>
            تصدير تقرير شامل
            <ChevronDownIcon className="-me-1 ms-2 h-5 w-5" />
          </Button>
        </div>
        {isExportOpen && (
          <div
            className="origin-top-right absolute right-0 rtl:origin-top-left rtl:left-0 rtl:right-auto mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="py-1" role="none">
              <a href="#" className="text-gray-200 block px-4 py-2 text-sm hover:bg-gray-600" role="menuitem">PDF: تقرير شامل</a>
              <a href="#" className="text-gray-200 block px-4 py-2 text-sm hover:bg-gray-600" role="menuitem">Excel: جداول البيانات</a>
              <a href="#" className="text-gray-200 block px-4 py-2 text-sm hover:bg-gray-600" role="menuitem">CSV: البيانات الخام</a>
            </div>
          </div>
        )}
      </div>
       <Button variant="secondary">جدولة اجتماع</Button>
       <Button variant="secondary">إرسال تحديث جماعي</Button>
    </div>
  );
};

export default QuickActions;