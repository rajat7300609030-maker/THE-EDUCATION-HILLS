import React, { useMemo } from 'react';
import { Page, Student, Class, InquiryRecord } from '../../types';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNotification } from '../../contexts/NavigationContext';
import { PAGE_DATA } from '../../constants/pageData';
import useUserProfile from '../../hooks/useUserProfile';
import useSchoolProfile from '../../hooks/useSchoolProfile';
import ProfilePhoto from '../ui/ProfilePhoto';
import SchoolLogo from '../ui/SchoolLogo';
import useLocalStorage from '../../hooks/useLocalStorage';
import useUsers from '../../hooks/useUsers';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

// Role-based link configurations
const adminSections = [
  {
    title: 'Main',
    links: [{ page: Page.Dashboard, label: 'Dashboard' }]
  },
  {
    title: 'Management',
    links: [
      { page: Page.StudentManager, label: 'Student details' },
      { page: Page.ClassManager, label: 'Class Manager' },
      { page: Page.EmployeeManager, label: 'Employee details' },
      { page: Page.FeesManager, label: 'Fees Manager' },
    ]
  },
  {
    title: 'System',
    links: [
      { page: Page.Notifications, label: 'Notifications' },
      { page: Page.RecycleBin, label: 'Recycle Bin' },
      { page: Page.Settings, label: 'Settings' },
    ]
  },
  {
    title: 'Support',
    links: [{ page: Page.Inquiry, label: 'Make an Inquiry' }]
  }
];

const employeeSections = [
  {
    title: 'Main',
    links: [{ page: Page.Dashboard, label: 'Dashboard' }]
  },
  {
    title: 'Management',
    links: [
      { page: Page.StudentManager, label: 'Student details' },
      { page: Page.ClassManager, label: 'Class Manager' },
    ]
  },
  {
    title: 'Tools',
    links: [
      { page: Page.Notifications, label: 'Notifications' },
      { page: Page.Inquiry, label: 'Make an Inquiry' }
    ]
  },
];

const studentSections = [
  {
    title: 'Main',
    links: [{ page: Page.Dashboard, label: 'Dashboard' }]
  },
  {
    title: 'Tools',
    links: [
      { page: Page.Notifications, label: 'Notifications' },
      { page: Page.Inquiry, label: 'Make an Inquiry' }
    ]
  },
];

// Function to get sidebar sections based on user role
const getSidebarSections = (role: string) => {
    switch(role) {
        case 'Admin':
            return adminSections;
        case 'Employee':
            return employeeSections;
        case 'Student':
            return studentSections;
        default:
            return studentSections; // Default to the most restrictive view
    }
};

// Flattened list for use in other components like the Header dropdown
export const getSidebarLinksForRole = (role: string) => {
    return getSidebarSections(role).flatMap(section => section.links);
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const { navigate, currentPage } = useNavigation();
  const [userProfile] = useUserProfile();
  const [schoolProfile] = useSchoolProfile();
  const { notifications } = useNotification();
  const [students] = useLocalStorage<Student[]>('students', []);
  const [classes] = useLocalStorage<Class[]>('classes', []);
  const [inquiries] = useLocalStorage<InquiryRecord[]>('inquiries', []);
  const [users] = useUsers();

  const sections = getSidebarSections(userProfile.role); // Get role-specific sections

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const deletedItemsCount = useMemo(() => {
    const deletedStudents = students.filter(s => s.isDeleted).length;
    const deletedClasses = classes.filter(c => c.isDeleted).length;
    const deletedInquiries = inquiries.filter(i => i.isDeleted).length;
    const deletedEmployees = users.filter(u => u.role === 'Employee' && u.isDeleted).length;
    const deletedPayments = students.reduce((count, student) => {
        return count + (student.paymentHistory?.filter(p => p.isDeleted).length || 0);
    }, 0);

    return deletedStudents + deletedClasses + deletedInquiries + deletedEmployees + deletedPayments;
  }, [students, classes, inquiries, users]);


  const handleNavigate = (page: Page) => {
    navigate(page);
    closeSidebar();
  };

  const getIsActive = (page: Page) => {
    if (currentPage.page === page) return true;
    if (page === Page.ClassManager && (currentPage.page.includes('class-') || currentPage.page.startsWith('settings-fee'))) return true;
    if (page === Page.StudentManager && currentPage.page.includes('student-')) return true;
    if (page === Page.EmployeeManager && currentPage.page.includes('employee-')) return true;
    if (page === Page.Settings && currentPage.page.startsWith('settings-')) return true;
    return false;
  }
  
  return (
    <div className={`slide-panel fixed top-0 left-0 h-full w-64 p-6 flex flex-col ${isOpen ? 'open' : ''}`}>
      <div className="flex flex-col items-center mb-4">
        <SchoolLogo 
            hasLogo={schoolProfile.hasLogo} 
            alt="School Logo" 
            className="neo-container rounded-full p-2 mb-1 w-12 h-12" 
            style={{ transform: `scale(${(schoolProfile.logoSize || 100) / 100})` }}
        />
        <h2 className="text-md font-bold text-center">{schoolProfile.name}</h2>
        <p className="text-xs text-center">{schoolProfile.motto}</p>
      </div>
      <nav className="flex-grow overflow-y-auto">
        {sections.map((section, index) => (
          <div key={section.title} className={index > 0 ? 'mt-4 pt-4 border-t border-gray-300 dark:border-gray-700' : ''}>
            <h3 className="px-4 mb-2 text-xs font-bold uppercase tracking-wider">{section.title}</h3>
            <div className="space-y-2">
              {section.links.map(({ page, label }) => (
                <a
                  key={page}
                  href="#"
                  onClick={(e) => {
                      e.preventDefault();
                      handleNavigate(page);
                  }}
                  className={`sidebar-link ${getIsActive(page) ? 'active' : ''}`}
                >
                  <div className="neo-container rounded-full p-2 w-10 h-10 flex items-center justify-center">
                    {PAGE_DATA[page].icon}
                  </div>
                  <span className="ml-4">{label}</span>
                   {page === Page.Notifications && unreadCount > 0 && (
                    <span className="ml-auto neo-button bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                   {page === Page.RecycleBin && deletedItemsCount > 0 && (
                    <span className="ml-auto neo-button bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {deletedItemsCount}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="neo-container rounded-2xl p-4 flex items-center mt-6">
        <ProfilePhoto
            userId={userProfile.userId}
            hasPhoto={userProfile.hasPhoto}
            alt="User Profile"
            className="rounded-full w-10 h-10 object-cover mr-3 neo-container"
        />
        <div>
          <h3 className="font-bold text-sm">{userProfile.name}</h3>
          <p className="text-xs">{userProfile.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;