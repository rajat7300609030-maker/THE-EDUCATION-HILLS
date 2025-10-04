import React, { useRef, useState } from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page, UserProfile } from '../../types';
import { useNavigation } from '../../contexts/NavigationContext';
import { exportToCsv, printReport, downloadBackup, restoreBackup, downloadPdfReport } from '../../utils/dataManager';
import { useNotification } from '../../contexts/NavigationContext';
import useUserProfile from '../../hooks/useUserProfile';
import ConfirmationModal from '../ui/ConfirmationModal';
import { PAGE_DATA } from '../../constants/pageData';
import ProfilePhoto from '../ui/ProfilePhoto';
import GoogleAccountChooserModal from '../ui/GoogleAccountChooserModal';
import useUsers from '../../hooks/useUsers';
import useSessions from '../../hooks/useSessions';
import useSchoolProfile from '../../hooks/useSchoolProfile';

const SettingsPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { addNotification } = useNotification();
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [userProfile, setUserProfile] = useUserProfile();
  const [, setUsers] = useUsers();

  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  const [sessions, setSessions] = useSessions();
  const [schoolProfile, setSchoolProfile] = useSchoolProfile();
  const [newSession, setNewSession] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [sessionToChange, setSessionToChange] = useState<string | null>(null);

  const handleInitiateClearData = async () => {
    await downloadBackup();
    addNotification('A data backup has been automatically downloaded for safety.', 'info');
    setPasswordInput('');
    setPasswordError('');
    setIsClearDataModalOpen(true);
  };

  const handleConfirmClearData = () => {
    const correctPassword = userProfile.password || 'password';
    if (passwordInput === correctPassword) {
        const keysToRemove = ['students', 'classes', 'userProfile', 'schoolProfile', 'feeStructure', 'inquiries', 'notifications', 'theme', 'isLoggedIn', 'sessionsList'];
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
      if (restoreInputRef.current) restoreInputRef.current.value = '';
    }
  };

  const handleDisconnect = () => {
    const updatedUser = { ...userProfile, isGoogleAccount: false };
    setUserProfile(updatedUser);
    setUsers(prev => prev.map(u => u.userId === userProfile.userId ? updatedUser : u));
    addNotification('Google Account has been disconnected.', 'info');
    setIsDisconnectModalOpen(false);
  };
  
  const handleLinkAccount = (googleUser: { name: string; email: string; }) => {
      const updatedUser = { ...userProfile, email: googleUser.email, isGoogleAccount: true };
      setUserProfile(updatedUser);
      setUsers(prev => prev.map(u => u.userId === userProfile.userId ? updatedUser : u));
      addNotification(`Google Account (${googleUser.email}) has been linked.`, 'success');
      setIsLinkModalOpen(false);
  };
  
  const handleSessionChangeRequest = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSessionValue = e.target.value;
    if (newSessionValue !== schoolProfile.session) {
      setSessionToChange(newSessionValue);
    }
  };

  const confirmSessionChange = () => {
    if (sessionToChange) {
      setSchoolProfile(prev => ({ ...prev, session: sessionToChange }));
      addNotification(`Session changed to ${sessionToChange}. The app will now reload.`, 'success');
      setSessionToChange(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleAddSession = () => {
    const sessionRegex = /^\d{4}-\d{4}$/;
    if (!newSession.trim() || !sessionRegex.test(newSession.trim())) {
      addNotification('Please enter a valid session format (e.g., 2025-2026).', 'danger');
      return;
    }
    if (sessions.includes(newSession.trim())) {
      addNotification('This session already exists.', 'danger');
      return;
    }
    setSessions(prev => [...prev, newSession.trim()].sort());
    setNewSession('');
    addNotification('New session added.', 'success');
  };
  
  const handleDeleteSession = () => {
    if (sessionToDelete) {
        setSessions(prev => prev.filter(s => s !== sessionToDelete));
        addNotification(`Session "${sessionToDelete}" deleted.`, 'info');
        setSessionToDelete(null);
    }
  };

  const handleDataSync = (dataType: 'Student' | 'Fee') => {
    addNotification(`Syncing ${dataType.toLowerCase()} data to Google Sheets...`, 'info');

    // Simulate API call and sheet generation
    setTimeout(() => {
        // In a real app, these URLs would be dynamically generated by a backend.
        // For this demo, we'll use placeholder URLs that mimic a Google Sheet template.
        const mockSheetUrl = dataType === 'Student' 
            ? 'https://docs.google.com/spreadsheets/d/1B_6a-E1vL-r4v_m_o_p_q_r_s_t_u_v_w_x/template/preview'
            : 'https://docs.google.com/spreadsheets/d/1C_8d-F2wM-s5x_y_z_a_b_c_d_e_f_g/template/preview';
        
        window.open(mockSheetUrl, '_blank', 'noopener,noreferrer');
        addNotification(`${dataType} data synced. Opening Google Sheet.`, 'success');
    }, 1500); // 1.5 second delay for realism
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
            <h3 className="text-xl font-bold border-b pb-3 mb-4">Session Management</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="active-session" className="font-semibold block mb-2">Set Active Session</label>
                    <select id="active-session" value={schoolProfile.session} onChange={handleSessionChangeRequest} className="neo-button w-full p-3 rounded-lg">
                        {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="new-session" className="font-semibold block mb-2">Add New Session</label>
                    <div className="flex space-x-2">
                        <input
                            id="new-session"
                            type="text"
                            value={newSession}
                            onChange={e => setNewSession(e.target.value)}
                            placeholder="e.g., 2027-2028"
                            className="neo-button flex-grow p-3 rounded-lg"
                        />
                        <button onClick={handleAddSession} className="neo-button-primary rounded-lg px-4 font-semibold">Add</button>
                    </div>
                </div>
                <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Existing Sessions</h4>
                    <div className="space-y-2">
                        {sessions.map(s => (
                            <div key={s} className="flex items-center justify-between neo-button p-2 rounded-md">
                                <span>{s}</span>
                                <button
                                    onClick={() => setSessionToDelete(s)}
                                    disabled={s === schoolProfile.session}
                                    className="neo-button bg-red-500 text-white rounded-full p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="neo-container rounded-xl p-6">
            <h3 className="text-xl font-bold border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">Google Account</h3>
            {userProfile.isGoogleAccount ? (
                <div>
                    <div className="flex items-center space-x-4">
                        <ProfilePhoto userId={userProfile.userId} hasPhoto={userProfile.hasPhoto} alt={userProfile.name} className="neo-container w-16 h-16 rounded-full object-cover"/>
                        <div>
                            <p className="font-bold text-lg">{userProfile.name}</p>
                            <p className="text-sm text-gray-600">{userProfile.email}</p>
                            <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full inline-block mt-1">Connected</span>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 border-t pt-4">
                        <button onClick={() => setIsDisconnectModalOpen(true)} className="neo-button-danger rounded-xl px-4 py-2 text-sm font-semibold">
                            Disconnect
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-600 mb-4">Link your Google Account to sync data and for easier sign-in.</p>
                    <div className="flex justify-end">
                        <button onClick={() => setIsLinkModalOpen(true)} className="neo-button-primary rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-2">
                            <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.425,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                            <span>Link Google Account</span>
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="neo-container rounded-xl p-6">
          <h3 className="text-xl font-bold border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">Google Sheet Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DataButton 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 2v-2m-6 4H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4 0h4m-4 0H9" /></svg>} 
              label="Sync Student Data" 
              onClick={() => handleDataSync('Student')} 
            />
            <DataButton
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 2v-2m-6 4H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4 0h4m-4 0H9" /></svg>}
              label="Sync Fee Records"
              onClick={() => handleDataSync('Fee')}
            />
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

      <ConfirmationModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleDisconnect}
        title="Disconnect Google Account"
        message={<>Are you sure you want to disconnect your Google account? You will need to use your User ID and password to sign in.</>}
        confirmText="Disconnect"
        variant="danger"
      />
      <GoogleAccountChooserModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onAccountSelect={handleLinkAccount}
        currentUserEmail={userProfile.email}
        currentUserName={userProfile.name}
      />
      <ConfirmationModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDeleteSession}
        title="Delete Session"
        message={<>Are you sure you want to delete the session <strong>"{sessionToDelete}"</strong>? This action cannot be undone.</>}
        confirmText="Delete"
        variant="danger"
      />
       <ConfirmationModal
        isOpen={!!sessionToChange}
        onClose={() => setSessionToChange(null)}
        onConfirm={confirmSessionChange}
        title="Change Active Session"
        message={<>Are you sure you want to change the active session to <strong>{sessionToChange}</strong>?<br/><br/><span className="font-semibold text-orange-600">This action will reload the application.</span></>}
        confirmText="Confirm & Reload"
        variant="success"
      />
    </PageWrapper>
  );
};

const SettingsButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="neo-button w-full flex items-center p-4 rounded-xl text-sm font-semibold hover:scale-105 transition-transform duration-200">
    <div className="neo-container rounded-full p-2 mr-4">{icon}</div>
    {label}
  </button>
);

const DataButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="neo-button w-full flex flex-col items-center p-4 rounded-xl text-sm font-semibold hover:scale-105 transition-transform duration-200 text-center">
    <div className="neo-container rounded-full p-2 mb-2">{icon}</div>
    {label}
  </button>
);

export default SettingsPage;