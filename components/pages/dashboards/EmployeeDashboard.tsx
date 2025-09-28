import React from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';
import { useNavigation } from '../../../contexts/NavigationContext';
import useUserProfile from '../../../hooks/useUserProfile';
import useSchoolProfile from '../../../hooks/useSchoolProfile';
import ImageSlider from '../../dashboard/ImageSlider';
import SchoolProfileCard from '../../dashboard/SchoolProfileCard';
import Calendar from '../../dashboard/Calendar';

const EmployeeDashboard: React.FC = () => {
    const { navigate } = useNavigation();
    const [userProfile] = useUserProfile();
    const [schoolProfile] = useSchoolProfile();

    const actions = [
        {
            label: 'Manage Students',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" /><path d="M12 14v6m-4-2h8" /><path d="M12 6a6 6 0 100 12A6 6 0 0012 6z" /></svg>,
            page: Page.StudentManager
        },
        {
            label: 'Manage Classes',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.14M12 14v10" /><path d="M6 16.5V12M18 16.5V12" /></svg>,
            page: Page.ClassManager
        },
    ];

    return (
        <PageWrapper page={Page.Dashboard}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 space-y-8">
                    <SchoolProfileCard />
                    <div className="neo-container rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {actions.map(action => (
                                <button
                                    key={action.label}
                                    onClick={() => navigate(action.page)}
                                    className="neo-button rounded-xl p-4 flex flex-col items-center justify-center space-y-2 text-center text-sm font-semibold hover:scale-105 transition-transform duration-200"
                                >
                                    {action.icon}
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-2 space-y-8">
                    <div className="neo-container rounded-xl p-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome, {userProfile.name}!</h2>
                        <p className="text-gray-600">Here are some quick actions to get you started.</p>
                    </div>
                    <ImageSlider duration={schoolProfile.sliderDuration || 5000} />
                    <Calendar />
                </div>
            </div>
        </PageWrapper>
    );
};

export default EmployeeDashboard;
