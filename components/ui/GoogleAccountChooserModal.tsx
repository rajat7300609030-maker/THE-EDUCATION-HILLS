import React, { useMemo } from 'react';
import useSchoolProfile from '../../hooks/useSchoolProfile';

interface GoogleAccount {
    name: string;
    email: string;
    hasPhoto: boolean;
}

interface GoogleAccountChooserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccountSelect: (account: GoogleAccount) => void;
    currentUserEmail?: string;
    currentUserName?: string;
}

const mockGoogleAccounts: GoogleAccount[] = [
    { name: 'Liam Johnson', email: 'liam.j@school.com', hasPhoto: false }, // Existing student
    { name: 'Sarah T', email: 'sarah.t@school.com', hasPhoto: false }, // Existing employee
    { name: 'Alex Doe', email: 'alex.doe@gmail.com', hasPhoto: false }, // New user
    { name: 'Demo Student', email: 'new.student.demo@google.com', hasPhoto: false } // New user
];

const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({ isOpen, onClose, onAccountSelect, currentUserEmail, currentUserName }) => {
    const [schoolProfile] = useSchoolProfile();

    const displayAccounts = useMemo(() => {
        const accounts = [...mockGoogleAccounts];
        if (currentUserEmail && currentUserName) {
            const userAccountExists = accounts.some(
                acc => acc.email.toLowerCase() === currentUserEmail.toLowerCase()
            );

            if (!userAccountExists) {
                accounts.unshift({
                    name: currentUserName,
                    email: currentUserEmail,
                    hasPhoto: false, 
                });
            }
        }
        return accounts;
    }, [currentUserEmail, currentUserName]);

    if (!isOpen) return null;

    return (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b text-center">
              <svg className="mx-auto h-8 w-auto mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.999 12.215C21.999 11.39 21.928 10.585 21.797 9.81H12.24V14.39H17.788C17.53 15.86 16.726 17.14 15.482 17.97V20.89H19.23C21.05 19.22 21.999 16.92 21.999 14.215V12.215Z" fill="#4285F4"></path><path d="M12.24 22C15.11 22 17.55 21.05 19.23 19.5L15.482 16.58C14.542 17.24 13.483 17.65 12.24 17.65C9.849 17.65 7.828 16.075 7.022 13.91H3.16V16.91C4.84 20.18 8.241 22 12.24 22Z" fill="#34A853"></path><path d="M7.022 13.91C6.772 13.25 6.63 12.55 6.63 11.83C6.63 11.11 6.762 10.41 7.022 9.75V6.75H3.16C2.43 8.19 2 10.01 2 11.83C2 13.65 2.43 15.47 3.16 16.91L7.022 13.91Z" fill="#FBBC05"></path><path d="M12.24 6.35C13.56 6.35 14.65 6.78 15.53 7.62L19.3 3.84C17.54 2.19 15.1 1.25 12.24 1.25C8.241 1.25 4.84 3.82 3.16 7.09L7.022 10.09C7.828 7.93 9.849 6.35 12.24 6.35Z" fill="#EA4335"></path></svg>
              <h2 className="text-xl font-medium text-gray-800">Choose an account</h2>
              <p className="text-sm text-gray-500 mt-1">to continue to {schoolProfile.name}</p>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
                {displayAccounts.map((account, index) => (
                    <button key={index} onClick={() => onAccountSelect(account)} className="w-full text-left p-3 flex items-center space-x-4 rounded-md hover:bg-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                            {account.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 text-sm">{account.name}</p>
                            <p className="text-gray-500 text-xs">{account.email}</p>
                        </div>
                    </button>
                ))}
                 <button className="w-full text-left p-3 flex items-center space-x-4 rounded-md hover:bg-gray-100">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700 text-sm">Use another account</p>
                    </div>
                </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-lg">
                <p className="text-xs text-gray-500 text-center">
                    To continue, Google will share your name, email address, and profile picture with this app.
                </p>
            </div>
          </div>
        </div>
    );
};

export default GoogleAccountChooserModal;