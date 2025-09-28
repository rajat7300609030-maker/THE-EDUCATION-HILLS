import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, UserProfile } from '../../../types';
import useUserProfile from '../../../hooks/useUserProfile';
import useUsers from '../../../hooks/useUsers';
import { useNotification } from '../../../contexts/NavigationContext';
import FormField from '../../ui/FormField';
import ProfilePhoto from '../../ui/ProfilePhoto';
import PasswordField from '../../ui/PasswordField';

const ChangeCredentialsPage: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useUserProfile();
    const [allUsers, setAllUsers] = useUsers();
    const { addNotification } = useNotification();

    const [targetUser, setTargetUser] = useState<UserProfile | null>(() => (loggedInUser.role === 'Student' ? loggedInUser : null));
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [formError, setFormError] = useState<string | null>(null);

    const [formState, setFormState] = useState({
        newUserId: '',
        authPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
    const [revealAuthPassword, setRevealAuthPassword] = useState('');
    const [revealError, setRevealError] = useState('');
    
    const isSelfEdit = targetUser ? loggedInUser.userId === targetUser.userId : false;

    useEffect(() => {
        if (targetUser) {
            setFormState({
                newUserId: targetUser.userId,
                authPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setFormError(null);
            // Reset reveal state when user changes
            setIsCurrentPasswordVisible(false);
            setRevealAuthPassword('');
            setRevealError('');
        }
    }, [targetUser]);

    const filteredUsers = useMemo(() => {
        let usersToList = allUsers;
        if (loggedInUser.role === 'Employee') {
            usersToList = allUsers.filter(u => u.role === 'Student');
        }

        return usersToList.filter(user => {
            const roleMatch = loggedInUser.role === 'Admin' ? (selectedRole === 'All' || user.role === selectedRole) : true;
            const searchMatch = searchTerm === '' ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userId.toLowerCase().includes(searchTerm.toLowerCase());
            return roleMatch && searchMatch;
        });
    }, [allUsers, searchTerm, selectedRole, loggedInUser.role]);

    const handleRevealPassword = () => {
        setRevealError('');
        if (revealAuthPassword === loggedInUser.password) {
            setIsCurrentPasswordVisible(true);
        } else {
            setRevealError('Your authorizing password is incorrect.');
            setRevealAuthPassword('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUser) return;
        setFormError(null);

        // --- VALIDATION ---
        if (/\s/.test(formState.newUserId)) {
            setFormError('User ID cannot contain spaces.');
            return;
        }

        const passwordToVerify = isSelfEdit ? targetUser.password : loggedInUser.password;
        if (formState.authPassword !== passwordToVerify) {
            setFormError(isSelfEdit ? 'Your current password is incorrect.' : 'Your authorizing password is incorrect.');
            return;
        }

        if (formState.newPassword && formState.newPassword.length < 6) {
            setFormError('New password must be at least 6 characters long.');
            return;
        }

        if (formState.newPassword && formState.newPassword !== formState.confirmPassword) {
            setFormError('New passwords do not match.');
            return;
        }
        
        if (formState.newUserId.toLowerCase() !== targetUser.userId.toLowerCase() && allUsers.some(u => u.userId.toLowerCase() === formState.newUserId.toLowerCase())) {
            setFormError('This User ID is already taken.');
            return;
        }

        const isIdSame = formState.newUserId === targetUser.userId;
        const isPasswordSame = !formState.newPassword || formState.newPassword === targetUser.password;

        if (isIdSame && isPasswordSame) {
            addNotification('No changes were made.', 'info');
            return;
        }
        
        // --- UPDATE LOGIC ---
        const updatedUser = {
            ...targetUser,
            userId: formState.newUserId,
            password: formState.newPassword ? formState.newPassword : targetUser.password,
        };
        
        setAllUsers(allUsers.map(u => u.userId === targetUser.userId ? updatedUser : u));

        if (isSelfEdit) {
            setLoggedInUser(updatedUser);
        }

        addNotification(`Credentials for ${targetUser.name} updated successfully!`, 'success');

        if (loggedInUser.role !== 'Student') {
            setTargetUser(null);
        } else {
             setFormState(prev => ({ ...prev, authPassword: '', newPassword: '', confirmPassword: '' }));
        }
    };
    
    const canSearch = loggedInUser.role === 'Admin' || loggedInUser.role === 'Employee';
    
    if (canSearch && !targetUser) {
        return (
            <PageWrapper page={Page.ChangeCredentials}>
                <div className="neo-container rounded-xl p-6">
                    <h3 className="text-xl font-bold border-b pb-3 mb-4">Select a User to Manage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="neo-button w-full p-3 rounded-xl"/>
                        {loggedInUser.role === 'Admin' && (
                            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="neo-button w-full p-3 rounded-xl appearance-none">
                                <option value="All">All Roles</option><option value="Admin">Admin</option><option value="Employee">Employee</option><option value="Student">Student</option>
                            </select>
                        )}
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <div key={user.userId} className="neo-button p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-3"><ProfilePhoto userId={user.userId} hasPhoto={user.hasPhoto} alt={user.name} className="neo-container w-10 h-10 rounded-full object-cover"/><div className="min-w-0"><p className="font-semibold truncate">{user.name}</p><p className="text-xs text-gray-500">{user.userId} - {user.role}</p></div></div>
                                <button onClick={() => setTargetUser(user)} className="neo-button-primary px-4 py-2 text-sm font-semibold rounded-lg">Manage</button>
                            </div>
                        )) : <p className="text-center text-gray-500 py-4">No users found.</p>}
                    </div>
                </div>
            </PageWrapper>
        );
    }
    
    if (targetUser) {
        return (
            <PageWrapper page={Page.ChangeCredentials}>
                <div className="neo-container rounded-xl p-6 max-w-lg mx-auto">
                    {canSearch && !isSelfEdit && (
                        <button onClick={() => setTargetUser(null)} className="neo-button rounded-full px-3 py-1 text-sm font-semibold mb-4 flex items-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                             <span>Back to User List</span>
                        </button>
                    )}
                    
                    <div className="flex flex-col items-center text-center p-4 rounded-lg neo-button mb-6">
                        <ProfilePhoto userId={targetUser.userId} hasPhoto={targetUser.hasPhoto} alt={targetUser.name} className="neo-container w-20 h-20 rounded-full object-cover mb-2" />
                        <h3 className="text-xl font-bold">{targetUser.name}</h3>
                        <p className="text-sm text-gray-500">{targetUser.role}</p>
                        <p className="text-xs mt-1 text-indigo-500 font-mono">Current User ID: {targetUser.userId}</p>
                    </div>

                    <div className="neo-button rounded-lg p-4 mt-6">
                        <h4 className="text-md font-bold mb-3 text-gray-700">Reveal Current Password</h4>
                        {isCurrentPasswordVisible ? (
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-lg text-green-600 select-all">{targetUser.password}</span>
                                <button type="button" onClick={() => setIsCurrentPasswordVisible(false)} className="neo-button rounded-lg px-3 py-1 text-sm font-semibold">Hide</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="font-mono text-2xl tracking-widest text-gray-500">••••••••</p>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="password"
                                        value={revealAuthPassword}
                                        onChange={(e) => { setRevealAuthPassword(e.target.value); setRevealError(''); }}
                                        placeholder={`Your password to reveal`}
                                        className="neo-button flex-grow p-2 rounded-md text-sm"
                                    />
                                    <button type="button" onClick={handleRevealPassword} className="neo-button-primary px-4 py-2 rounded-md text-sm font-semibold">Reveal</button>
                                </div>
                                {revealError && <p className="text-red-500 text-xs mt-1">{revealError}</p>}
                            </div>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        <p className="text-sm text-center text-gray-600">
                            To make changes, please enter {isSelfEdit ? 'your current' : `your ${loggedInUser.role}`} password for authorization.
                        </p>
                        
                        <PasswordField
                            label={isSelfEdit ? 'Current Password' : `Your (${loggedInUser.role}) Password`}
                            name="authPassword"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                            value={formState.authPassword}
                            onChange={(e) => setFormState(p => ({...p, authPassword: e.target.value}))}
                            placeholder="Enter password to authorize"
                            required
                        />

                        <div className="border-t pt-6 space-y-6">
                            <FormField label="User ID" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
                                <input type="text" name="newUserId" value={formState.newUserId} onChange={(e) => setFormState(p => ({...p, newUserId: e.target.value}))} className="neo-button w-full p-3 rounded-xl" required />
                            </FormField>
                             <PasswordField
                                label="New Password"
                                name="newPassword"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a1 1 0 011-1h2.157a6.002 6.002 0 0111.843 0H17a1 1 0 011 1v4h-2V7z" /></svg>}
                                value={formState.newPassword}
                                onChange={(e) => setFormState(p => ({...p, newPassword: e.target.value}))}
                                placeholder="Leave blank to keep current"
                            />
                             {formState.newPassword && (
                                <PasswordField
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a1 1 0 011-1h2.157a6.002 6.002 0 0111.843 0H17a1 1 0 011 1v4h-2V7z" /></svg>}
                                    value={formState.confirmPassword}
                                    onChange={(e) => setFormState(p => ({...p, confirmPassword: e.target.value}))}
                                    required={!!formState.newPassword}
                                />
                            )}
                        </div>
                        {formError && <p className="text-red-500 text-sm text-center font-semibold">{formError}</p>}
                        <div className="flex justify-end pt-4"><button type="submit" className="neo-button-primary rounded-xl px-6 py-3 font-semibold">Update Credentials</button></div>
                    </form>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper page={Page.ChangeCredentials}>
            <div className="neo-container rounded-xl p-6 text-center"><p>Loading...</p></div>
        </PageWrapper>
    );
};

export default ChangeCredentialsPage;
