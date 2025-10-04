import React, { useState } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, UserProfile } from '../../../types';
import useUsers from '../../../hooks/useUsers';
import ProfilePhoto from '../../ui/ProfilePhoto';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { useNotification } from '../../../contexts/NavigationContext';
import FormField from '../../ui/FormField';
import PasswordField from '../../ui/PasswordField';

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useUsers();
    const { addNotification } = useNotification();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    const handleAddNew = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: UserProfile) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (user: UserProfile) => {
        if (users.length <= 1) {
            addNotification('Cannot delete the last user.', 'danger');
            return;
        }
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!currentUser) return;
        setUsers(users.filter(u => u.userId !== currentUser.userId));
        addNotification(`User "${currentUser.name}" deleted.`, 'info');
        setIsDeleteModalOpen(false);
        setCurrentUser(null);
    };

    const handleSave = (userToSave: UserProfile) => {
        if (currentUser) { // Editing
            setUsers(users.map(u => u.userId === userToSave.userId ? userToSave : u));
            addNotification('User updated successfully.', 'success');
        } else { // Adding
            if (users.some(u => u.userId.toLowerCase() === userToSave.userId.toLowerCase())) {
                addNotification('User ID already exists.', 'danger');
                return;
            }
            setUsers([...users, userToSave]);
            addNotification('User added successfully.', 'success');
        }
        setIsModalOpen(false);
    };

    return (
        <PageWrapper page={Page.UserManagement}>
            <div className="neo-container rounded-xl p-6">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold">System Users ({users.length})</h3>
                    <button onClick={handleAddNew} className="neo-button-primary rounded-xl px-4 py-2 text-sm font-semibold">
                        Add New User
                    </button>
                </div>

                <div className="space-y-3">
                    {users.map(user => (
                        <div key={user.userId} className="neo-button p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <ProfilePhoto userId={user.userId} hasPhoto={user.hasPhoto} alt={user.name} className="neo-container w-12 h-12 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold">{user.name}</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{user.role}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(user)} className="neo-button rounded-full p-2 text-green-600" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                <button onClick={() => handleDelete(user)} className="neo-button rounded-full p-2 text-red-600" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <UserFormModal
                    user={currentUser}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                message={<>Are you sure you want to delete the user <strong>{currentUser?.name}</strong>? This action is irreversible.</>}
                confirmText="Delete"
                variant="danger"
            />
        </PageWrapper>
    );
};


// --- User Form Modal Component ---
interface UserFormModalProps {
    user: UserProfile | null;
    onClose: () => void;
    onSave: (user: UserProfile) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onClose, onSave }) => {
    const isNew = user === null;
    const [formData, setFormData] = useState<UserProfile>(() => {
        const defaultUser: UserProfile = {
            userId: '', name: '', email: '', phone: '', role: 'Employee', hasPhoto: false, dob: '', address: '', password: '',
            // FIX: Added missing properties to notificationSettings to match the UserProfile type.
            notificationSettings: {
                email: true,
                sms: false,
                feeReminders: true,
                assignmentUpdates: true,
                examAlerts: true,
                generalAnnouncements: true,
                attendanceAlerts: false,
            }
        };
        return user ? { ...user } : defaultUser;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create a copy to avoid direct state mutation issues if any async operations were added.
        const userToSave = { ...formData };
        
        // When editing an existing user, if the password field is left empty,
        // it should not erase the existing password. Instead, we retain the original one.
        if (!isNew && user && !userToSave.password) {
            userToSave.password = user.password;
        }

        onSave(userToSave);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <form onSubmit={handleSubmit} className="modal-container neo-container max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b"><h3 className="text-xl font-semibold">{isNew ? 'Add New User' : 'Edit User'}</h3></div>
                <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="User ID" icon={<div/>}><input type="text" name="userId" value={formData.userId} onChange={handleChange} className="neo-button w-full p-2 rounded-md" required disabled={!isNew} /></FormField>
                    <FormField label="Full Name" icon={<div/>}><input type="text" name="name" value={formData.name} onChange={handleChange} className="neo-button w-full p-2 rounded-md" required /></FormField>
                    <FormField label="Email" icon={<div/>}><input type="email" name="email" value={formData.email} onChange={handleChange} className="neo-button w-full p-2 rounded-md" required /></FormField>
                    <FormField label="Phone" icon={<div/>}><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="neo-button w-full p-2 rounded-md" /></FormField>
                    <FormField label="Role" icon={<div/>}><select name="role" value={formData.role} onChange={handleChange} className="neo-button w-full p-2 rounded-md"><option>Admin</option><option>Employee</option><option>Student</option></select></FormField>
                    <PasswordField
                        label="Password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        required={isNew}
                        placeholder={isNew ? 'Required' : 'New password'}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                    />
                </div>
                <div className="flex items-center justify-end p-6 space-x-2 border-t">
                    <button onClick={onClose} type="button" className="neo-button rounded-xl px-5 py-2.5">Cancel</button>
                    <button type="submit" className="neo-button-primary rounded-xl px-5 py-2.5">Save User</button>
                </div>
            </form>
        </div>
    );
};

export default UserManagementPage;