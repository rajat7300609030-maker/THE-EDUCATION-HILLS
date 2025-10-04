

import { useMemo, Dispatch, SetStateAction } from 'react';
import useLocalStorage from './useLocalStorage';
import { UserProfile } from '../types';

const defaultUser: UserProfile = {
  userId: 'Admi001',
  name: 'John Doe',
  email: 'johndoe@email.com',
  phone: '123-456-7890',
  role: 'Administrator',
  hasPhoto: false,
  dob: '',
  address: '',
  password: 'password',
  isGoogleAccount: false,
  notificationSettings: {
    email: true,
    sms: false,
    feeReminders: true,
    assignmentUpdates: true,
    examAlerts: true,
    generalAnnouncements: true,
    attendanceAlerts: false,
  },
};

// Fix: Imported Dispatch and SetStateAction and used them to type the return value.
function useUserProfile(): [UserProfile, Dispatch<SetStateAction<UserProfile>>] {
  const [rawProfile, setRawProfile] = useLocalStorage<UserProfile>('userProfile', defaultUser);

  // The merging logic is now more robust. It explicitly checks for a valid
  // object from localStorage before merging. This prevents edge cases where
  // corrupted or partial data could cause the profile to revert to defaults.
  const profile = useMemo(() => {
    // Start with a deep copy of the default user to avoid any mutation issues.
    const newProfile = JSON.parse(JSON.stringify(defaultUser));
    
    // Only merge if the loaded data is a valid object.
    if (rawProfile && typeof rawProfile === 'object') {
      // Merge all top-level properties from the stored data onto the default.
      Object.assign(newProfile, rawProfile);
      
      // Deep merge notification settings to ensure new keys are added
      if (rawProfile.notificationSettings) {
        newProfile.notificationSettings = {
          ...defaultUser.notificationSettings,
          ...rawProfile.notificationSettings
        };
      }
    }
    
    return newProfile;
  }, [rawProfile]);


  return [profile, setRawProfile];
}

export default useUserProfile;