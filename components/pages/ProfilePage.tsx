import React, { useState, useRef, useEffect } from 'react';
import { Page, UserProfile } from '../../types';
import useUserProfile from '../../hooks/useUserProfile';
import ToggleSwitch from '../ui/ToggleSwitch';
import PageWrapper from '../ui/PageWrapper';
import { setUserPhoto } from '../../utils/db';
import ProfilePhoto from '../ui/ProfilePhoto';
import { useNotification } from '../../contexts/NavigationContext';
import useUsers from '../../hooks/useUsers';
import PasswordField from '../ui/PasswordField';

const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useUserProfile();
  const [users, setUsers] = useUsers();
  const { addNotification } = useNotification();
  
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editData, setEditData] = useState<UserProfile>(userProfile);
  
  // State for photo management
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreviewUrl, setNewPhotoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState(
    () => ({
        email: true,
        sms: false,
        feeReminders: true,
        assignmentUpdates: true,
        examAlerts: true,
        generalAnnouncements: true,
        attendanceAlerts: false,
        ...(userProfile.notificationSettings || {})
    })
  );
  
  useEffect(() => {
    return () => {
      if (newPhotoPreviewUrl) {
        URL.revokeObjectURL(newPhotoPreviewUrl);
      }
    };
  }, [newPhotoPreviewUrl]);

  const handleEditInfo = () => {
    setEditData(userProfile);
    setNewPhotoFile(null);
    setNewPhotoPreviewUrl(null);
    setIsEditingInfo(true);
  };

  const handleCancelInfo = () => {
    setIsEditingInfo(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      if (newPhotoPreviewUrl) {
        URL.revokeObjectURL(newPhotoPreviewUrl);
      }
      setNewPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({...prev, [name]: value}));
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let profileUpdates: Partial<UserProfile> = {};
      if (newPhotoFile) {
        await setUserPhoto(userProfile.userId, newPhotoFile);
        profileUpdates.hasPhoto = true;
      }
      
      const finalUserData = { ...editData, ...profileUpdates };
      setUserProfile(finalUserData);

      // Also update the user in the global users list for consistency
      setUsers(users.map(u => u.userId === userProfile.userId ? finalUserData : u));

      setIsEditingInfo(false);
      setNewPhotoFile(null);
      setNewPhotoPreviewUrl(null);
      addNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error("Failed to save profile or photo:", error);
      addNotification("There was an error saving your photo. Please try again.", 'danger');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { newPassword, confirmPassword, currentPassword } = passwordData;
    if (!newPassword || !confirmPassword || !currentPassword) {
      addNotification('Please fill in all password fields.', 'danger');
      return;
    }
    if (currentPassword !== userProfile.password) {
      addNotification('Current password does not match.', 'danger');
      return;
    }
    if (newPassword !== confirmPassword) {
      addNotification('New passwords do not match.', 'danger');
      return;
    }

    // Update password in the main users list
    const updatedUsers = users.map(u =>
      u.userId === userProfile.userId ? { ...u, password: newPassword } : u
    );
    setUsers(updatedUsers);

    // Update the current user profile in context as well
    setUserProfile(prev => ({ ...prev, password: newPassword }));

    addNotification('Password updated successfully!', 'success');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };
  
  const handleNotificationSettingChange = (setting: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({...prev, [setting]: value}));
  };

  const handleSettingsSave = () => {
    setUserProfile(prev => ({ ...prev, notificationSettings }));
    addNotification('Settings saved!', 'success');
  };

  return (
    <PageWrapper page={Page.Profile}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Profile Header Card */}
        <div className="neo-container rounded-3xl p-6 flex flex-col items-center text-center">
            <div className="relative group">
                 {newPhotoPreviewUrl ? (
                    <img src={newPhotoPreviewUrl} alt="New profile preview" className="neo-container rounded-full w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <ProfilePhoto 
                      userId={userProfile.userId}
                      hasPhoto={userProfile.hasPhoto}
                      alt="Profile"
                      className="neo-container rounded-full w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  )}
                 {isEditingInfo && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                 )}
            </div>
            <input ref={fileInputRef} id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
            <h2 className="text-3xl font-bold text-gray-900 mt-4">{userProfile.name}</h2>
            <p className="text-md text-yellow-600 font-semibold">{userProfile.role}</p>
            <p className="text-xs text-indigo-500 mt-1 font-semibold tracking-wider">ID: {userProfile.userId}</p>
        </div>
        
        {/* Personal Information Card */}
        <form onSubmit={handleSaveInfo} className="neo-container rounded-3xl p-6">
          <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-6">
            <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
            {!isEditingInfo ? (
              <button type="button" onClick={handleEditInfo} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 active:text-blue-600">Edit</button>
            ) : (
              <div className="flex items-center space-x-2">
                <button type="button" onClick={handleCancelInfo} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 active:text-red-600">Cancel</button>
                <button type="submit" className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 active:text-green-600">Save</button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="name" value={editData.name} onChange={handleInfoChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} isEditing={isEditingInfo} />
            <InputField label="Email Address" name="email" type="email" value={editData.email} onChange={handleInfoChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} isEditing={isEditingInfo} />
            <InputField label="Phone Number" name="phone" type="tel" value={editData.phone} onChange={handleInfoChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} isEditing={isEditingInfo} />
            <InputField label="Date of Birth" name="dob" type="date" value={editData.dob || ''} onChange={handleInfoChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} isEditing={isEditingInfo} />
            <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span>Address</span>
                </label>
                {isEditingInfo ? (
                    <textarea name="address" value={editData.address || ''} onChange={handleInfoChange} rows={3} className="neo-button w-full rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-0"></textarea>
                ) : (
                    <p className="text-lg text-gray-800 ml-7">{userProfile.address || 'N/A'}</p>
                )}
            </div>
          </div>
        </form>

        {/* Security Card */}
        <form onSubmit={handlePasswordSave} className="neo-container rounded-3xl p-6">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3 mb-6">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PasswordField
                    label="Current Password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                />
                <div/>
                <PasswordField
                    label="New Password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                />
                <PasswordField
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                />
            </div>
            <div className="flex justify-end mt-6">
                 <button type="submit" className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 active:text-green-600">Update Password</button>
            </div>
        </form>
        
        {/* Notification Settings Card */}
        <div className="neo-container rounded-3xl p-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3 mb-6">Notification Settings</h3>
          <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-2">Channels</h4>
              <NotificationToggle label="Email Notifications" settingKey="email" checked={notificationSettings.email} onChange={handleNotificationSettingChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
              <NotificationToggle label="SMS Notifications" settingKey="sms" checked={notificationSettings.sms} onChange={handleNotificationSettingChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />

              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-2 pt-4 border-t mt-4">Notification Types</h4>
              <NotificationToggle label="Fee Reminders" settingKey="feeReminders" checked={notificationSettings.feeReminders} onChange={handleNotificationSettingChange} icon={<span className="h-5 w-5 text-green-500 font-bold text-lg flex items-center justify-center">₹</span>} />
              <NotificationToggle label="Assignment Updates" settingKey="assignmentUpdates" checked={notificationSettings.assignmentUpdates} onChange={handleNotificationSettingChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M16 16h.01" /></svg>} />
              <NotificationToggle label="Exam Alerts" settingKey="examAlerts" checked={notificationSettings.examAlerts} onChange={handleNotificationSettingChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <NotificationToggle label="General Announcements" settingKey="generalAnnouncements" checked={notificationSettings.generalAnnouncements} onChange={handleNotificationSettingChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584C18.354 1.866 18.662 1 19.418 1h.274C21.036 1 22 2.023 22 3.328v10.344c0 1.21-.962 2.181-2.148 2.181h-.274c-.756 0-1.064-.866-.926-1.584C17.625 11.236 14.1 9 10.832 9H9a4.002 4.002 0 00-3.564 4.683z" /></svg>} />
              <NotificationToggle label="Attendance Alerts" settingKey="attendanceAlerts" checked={notificationSettings.attendanceAlerts} onChange={handleNotificationSettingChange} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" onClick={handleSettingsSave} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 active:text-green-600">Save Settings</button>
          </div>
        </div>


      </div>
    </PageWrapper>
  );
};

// Reusable component for form input fields, now with view/edit logic
const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  type?: string;
  // Fix: Changed icon type from JSX.Element to React.ReactNode to resolve namespace issue.
  icon: React.ReactNode;
}> = ({ label, name, value, onChange, isEditing, type = 'text', icon }) => (
  <div>
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">{icon}<span>{label}</span></label>
    {isEditing ? (
      <input type={type} name={name} value={value} onChange={onChange} className="neo-button w-full rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-0" required />
    ) : (
      <p className="text-lg text-gray-800 ml-7">{value || 'N/A'}</p>
    )}
  </div>
);

// Reusable component for Notification Toggles
const NotificationToggle: React.FC<{
  label: string;
  settingKey: keyof UserProfile['notificationSettings'];
  checked: boolean;
  onChange: (key: any, value: boolean) => void;
  // Fix: Changed icon type from JSX.Element to React.ReactNode to resolve namespace issue.
  icon: React.ReactNode;
}> = ({ label, settingKey, checked, onChange, icon }) => (
    <div className="flex items-center justify-between p-2 rounded-lg">
        <label htmlFor={`${settingKey}-toggle`} className="text-sm font-medium text-gray-700 flex items-center space-x-3">
            {icon}
            <span>{label}</span>
        </label>
        <ToggleSwitch id={`${settingKey}-toggle`} checked={checked} onChange={(e) => onChange(settingKey, e.target.checked)} />
    </div>
);

export default ProfilePage;