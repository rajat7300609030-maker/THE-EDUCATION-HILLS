import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, UserProfile } from '../../../types';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotification } from '../../../contexts/NavigationContext';
import FormField from '../../ui/FormField';
import useUsers from '../../../hooks/useUsers';
import { setUserPhoto } from '../../../utils/db';
import PasswordField from '../../ui/PasswordField';

const InfoRow: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
    <div className="py-2 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-gray-800">{value || 'N/A'}</p>
    </div>
);

const AddEmployeeForm: React.FC = () => {
  const [users, setUsers] = useUsers();
  const { goBack } = useNavigation();
  const { addNotification } = useNotification();
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [formState, setFormState] = useState<Omit<UserProfile, 'userId' | 'hasPhoto' | 'notificationSettings'>>({
    name: '',
    email: '',
    phone: '',
    role: 'Employee',
    dob: '',
    address: '',
    password: '',
  });

  const [employeePhoto, setEmployeePhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (employeePhoto) {
      const url = URL.createObjectURL(employeePhoto);
      setPhotoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [employeePhoto]);

  const newUserId = useMemo(() => {
    const employeeUsers = users.filter(u => u.userId.startsWith('EMP'));
    let maxIdNum = 0;
    employeeUsers.forEach(user => {
      const num = parseInt(user.userId.substring(3));
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    });
    return 'EMP' + String(maxIdNum + 1).padStart(3, '0');
  }, [users]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEmployeePhoto(e.target.files[0]);
    }
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.password) {
        addNotification('Password is required for a new employee.', 'danger');
        return;
    }
    setIsPreviewing(true);
  };
  
  const handleFinalSave = async () => {
    try {
        if (employeePhoto) {
            await setUserPhoto(newUserId, employeePhoto);
        }

        const newUser: UserProfile = {
          ...formState,
          userId: newUserId,
          hasPhoto: !!employeePhoto,
          notificationSettings: {
              email: true,
              sms: false,
              feeReminders: false,
              assignmentUpdates: true,
              examAlerts: true,
              generalAnnouncements: true,
              attendanceAlerts: true,
          },
        };
        
        setUsers(prev => [...prev, newUser]);
        addNotification(`Employee "${newUser.name}" added successfully.`, 'success');
        goBack();
    } catch (error) {
        console.error("Failed to save employee or photo:", error);
        addNotification("There was an error saving the employee's photo. Please try again.", 'danger');
    }
  };
  
  if (isPreviewing) {
    return (
        <PageWrapper page={Page.AddEmployeeForm}>
            <div className="neo-container rounded-xl p-6 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold border-b pb-3 mb-4 text-center">Confirm New Employee Details</h3>
                <div className="text-center mb-6">
                    {photoPreviewUrl ? (
                        <img src={photoPreviewUrl} alt="Employee Preview" className="neo-container rounded-full w-24 h-24 object-cover mx-auto" />
                    ) : (
                        <div className="neo-container rounded-full w-24 h-24 mx-auto flex items-center justify-center text-gray-500">No Photo</div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <InfoRow label="Employee ID" value={newUserId} />
                    <InfoRow label="Full Name" value={formState.name} />
                    <InfoRow label="Email Address" value={formState.email} />
                    <InfoRow label="Phone Number" value={formState.phone} />
                    <InfoRow label="Date of Birth" value={formState.dob} />
                    <InfoRow label="Password" value="••••••••" />
                    <div className="md:col-span-2">
                        <InfoRow label="Address" value={formState.address} />
                    </div>
                </div>
                <div className="flex items-center space-x-4 pt-6 mt-6 border-t">
                    <button type="button" onClick={handleFinalSave} className="neo-button-success flex-grow rounded-xl p-3 text-lg font-semibold">Confirm & Save</button>
                    <button type="button" onClick={() => setIsPreviewing(false)} className="neo-button flex-grow rounded-xl p-3 text-lg font-semibold">Go Back & Edit</button>
                </div>
            </div>
        </PageWrapper>
    );
  }

  return (
    <PageWrapper page={Page.AddEmployeeForm}>
      <div className="neo-container rounded-xl p-6 max-w-2xl mx-auto">
        <form onSubmit={handlePreviewSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField label="Employee Photo" icon={<div/>}>
                <input type="file" name="employee-photo" accept="image/*" onChange={handlePhotoChange} className="neo-button w-full rounded-xl p-3" />
            </FormField>
            <FormField label="Employee ID" icon={<div/>}>
              <div className="neo-container w-full rounded-xl p-3 block text-center font-semibold">{newUserId}</div>
            </FormField>
            <FormField label="Full Name" icon={<div/>}>
              <input type="text" name="name" value={formState.name} onChange={handleChange} className="neo-button w-full p-3 rounded-xl" required />
            </FormField>
            <FormField label="Email Address" icon={<div/>}>
              <input type="email" name="email" value={formState.email} onChange={handleChange} className="neo-button w-full p-3 rounded-xl" required />
            </FormField>
            <FormField label="Phone Number" icon={<div/>}>
              <input type="tel" name="phone" value={formState.phone} onChange={handleChange} className="neo-button w-full p-3 rounded-xl" />
            </FormField>
            <FormField label="Date of Birth" icon={<div/>}>
              <input type="date" name="dob" value={formState.dob} onChange={handleChange} className="neo-button w-full p-3 rounded-xl" />
            </FormField>
            <PasswordField
                label="Password"
                name="password"
                value={formState.password || ''}
                onChange={handleChange}
                required
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            />
            <div className="md:col-span-2">
                <FormField label="Address" icon={<div/>}>
                    <textarea name="address" value={formState.address} onChange={handleChange} rows={3} className="neo-button w-full p-3 rounded-xl"></textarea>
                </FormField>
            </div>
          </div>
          <div className="flex items-center space-x-4 pt-4">
            <button type="submit" className="neo-button-primary flex-grow rounded-xl p-3 text-lg font-semibold">Preview Details</button>
            <button type="button" onClick={goBack} className="neo-button-danger flex-grow rounded-xl p-3 text-lg font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default AddEmployeeForm;
