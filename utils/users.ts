import { UserProfile } from '../types';

export const getInitialUsers = (): UserProfile[] => [
    {
        userId: 'admin',
        name: 'Admin User',
        email: 'admin@school.com',
        phone: '111-222-3333',
        role: 'Admin',
        hasPhoto: false,
        password: 'password',
        dob: '1980-01-01',
        address: '123 Admin Lane',
        notificationSettings: {
            email: true,
            sms: true,
            feeReminders: true,
            assignmentUpdates: true,
            examAlerts: true,
            generalAnnouncements: true,
            attendanceAlerts: true,
        },
    },
    {
        userId: 'emp001',
        name: 'Teacher Sarah',
        email: 'sarah.t@school.com',
        phone: '222-333-4444',
        role: 'Employee',
        hasPhoto: false,
        password: 'password',
        dob: '1990-05-10',
        address: '456 Teacher Ave',
        notificationSettings: {
            email: true,
            sms: false,
            feeReminders: false,
            assignmentUpdates: true,
            examAlerts: true,
            generalAnnouncements: true,
            attendanceAlerts: true,
        },
    },
    {
        // This user should match an existing student for consistency
        userId: 'ST001',
        name: 'Liam Johnson', // From seedData
        email: 'liam.j@school.com',
        phone: '9876543210', // From seedData
        role: 'Student',
        hasPhoto: false,
        password: 'password',
        dob: '2009-05-15', // From seedData
        address: '789 Student St',
        notificationSettings: {
            email: false,
            sms: true,
            feeReminders: true,
            assignmentUpdates: true,
            examAlerts: true,
            generalAnnouncements: true,
            attendanceAlerts: true,
        },
    },
];