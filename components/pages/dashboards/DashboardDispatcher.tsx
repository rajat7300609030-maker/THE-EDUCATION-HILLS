
import React from 'react';
import useUserProfile from '../../../hooks/useUserProfile';

const AdminDashboard = React.lazy(() => import('./AdminDashboard'));
const EmployeeDashboard = React.lazy(() => import('./EmployeeDashboard'));
const StudentDashboard = React.lazy(() => import('./StudentDashboard'));

const DashboardDispatcher: React.FC = () => {
    const [userProfile] = useUserProfile();

    switch (userProfile.role) {
        case 'Admin':
            return <AdminDashboard />;
        case 'Employee':
            return <EmployeeDashboard />;
        case 'Student':
            return <StudentDashboard />;
        default:
            // Fallback to Admin dashboard for any unknown roles
            return <AdminDashboard />;
    }
};

export default DashboardDispatcher;
