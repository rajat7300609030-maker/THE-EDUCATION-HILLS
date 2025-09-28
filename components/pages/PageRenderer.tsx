

import React, { useEffect, useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { Page } from '../../types';

// Dynamically import pages
const DashboardDispatcher = React.lazy(() => import('./dashboards/DashboardDispatcher'));
const ProfilePage = React.lazy(() => import('./ProfilePage'));
const StudentManagerPage = React.lazy(() => import('./StudentManagerPage'));
const ClassManagerPage = React.lazy(() => import('./ClassManagerPage'));
const EmployeeManagerPage = React.lazy(() => import('./EmployeeManagerPage'));
const FeesManagerPage = React.lazy(() => import('./FeesManagerPage'));
const FeesPaymentPage = React.lazy(() => import('./fees/FeesPaymentPage'));
const AllStudentsFeesPage = React.lazy(() => import('./fees/AllStudentsFeesPage'));
const AllStudentsFeesCardsPage = React.lazy(() => import('./fees/AllStudentsFeesCardsPage'));
const SendFeesRemindersPage = React.lazy(() => import('./fees/SendFeesRemindersPage'));
const LatePaymentStudentsPage = React.lazy(() => import('./fees/LatePaymentStudentsPage'));
const RecycleBinPage = React.lazy(() => import('./RecycleBinPage'));
const NotificationsPage = React.lazy(() => import('./NotificationsPage'));
const SettingsPage = React.lazy(() => import('./SettingsPage'));
const InquiryPage = React.lazy(() => import('./InquiryPage'));
const AddClassForm = React.lazy(() => import('./class/AddClassForm'));
const AllClassesPage = React.lazy(() => import('./class/AllClassesPage'));
const ViewClassPage = React.lazy(() => import('./class/ViewClassPage'));
const EditClassForm = React.lazy(() => import('./class/EditClassForm'));
const ManageSubjectsPage = React.lazy(() => import('./class/ManageSubjectsPage'));
const ClassTimetablePage = React.lazy(() => import('./class/ClassTimetablePage'));
const AssignmentsPage = React.lazy(() => import('./class/AssignmentsPage'));
const ExamsResultsPage = React.lazy(() => import('./class/ExamsResultsPage'));
const AddEmployeeForm = React.lazy(() => import('./employee/AddEmployeeForm'));
const AllEmployeesPage = React.lazy(() => import('./employee/AllEmployeesPage'));
const EditEmployeeForm = React.lazy(() => import('./employee/EditEmployeeForm'));
const EmployeeIdCardGeneratorPage = React.lazy(() => import('./employee/EmployeeIdCardGeneratorPage'));
const AddStudentForm = React.lazy(() => import('./student/AddStudentForm'));
const AllStudentsPage = React.lazy(() => import('./student/AllStudentsPage'));
const ViewStudentPage = React.lazy(() => import('./student/ViewStudentPage'));
// Fix: Added lazy import for EditStudentForm.
const EditStudentForm = React.lazy(() => import('./student/EditStudentForm'));
const IdCardGeneratorPage = React.lazy(() => import('./student/IdCardGeneratorPage'));
const FamilyGroupPage = React.lazy(() => import('./student/FamilyGroupPage'));
const FamilyGroupCardsPage = React.lazy(() => import('./student/FamilyGroupCardsPage'));
const StudentFormsPage = React.lazy(() => import('./student/StudentFormsPage'));
const StudentFormGeneratorPage = React.lazy(() => import('./student/StudentFormGeneratorPage'));
// Settings Sub-Pages
const SchoolProfilePage = React.lazy(() => import('./settings/SchoolProfilePage'));
const AppearancePage = React.lazy(() => import('./settings/AppearancePage'));
const SchoolGalleryPage = React.lazy(() => import('./settings/SchoolGalleryPage'));
const UserManagementPage = React.lazy(() => import('./settings/UserManagementPage'));
const ChangeCredentialsPage = React.lazy(() => import('./settings/ChangeCredentialsPage'));
const FeeStructurePage = React.lazy(() => import('./settings/FeeStructurePage'));
const IntegrationsPage = React.lazy(() => import('./settings/IntegrationsPage'));

// Fix: Use React.ComponentType which is a broader type for components
const pageMap: { [key in Page]: React.LazyExoticComponent<React.ComponentType<any>> } = {
    [Page.Dashboard]: DashboardDispatcher,
    [Page.Profile]: ProfilePage,
    [Page.StudentManager]: StudentManagerPage,
    [Page.ClassManager]: ClassManagerPage,
    [Page.EmployeeManager]: EmployeeManagerPage,
    [Page.FeesManager]: FeesManagerPage,
    [Page.FeesPaymentPage]: FeesPaymentPage,
    [Page.AllStudentsFeesPage]: AllStudentsFeesPage,
    [Page.AllStudentsFeesCardsPage]: AllStudentsFeesCardsPage,
    [Page.SendFeesReminders]: SendFeesRemindersPage,
    [Page.LatePaymentStudentsPage]: LatePaymentStudentsPage,
    [Page.RecycleBin]: RecycleBinPage,
    [Page.Notifications]: NotificationsPage,
    [Page.Settings]: SettingsPage,
    [Page.Inquiry]: InquiryPage,
    [Page.AddClassForm]: AddClassForm,
    [Page.AllClasses]: AllClassesPage,
    [Page.ViewClass]: ViewClassPage,
    [Page.EditClass]: EditClassForm,
    [Page.ManageSubjects]: ManageSubjectsPage,
    [Page.ClassTimetable]: ClassTimetablePage,
    [Page.Assignments]: AssignmentsPage,
    [Page.ExamsResults]: ExamsResultsPage,
    [Page.AddEmployeeForm]: AddEmployeeForm,
    [Page.AllEmployees]: AllEmployeesPage,
    [Page.EditEmployee]: EditEmployeeForm,
    [Page.EmployeeIdCardGenerator]: EmployeeIdCardGeneratorPage,
    [Page.AddStudentForm]: AddStudentForm,
    [Page.AllStudents]: AllStudentsPage,
    [Page.ViewStudent]: ViewStudentPage,
    // Fix: Added EditStudent to the page map.
    [Page.EditStudent]: EditStudentForm,
    [Page.IdCardGenerator]: IdCardGeneratorPage,
    [Page.FamilyGroup]: FamilyGroupPage,
    [Page.FamilyGroupCards]: FamilyGroupCardsPage,
    [Page.StudentForms]: StudentFormsPage,
    [Page.StudentFormGenerator]: StudentFormGeneratorPage,
    // Settings Sub-Pages
    [Page.SchoolProfile]: SchoolProfilePage,
    [Page.Appearance]: AppearancePage,
    [Page.SchoolGallery]: SchoolGalleryPage,
    [Page.UserManagement]: UserManagementPage,
    [Page.ChangeCredentials]: ChangeCredentialsPage,
    [Page.FeeStructure]: FeeStructurePage,
    [Page.Integrations]: IntegrationsPage,
};

const PageRenderer: React.FC = () => {
    const { currentPage } = useNavigation();
    const [isAnimating, setIsAnimating] = useState(false);
    const [renderPage, setRenderPage] = useState(currentPage.page);

    useEffect(() => {
        if (currentPage.page !== renderPage) {
            setIsAnimating(true);
            const timeout = setTimeout(() => {
                setRenderPage(currentPage.page);
                setIsAnimating(false);
            }, 300); // match transition duration
            return () => clearTimeout(timeout);
        }
    }, [currentPage.page, renderPage]);

    const PageComponent = pageMap[renderPage];
    
    if (!PageComponent) {
        return <div>Page not found</div>;
    }

    const animationClass = isAnimating ? 'page-transition-exit-active' : 'page-transition-enter-active';

    return (
        <React.Suspense fallback={<div className="text-center p-8">Loading page...</div>}>
            <div className={animationClass}>
                <PageComponent />
            </div>
        </React.Suspense>
    );
};

export default PageRenderer;