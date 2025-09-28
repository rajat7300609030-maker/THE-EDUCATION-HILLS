import React from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';
import { useNavigation } from '../../../contexts/NavigationContext';
import useSchoolProfile from '../../../hooks/useSchoolProfile';
import RecentPaymentsCard from '../../ui/RecentPaymentsCard';
import ImageSlider from '../../dashboard/ImageSlider';
import SchoolProfileCard from '../../dashboard/SchoolProfileCard';
import Calendar from '../../dashboard/Calendar';

// --- Quick Actions Card ---
const QuickActionsCard: React.FC = () => {
    const { navigate } = useNavigation();

    const actions = [
        { label: 'Add Student', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>, page: Page.AddStudentForm },
        { label: 'All Students', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>, page: Page.AllStudents },
    ];

    return (
        <div className="neo-container rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
                {actions.map(action => (
                    <button key={action.label} onClick={() => navigate(action.page)} className="neo-button rounded-xl p-4 flex flex-col items-center justify-center space-y-2 text-center text-sm font-semibold hover:scale-105 transition-transform duration-200">
                        {action.icon}
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Fees Payment Card ---
const FeesPaymentCard: React.FC = () => {
    const { navigate } = useNavigation();

    return (
        <div className="neo-container rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
                <h3 className="text-lg font-bold">Fees Management</h3>
                <p className="text-sm">Quickly record a new fee payment for any student.</p>
            </div>
            <button onClick={() => navigate(Page.FeesPaymentPage)} className="neo-button-primary rounded-xl px-6 py-3 text-base font-semibold flex items-center space-x-2 flex-shrink-0">
                <span className="h-6 w-6 font-bold text-xl flex items-center justify-center">₹</span>
                <span>Record Payment</span>
            </button>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
  const [schoolProfile] = useSchoolProfile();

  return (
    <PageWrapper page={Page.Dashboard}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1 space-y-8">
                <SchoolProfileCard />
            </div>
            <div className="xl:col-span-2 space-y-8">
                <ImageSlider duration={schoolProfile.sliderDuration || 5000} />
                <QuickActionsCard />
                <FeesPaymentCard />
                <RecentPaymentsCard />
                <Calendar />
            </div>
        </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
