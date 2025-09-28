import React from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page } from '../../types';
import { useNavigation } from '../../contexts/NavigationContext';

const StudentManagerPage: React.FC = () => {
  const { navigate } = useNavigation();

  const actions = [
    { page: Page.AddStudentForm, label: 'Add New Student', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> },
    { page: Page.AllStudents, label: 'All Students Details', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg> },
    { page: Page.IdCardGenerator, label: 'ID Card Generator', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg> },
    { page: Page.FamilyGroup, label: 'Family Groups', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zM5 8a4 4 0 118 0 4 4 0 01-8 0z" /></svg> },
    { page: Page.StudentForms, label: "Student's Forms", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  ];

  return (
    <PageWrapper page={Page.StudentManager}>
      <div className="space-y-4">
        {actions.map(action => (
          <button
            key={action.page}
            className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200"
            onClick={() => navigate(action.page)}
          >
            <div className="neo-container rounded-full p-2 mr-4">{action.icon}</div>
            {action.label}
          </button>
        ))}
      </div>
    </PageWrapper>
  );
};

export default StudentManagerPage;
