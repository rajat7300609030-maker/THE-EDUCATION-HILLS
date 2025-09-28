import React from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page } from '../../types';
import { useNavigation } from '../../contexts/NavigationContext';
import RecentPaymentsCard from '../ui/RecentPaymentsCard';

const FeesManagerPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <PageWrapper page={Page.FeesManager}>
      <div className="space-y-8">
        <div className="space-y-4">
          {/* Fees Payment Button */}
          <button 
            className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200" 
            onClick={() => navigate(Page.FeesPaymentPage)}
            aria-label="Fees Payment"
          >
            <div className="neo-container rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            Fees Payment
          </button>

          {/* All Students Fees Details Button */}
          <button 
            className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200" 
            onClick={() => navigate(Page.AllStudentsFeesPage)}
            aria-label="All Students Fees Details"
          >
            <div className="neo-container rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            All Students Fees Details
          </button>

          {/* Fees Card Button */}
          <button
              className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200"
              onClick={() => navigate(Page.AllStudentsFeesCardsPage)}
              aria-label="Student Fees Cards"
          >
              <div className="neo-container rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01" />
                  </svg>
              </div>
              Fees Card
          </button>

          {/* Send Fees Reminders Button */}
          <button
            className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200"
            onClick={() => navigate(Page.SendFeesReminders)}
            aria-label="Send Fees Reminders"
          >
            <div className="neo-container rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            Send Fees Reminders
          </button>

          {/* Late Payment Students Button */}
          <button
            className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold text-gray-700 hover:scale-105 transition-transform duration-200"
            onClick={() => navigate(Page.LatePaymentStudentsPage)}
            aria-label="Late Payment Students"
          >
            <div className="neo-container rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Late Payment Students
          </button>
        </div>
        
        <RecentPaymentsCard />

      </div>
    </PageWrapper>
  );
};

export default FeesManagerPage;