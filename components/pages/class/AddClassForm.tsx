import React, { useState, useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Class } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotification } from '../../../contexts/NavigationContext';
import FormField from '../../ui/FormField';
import { getInitialClasses } from '../../../utils/seedData';

const AddClassForm: React.FC = () => {
  const [classes, setClasses] = useLocalStorage<Class[]>('classes', getInitialClasses);
  const [className, setClassName] = useState('');
  const [classTeacher, setClassTeacher] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const { goBack } = useNavigation();
  const { addNotification } = useNotification();

  const newClassId = useMemo(() => {
    let maxIdNum = 0;
    classes.forEach(c => {
        if (c.id && c.id.startsWith('CL')) {
            const num = parseInt(c.id.substring(2));
            if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
        }
    });
    return 'CL' + String(maxIdNum + 1).padStart(3, '0');
  }, [classes]);

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      addNotification('Class Name is required.', 'danger');
      return;
    }
    setIsPreviewing(true);
  };
  
  const handleFinalSave = () => {
     const newClass: Class = {
      id: newClassId,
      name: className,
      teacher: classTeacher,
    };
    setClasses([...classes, newClass]);
    addNotification(`Class "${className}" added successfully.`, 'success');
    goBack();
  };

  if (isPreviewing) {
    return (
        <PageWrapper page={Page.AddClassForm}>
            <div className="neo-container rounded-xl p-6">
                <h3 className="text-xl font-bold border-b pb-3 mb-4">Confirm New Class Details</h3>
                <div className="space-y-3 text-base">
                    <p><strong className="font-semibold text-gray-600 w-32 inline-block">Class Name:</strong> {className}</p>
                    <p><strong className="font-semibold text-gray-600 w-32 inline-block">Class Teacher:</strong> {classTeacher || 'N/A'}</p>
                </div>
                <div className="flex items-center space-x-4 pt-6 mt-6 border-t">
                    <button type="button" onClick={handleFinalSave} className="neo-button-success flex-grow rounded-xl p-3 text-lg font-semibold">Confirm & Save</button>
                    <button type="button" onClick={() => setIsPreviewing(false)} className="neo-button flex-grow rounded-xl p-3 text-lg font-semibold">Go Back & Edit</button>
                </div>
            </div>
        </PageWrapper>
    );
  }

  return (
    <PageWrapper page={Page.AddClassForm}>
      <div className="neo-container rounded-xl p-6">
        <form onSubmit={handlePreviewSubmit} className="space-y-6">
          <FormField label="Class Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.14M12 14v10" /><path d="M6 16.5V12M18 16.5V12" /></svg>}>
            <input type="text" id="new-class-name" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g., Grade 10, Section A" className="neo-button w-full rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-0" required />
          </FormField>
          <FormField label="Class Teacher" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
            <input type="text" id="new-class-teacher" value={classTeacher} onChange={(e) => setClassTeacher(e.target.value)} placeholder="e.g., Mrs. Smith" className="neo-button w-full rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-0" />
          </FormField>
          <div className="flex items-center space-x-4 pt-4">
            <button type="submit" className="neo-button-primary flex-grow rounded-xl p-3 text-lg font-semibold">Preview Details</button>
            <button type="button" onClick={goBack} className="neo-button-danger flex-grow rounded-xl p-3 text-lg font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default AddClassForm;
