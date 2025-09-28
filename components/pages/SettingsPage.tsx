import React, { useRef, useState } from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page } from '../../types';
import { useNavigation } from '../../contexts/NavigationContext';
import { exportToCsv, printReport, downloadBackup, restoreBackup, downloadPdfReport } from '../../utils/dataManager';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../contexts/NavigationContext';
import useUserProfile from '../../hooks/useUserProfile';
import ConfirmationModal from '../ui/ConfirmationModal';
import { PAGE_DATA } from '../../constants/pageData';

const SettingsPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { addNotification } = useNotification();
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // State for the clear data confirmation modal
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [userProfile] = useUserProfile();

  const handleInitiateClearData = async () => {
    // 1. Automatically trigger backup download first.
    await downloadBackup();
    addNotification('A data backup has been automatically downloaded for safety.', 'info');
    
    // 2. Open the confirmation modal.
    setPasswordInput('');
    setPasswordError('');
    setIsClearDataModalOpen(true);
  };

  const handleConfirmClearData = () => {
    // For this demo, we'll check against the password from the user profile.
    const correctPassword = userProfile.password || 'password';

    if (passwordInput === correctPassword) {
        const keysToRemove = ['students', 'classes', 'userProfile', 'schoolProfile', 'feeStructure', 'inquiries', 'notifications', 'theme'];
        keysToRemove.forEach(key => localStorage.removeItem(key));

        indexedDB.deleteDatabase('LMS_DB');

        addNotification('All application data has been cleared.', 'danger');
        setIsClearDataModalOpen(false);
        setTimeout(() => window.location.reload(), 1000);
    } else {
        setPasswordError('Incorrect password. Data has not been cleared.');
        setPasswordInput('');
    }
  };


  const handleRestoreClick = () => {
    restoreInputRef.current?.click();
  };

  const handleFileRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await restoreBackup(file);
      addNotification('Data restored successfully! The application will now reload.', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      addNotification(`Error restoring data: ${(error as Error).message}`, 'danger');
    } finally {
      // Reset file input value to allow re-uploading the same file
      if (restoreInputRef.current) {
        restoreInputRef.current.value = '';
      }
    }
  };

  return (
    <PageWrapper page={Page.Settings}>
      <div className="space-y-8">
        
        <div className="neo-container rounded-xl p-6">
          <h3 className="text-xl font-bold border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">General</h3>
          <div className="space-y-4">
             <SettingsButton icon={PAGE_DATA[Page.SchoolProfile].icon} label="School Profile" onClick={() => navigate(Page.SchoolProfile)} />
             <SettingsButton icon={PAGE_DATA[Page.Appearance].icon} label="Themes & Appearance" onClick={() => navigate(Page.Appearance)} />
             <SettingsButton icon={PAGE_DATA[Page.SchoolGallery].icon} label="School Images Gallery" onClick={() => navigate(Page.SchoolGallery)} />
             <SettingsButton icon={PAGE_DATA[Page.ChangeCredentials].icon} label="Change User ID & Password" onClick={() => navigate(Page.ChangeCredentials)} />
          </div>
        </div>
        
        <div className="neo-container rounded-xl p-6">
          <h3 className="text-xl font-bold border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">Administration</h3>
          <div className="space-y-4">
             <SettingsButton icon={PAGE_DATA[Page.UserManagement].icon} label="User Management" onClick={() => navigate(Page.UserManagement)} />
             <SettingsButton icon={PAGE_DATA[Page.FeeStructure].icon} label="Fee Structure" onClick={() => navigate(Page.FeeStructure)} />
             <SettingsButton icon={PAGE_DATA[Page.Integrations].icon} label="Integrations" onClick={() => navigate(Page.Integrations)} />
          </div>
        </div>

        <div className="neo-container rounded-xl p-6">
          <h3 className="text-xl font-bold border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">Data Management</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DataButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 2v-2m-6 4H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-2" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12l-3 3-3-3" /></svg>} label="Export Students (CSV)" onClick={() => exportToCsv('students')} />
            <DataButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 2v-2m-6 4H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-2" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12l-3 3-3-3" /></svg>} label="Export Classes (CSV)" onClick={() => exportToCsv('classes')} />
            <DataButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>} label="Print Full Report (PDF)" onClick={printReport} />
            <DataButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>} label="Download in PDF" onClick={downloadPdfReport} />
            <DataButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>} label="Download JSON Backup" onClick={downloadBackup} />
            <DataButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>} label="Restore from Backup" onClick={handleRestoreClick} />
          </div>
          <input type="file" ref={restoreInputRef} onChange={handleFileRestore} accept=".json" className="hidden" />
          <div className="border-t border-gray-300 dark:border-gray-700 pt-6 mt-6">
              <h4 className="font-semibold text-red-600">Reset Application</h4>
              <p className="text-sm mt-1 mb-3">
                Permanently delete all data. This will log you out and reset the application to its initial state. A backup will be automatically downloaded before deletion.
              </p>
              <button onClick={handleInitiateClearData} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 active:text-red-700 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>Clear All Application Data</span>
              </button>
          </div>
        </div>

      </div>

      <ConfirmationModal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onConfirm={handleConfirmClearData}
        title="Confirm Data Deletion"
        message="This will permanently delete all data. To confirm this action, please enter your password."
        confirmText="Confirm & Delete"
        variant="danger"
      >
        <div className="mt-4">
          <label htmlFor="password-confirm" className="text-sm font-medium text-gray-700 block mb-2">Password</label>
          <input
              id="password-confirm"
              type="password"
              value={passwordInput}
              onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
              }}
              className="neo-button w-full rounded-xl p-3 text-gray-700"
              autoFocus
          />
          {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
        </div>
      </ConfirmationModal>
    </PageWrapper>
  );
};

const SettingsButton: React.FC<{ icon: JSX.Element; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold hover:scale-105 transition-transform duration-200">
    <div className="neo-container rounded-full p-2 mr-4">{icon}</div>
    {label}
  </button>
);

const DataButton: React.FC<{ icon: JSX.Element; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="neo-button w-full flex flex-col items-center p-4 rounded-xl text-sm font-semibold hover:scale-105 transition-transform duration-200 text-center">
    <div className="neo-container rounded-full p-2 mb-2">{icon}</div>
    {label}
  </button>
);

export default SettingsPage;