import React, { useState, useEffect } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Class, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
import FormField from '../../ui/FormField';
import { getInitialClasses, getInitialStudents } from '../../../utils/seedData';

const EditClassForm: React.FC = () => {
  const { currentPage, goBack } = useNavigation();
  const [classes, setClasses] = useLocalStorage<Class[]>('classes', getInitialClasses);
  const [students, setStudents] = useLocalStorage<Student[]>('students', getInitialStudents);
  const [className, setClassName] = useState('');
  const [classTeacher, setClassTeacher] = useState('');
  const [originalClassName, setOriginalClassName] = useState('');

  // Fix: Changed currentPage.dataId to currentPage.data to match NavigationState interface
  const classId = currentPage.data as string;
  const classToEdit = classes.find(c => c.id === classId);

  useEffect(() => {
    if (classToEdit) {
      setClassName(classToEdit.name);
      setOriginalClassName(classToEdit.name);
      setClassTeacher(classToEdit.teacher);
    }
  }, [classToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update student records if class name has changed
    if (originalClassName && originalClassName !== className) {
        const updatedStudents = students.map(student => {
            if (student.class === originalClassName) {
                return { ...student, class: className };
            }
            return student;
        });
        setStudents(updatedStudents);
    }
    
    // Update the class itself
    const updatedClasses = classes.map(cls =>
      cls.id === classId
        ? { ...cls, name: className, teacher: classTeacher }
        : cls
    );
    setClasses(updatedClasses);
    
    alert('Class updated successfully!');
    goBack();
  };
  
  if (!classToEdit) {
     return <PageWrapper page={Page.EditClass}><p>Class not found.</p></PageWrapper>
  }

  return (
    <PageWrapper page={Page.EditClass}>
      <div className="neo-container rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Class Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.14M12 14v10" /><path d="M6 16.5V12M18 16.5V12" /></svg>}>
            <input type="text" id="edit-class-name" value={className} onChange={(e) => setClassName(e.target.value)} className="neo-button w-full rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-0" required />
          </FormField>
          <FormField label="Class Teacher" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
            <input type="text" id="edit-class-teacher" value={classTeacher} onChange={(e) => setClassTeacher(e.target.value)} className="neo-button w-full rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-0" />
          </FormField>
          <div className="flex items-center space-x-4 pt-4">
            <button type="submit" className="neo-button-primary flex-grow rounded-xl p-3 text-lg font-semibold">Update Class</button>
            <button type="button" onClick={goBack} className="neo-button-danger flex-grow rounded-xl p-3 text-lg font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default EditClassForm;