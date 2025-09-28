
import React, { useState, useEffect } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, UserProfile } from '../../../types';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotification } from '../../../contexts/NavigationContext';
import FormField from '../../ui/FormField';
import useUsers from '../../../hooks/useUsers';
import PasswordField from '../../ui/PasswordField';

const EditEmployeeForm: React.FC = () => {
  const { currentPage, goBack } = useNavigation();
  const [users, setUsers] = useUsers();
  const { addNotification } = useNotification();
  
  const userId = currentPage.data as string;
  const userToEdit = users.find(u => u.userId === userId);

  const [formState, setFormState] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setFormState(userToEdit);
    }
  }, [userToEdit]);

  if (!formState || !userToEdit) {
    return (
      <PageWrapper page={Page.EditEmployee}>
        <p className="text-center text-red-500">Employee not found.</p>
      </PageWrapper>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => (u.userId === userId ? formState : u)));
    addNotification(`Employee "${formState.name}" updated successfully.`, 'success');
    goBack();
  };

  return (
    <PageWrapper page={Page.EditEmployee}>
      <div className="neo-container rounded-xl p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Employee ID" icon={<div/>}>
              <div className="neo-container w-full rounded-xl p-3 block text-center font-semibold">{formState.userId}</div>
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
                placeholder="New password (optional)"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            />
            <div className="md:col-span-2">
                <FormField label="Address" icon={<div/>}>
                    <textarea name="address" value={formState.address} onChange={handleChange} rows={3} className="neo-button w-full p-3 rounded-xl"></textarea>
                </FormField>
            </div>
          </div>
          <div className="flex items-center space-x-4 pt-4">
            <button type="submit" className="neo-button-primary flex-grow rounded-xl p-3 text-lg font-semibold">Update Employee</button>
            <button type="button" onClick={goBack} className="neo-button-danger flex-grow rounded-xl p-3 text-lg font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default EditEmployeeForm;