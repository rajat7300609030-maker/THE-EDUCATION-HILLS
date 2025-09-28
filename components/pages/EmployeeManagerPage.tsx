import React from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page } from '../../types';
import { useNavigation } from '../../contexts/NavigationContext';

const EmployeeManagerPage: React.FC = () => {
  const { navigate } = useNavigation();
  return (
    <PageWrapper page={Page.EmployeeManager}>
      <div className="space-y-4">
        <button className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200" onClick={() => navigate(Page.AddEmployeeForm)}>
          <div className="neo-container rounded-full p-2 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          Add New Employee
        </button>
        <button className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200" onClick={() => navigate(Page.AllEmployees)}>
          <div className="neo-container rounded-full p-2 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          All Employees Details
        </button>
        <button
          className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200"
          onClick={() => navigate(Page.EmployeeIdCardGenerator)}
          aria-label="Generate Employee ID Card"
        >
          <div className="neo-container rounded-full p-2 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
            </svg>
          </div>
          Employee ID Cards
        </button>
      </div>
    </PageWrapper>
  );
};

export default EmployeeManagerPage;