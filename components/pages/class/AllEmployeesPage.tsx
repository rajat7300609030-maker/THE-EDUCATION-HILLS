import React, { useState, useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, UserProfile } from '../../../types';
import useUsers from '../../../hooks/useUsers';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotification } from '../../../contexts/NavigationContext';
import ProfilePhoto from '../../ui/ProfilePhoto';
import ConfirmationModal from '../../ui/ConfirmationModal';
import useUserProfile from '../../../hooks/useUserProfile';

const AllEmployeesPage: React.FC = () => {
    const [users, setUsers] = useUsers();
    const [loggedInUser] = useUserProfile();
    const { navigate } = useNavigation();
    const { addNotification } = useNotification();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

    const employees = useMemo(() => {
        return users.filter(user => user.role === 'Employee' && !user.isDeleted);
    }, [users]);
    
    const handleDeleteClick = (user: UserProfile) => {
        if (user.userId === loggedInUser.userId) {
            addNotification("You cannot delete your own account.", 'danger');
            return;
        }
        setUserToDelete(user);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDelete) return;
        setUsers(prevUsers => prevUsers.map(u => u.userId === userToDelete.userId ? { ...u, isDeleted: true } : u));
        addNotification(`Employee "${userToDelete.name}" moved to Recycle Bin.`, 'info');
        setIsModalOpen(false);
        setUserToDelete(null);
    };

    const handleEditClick = (userId: string) => {
        navigate(Page.EditEmployee, userId);
    };

    return (
        <PageWrapper page={Page.AllEmployees}>
            <div className="neo-container rounded-xl p-4">
                {employees.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employees.map(employee => (
                            <div key={employee.userId} className="neo-container neo-card-hover rounded-xl p-5 flex flex-col justify-between transition-all duration-200">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <ProfilePhoto 
                                            userId={employee.userId} 
                                            hasPhoto={employee.hasPhoto} 
                                            alt={employee.name}
                                            className="neo-container rounded-full w-16 h-16 object-cover" 
                                        />
                                        <div>
                                            <p className="text-xl font-bold text-gray-800">{employee.name}</p>
                                            <p className="text-sm text-gray-600">ID: {employee.userId}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        <span className="font-semibold mr-1">Email:</span> {employee.email}
                                    </div>
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <span className="font-semibold mr-1">Phone:</span> {employee.phone}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 border-t border-gray-300 pt-3 mt-auto">
                                    <button onClick={() => handleEditClick(employee.userId)} className="neo-button rounded-full p-2 text-green-500 hover:text-green-700" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button onClick={() => handleDeleteClick(employee)} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No employees found. Click 'Add New Employee' to get started!</p>
                )}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Move Employee to Recycle Bin"
                message={<>Are you sure you want to move <strong>"{userToDelete?.name}"</strong> to the Recycle Bin? You can restore them later.</>}
                confirmText="Move to Bin"
                variant="danger"
            />
        </PageWrapper>
    );
};

export default AllEmployeesPage;