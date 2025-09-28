import React from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page } from '../../types';
import { useNavigation } from '../../contexts/NavigationContext';

const ClassManagerPage: React.FC = () => {
  const { navigate } = useNavigation();
  return (
    <PageWrapper page={Page.ClassManager}>
      <div className="space-y-4">
        <button className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200" onClick={() => navigate(Page.AddClassForm)}>
          <div className="neo-container rounded-full p-2 mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></div>
          Add New Class
        </button>
        <button className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200" onClick={() => navigate(Page.AllClasses)}>
          <div className="neo-container rounded-full p-2 mr-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></div>
          All Classes Details
        </button>
      </div>
    </PageWrapper>
  );
};

export default ClassManagerPage;