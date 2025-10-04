// Fix: Replaced the entire file content with proper type definitions to resolve circular dependencies and export necessary types.
export interface Class {
  id: string;
  name: string;
  teacher: string;
  isDeleted?: boolean;
}

export interface PaymentRecord {
  amount: number;
  date: string;
  receiptNumber: string;
  feesType: string;
  instrument: string;
  instrumentDetails?: string;
  isDeleted?: boolean;
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  class: string;
  dob: string;
  gender: string;
  religion?: string;
  category?: string;
  cast?: string;
  type: string;
  totalFees: number;
  feesPaid: number;
  paymentHistory: PaymentRecord[];
  transportNeeded: boolean;
  transportDetails: string;
  contactNumber: string;
  hasPhoto: boolean;
  isDeleted?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info';
  timestamp: number;
  isRead: boolean;
}

export interface InquiryRecord {
  id: string;
  role: 'Admin' | 'Employee' | 'Student';
  name: string;
  contact: string;
  email?: string;
  employeeId?: string;
  admissionClass?: string;
  message: string;
  timestamp: number;
  isDeleted?: boolean;
}

export interface SchoolProfile {
    name: string;
    motto: string;
    session: string;
    hasLogo: boolean;
    schoolNumber?: string;
    schoolId?: string;
    schoolAddress?: string;
    hasBackgroundImage?: boolean;
    backgroundImageEffect?: string;
    backgroundImageEffectIntensity?: number;
    backgroundImageBlur?: number;
    profileCardStyle?: string;
    sliderDuration?: number;
    logoSize?: number;
    isSliderEnabled?: boolean;
    sliderTransitionEffect?: 'fade' | 'slide';
}

export interface FeeStructure {
    [className: string]: number;
}

export enum Page {
    Dashboard = 'dashboard',
    Profile = 'profile',
    StudentManager = 'student-manager',
    ClassManager = 'class-manager',
    EmployeeManager = 'employee-manager',
    FeesManager = 'fees-manager',
    FeesPaymentPage = 'fees-payment-page',
    AllStudentsFeesPage = 'all-students-fees-page',
    AllStudentsFeesCardsPage = 'all-students-fees-cards-page',
    SendFeesReminders = 'send-fees-reminders',
    LatePaymentStudentsPage = 'late-payment-students',
    RecycleBin = 'recycle-bin',
    Notifications = 'notifications',
    Settings = 'settings',
    Inquiry = 'inquiry',
    AddClassForm = 'add-class-form',
    AllClasses = 'all-classes',
    ViewClass = 'view-class',
    EditClass = 'edit-class',
    ManageSubjects = 'manage-subjects',
    ClassTimetable = 'class-timetable',
    Assignments = 'assignments',
    ExamsResults = 'exams-results',
    AddEmployeeForm = 'add-employee-form',
    AllEmployees = 'all-employees',
    EditEmployee = 'edit-employee',
    EmployeeIdCardGenerator = 'employee-id-card-generator',
    AddStudentForm = 'add-student-form',
    AllStudents = 'all-students',
    ViewStudent = 'view-student',
    // Fix: Added 'EditStudent' to the Page enum.
    EditStudent = 'edit-student',
    IdCardGenerator = 'id-card-generator',
    FamilyGroup = 'family-group',
    FamilyGroupCards = 'family-group-cards',
    StudentForms = 'student-forms',
    StudentFormGenerator = 'student-form-generator',
    // Settings Sub-Pages
    SchoolProfile = 'settings-school-profile',
    Appearance = 'settings-appearance',
    SchoolGallery = 'settings-school-gallery',
    UserManagement = 'settings-user-management',
    ChangeCredentials = 'settings-change-credentials',
    FeeStructure = 'settings-fee-structure',
    Integrations = 'settings-integrations',
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  hasPhoto: boolean;
  dob: string;
  address: string;
  password?: string;
  isDeleted?: boolean;
  isGoogleAccount?: boolean;
  notificationSettings: {
    email: boolean;
    sms: boolean;
    feeReminders: boolean;
    assignmentUpdates: boolean;
    examAlerts: boolean;
    generalAnnouncements: boolean;
    attendanceAlerts: boolean;
  };
}