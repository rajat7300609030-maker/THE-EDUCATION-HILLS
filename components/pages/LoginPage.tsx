import React, { useState } from 'react';
import useSchoolProfile from '../../hooks/useSchoolProfile';
import SchoolLogo from '../ui/SchoolLogo';
import { Page, InquiryRecord, UserProfile } from '../../types';
import ProfilePhoto from '../ui/ProfilePhoto';
import useUsers from '../../hooks/useUsers';
import { useNotification } from '../../contexts/NavigationContext';
import PasswordField from '../ui/PasswordField';
import GoogleAccountChooserModal from '../ui/GoogleAccountChooserModal';

interface LoginPageProps {
  onLogin: (user: UserProfile, page?: Page, data?: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [schoolProfile] = useSchoolProfile();
  const [role, setRole] = useState('Admin');
  const [view, setView] = useState<'login' | 'inquiry'>('login');
  
  // States for new multi-step login
  const [loginStep, setLoginStep] = useState<'enterUser' | 'enterPassword'>('enterUser');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userToAuth, setUserToAuth] = useState<UserProfile | null>(null);
  
  const [users, setUsers] = useUsers();
  const { addNotification } = useNotification();
  
  // State for Google Sign-In Modal
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userToAuth && userToAuth.password === password) {
        addNotification(`Login successful! Welcome back, ${userToAuth.name}.`, 'success');
        onLogin(userToAuth);
    } else {
        addNotification("User ID and password not found. Please contact School & try again later.", 'danger');
        setLoginStep('enterUser');
        setPassword('');
        setUserToAuth(null);
    }
  };
  
  const handleInquirySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inquiries = JSON.parse(window.localStorage.getItem('inquiries') || '[]');
    
    const newInquiry: InquiryRecord = {
      id: `inq-${Date.now()}`,
      role: role as InquiryRecord['role'],
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      email: formData.get('email') as string | undefined,
      employeeId: formData.get('employeeId') as string | undefined,
      admissionClass: formData.get('admissionClass') as string | undefined,
      message: formData.get('message') as string,
      timestamp: Date.now(),
    };

    inquiries.unshift(newInquiry);
    window.localStorage.setItem('inquiries', JSON.stringify(inquiries));
    
    addNotification('Thanks! Your inquiry has been submitted.', 'success');
    
    e.currentTarget.reset();
    setRole('Admin');
    setView('login');
  };
  
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if(username.trim()){
        const user = users.find(u => u.userId.toLowerCase() === username.toLowerCase() && u.role === role);
        setUserToAuth(user || null);
        setLoginStep('enterPassword');
    }
  };

  const handleGoogleSignInClick = () => {
    setIsGoogleModalOpen(true);
  };

  const handleSelectGoogleAccount = (googleUser: { email: string; name: string }) => {
    setIsGoogleModalOpen(false);
    const { email, name } = googleUser;
    const existingUser = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      addNotification(`Welcome back, ${existingUser.name}! Signed in via Google.`, 'success');
      onLogin({ ...existingUser, isGoogleAccount: true });
    } else {
      const newUserId = `GS${Date.now()}`;
      const newUser: UserProfile = {
        userId: newUserId,
        name: name,
        email: email,
        phone: '',
        role: 'Student',
        hasPhoto: false,
        dob: '',
        address: '',
        password: Math.random().toString(36).slice(-8),
        isGoogleAccount: true,
        notificationSettings: {
          email: true,
          sms: true,
          feeReminders: true,
          assignmentUpdates: true,
          examAlerts: true,
          generalAnnouncements: true,
          attendanceAlerts: true,
        },
      };

      setUsers(prev => [...prev, newUser]);
      addNotification(`Welcome, ${name}! Your new account has been created via Google.`, 'success');
      onLogin(newUser);
    }
  };

  const renderInquiryForm = () => {
    return (
        <form onSubmit={handleInquirySubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-center text-gray-700 -mb-2">Make an Inquiry</h2>
            
            <div>
              <div className="neo-button w-full rounded-full p-2 flex items-center relative">
                  <div className="neo-container rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                  </div>
                  <select
                      id="inquiry-role"
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0 appearance-none"
                      required
                  >
                      <option value="Admin">Inquiry for Admin</option>
                      <option value="Employee">Inquiry for Employee</option>
                      <option value="Student">Inquiry for Student</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
            </div>
            
            <div>
              <div className="neo-button w-full rounded-full p-2 flex items-center">
                  <div className="neo-container rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                  </div>
                  <input type="text" name="name" placeholder="Your Full Name" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0" required />
              </div>
            </div>
            <div>
                <div className="neo-button w-full rounded-full p-2 flex items-center">
                    <div className="neo-container rounded-full p-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                       </svg>
                    </div>
                    <input type="tel" name="contact" placeholder="Contact Number" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0" required />
                </div>
            </div>

            {role === 'Admin' && (
              <div>
                  <div className="neo-button w-full rounded-full p-2 flex items-center">
                      <div className="neo-container rounded-full p-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                         </svg>
                      </div>
                      <input type="email" name="email" placeholder="Email Address" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0" required />
                  </div>
              </div>
            )}
            
            {role === 'Employee' && (
               <div>
                  <div className="neo-button w-full rounded-full p-2 flex items-center">
                      <div className="neo-container rounded-full p-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                         </svg>
                      </div>
                      <input type="text" name="employeeId" placeholder="Employee ID" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0" />
                  </div>
              </div>
            )}
            
            {role === 'Student' && (
               <div>
                  <div className="neo-button w-full rounded-full p-2 flex items-center">
                      <div className="neo-container rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.14M12 14v10" /><path d="M6 16.5V12M18 16.5V12" /></svg>
                      </div>
                      <input type="text" name="admissionClass" placeholder="Seeking Admission in Class" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0" required />
                  </div>
              </div>
            )}
            
            <div>
              <div className="neo-button w-full rounded-2xl p-2 flex items-start">
                  <div className="neo-container rounded-full p-2 mt-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                     </svg>
                  </div>
                  <textarea name="message" placeholder="Your Message or Inquiry..." rows={3} className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0" required></textarea>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button type="button" onClick={() => setView('login')} className="neo-button w-full rounded-full p-3 font-semibold text-gray-800 transition-colors duration-200 active:text-red-600">
                  Back
              </button>
              <button type="submit" className="neo-button w-full rounded-full p-3 font-semibold text-gray-800 transition-colors duration-200 active:text-green-600">
                  Submit
              </button>
            </div>
        </form>
    );
  };
  
  const renderLoginForm = () => {
    return (
        <>
            {loginStep === 'enterUser' ? (
                <form onSubmit={handleNextStep} className="space-y-6">
                    <div>
                        <div className="neo-button w-full rounded-full p-2 flex items-center relative">
                            <div className="neo-container rounded-full p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0 appearance-none"
                                required
                            >
                                <option value="Admin">Admin</option>
                                <option value="Employee">Employee</option>
                                <option value="Student">Student</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="neo-button w-full rounded-full p-2 flex items-center">
                            <div className="neo-container rounded-full p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input type="text" id="username" name="username" placeholder="Username / User ID" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0" required value={username} onChange={e => setUsername(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" className="neo-button w-full rounded-full p-2 text-lg font-semibold text-gray-800 transition-colors duration-200 active:text-blue-600 flex items-center justify-center">
                        <div className="neo-container rounded-full p-2 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        </div>
                        <span>Next</span>
                    </button>
                </form>
            ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="flex flex-col items-center text-center -mt-4 mb-2">
                        <ProfilePhoto
                            userId={userToAuth?.userId || ''}
                            hasPhoto={userToAuth?.hasPhoto || false}
                            alt="User Profile"
                            className="neo-container rounded-full w-20 h-20 object-cover mb-2"
                        />
                        <p className="font-bold text-gray-800">{userToAuth?.name || username}</p>
                        <p className="text-sm text-gray-500">{userToAuth?.role || role}</p>
                    </div>
                    <div className="neo-button w-full rounded-full p-2 flex items-center">
                       <PasswordField
                            label=""
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            icon={
                                <div className="neo-container rounded-full p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            }
                        />
                    </div>
                    <div className="flex items-center space-x-4 pt-2">
                        <button type="button" onClick={() => { setLoginStep('enterUser'); setPassword(''); setUserToAuth(null); }} className="neo-button w-full rounded-full p-3 font-semibold text-gray-800">
                            Back
                        </button>
                        <button type="submit" className="neo-button-primary w-full rounded-full p-3 font-semibold">
                            Login
                        </button>
                    </div>
                </form>
            )}
            <div className="text-center mt-6">
                <button 
                  type="button" 
                  onClick={() => setView('inquiry')} 
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                >
                    Have an Inquiry?
                </button>
            </div>

            <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs">Or continue with</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>

            <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="neo-button w-full rounded-full p-3 font-semibold text-gray-700 transition-colors duration-200 flex items-center justify-center text-sm active:scale-95"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.425,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                <span>Sign in with Google</span>
            </button>
        </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <GoogleAccountChooserModal
            isOpen={isGoogleModalOpen}
            onClose={() => setIsGoogleModalOpen(false)}
            onAccountSelect={handleSelectGoogleAccount}
        />
        <div className="w-full max-w-sm">
            <div className="neo-container rounded-3xl p-8">
                <div className="flex flex-col items-center mb-8 text-center">
                    <SchoolLogo 
                        hasLogo={schoolProfile.hasLogo} 
                        alt="School Logo" 
                        className="neo-container rounded-full p-3 mb-4 w-24 h-24 object-cover" 
                        style={{ transform: `scale(${(schoolProfile.logoSize || 100) / 100})` }}
                    />
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-1 whitespace-nowrap animate-pulse-glow">{schoolProfile.name}</h1>
                    <p className="text-md sm:text-lg text-gray-600">{schoolProfile.motto}</p>
                    <p className="text-sm text-gray-500 mt-2">Session {schoolProfile.session}</p>
                    <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-2 w-full">
                        <p>{schoolProfile.schoolAddress}</p>
                        <p>Contact: {schoolProfile.schoolNumber} | ID: {schoolProfile.schoolId}</p>
                    </div>
                </div>

                {view === 'login' ? renderLoginForm() : renderInquiryForm()}
                
                <p className="text-sm text-gray-500 mt-8 text-center">Powered by:-C.B.S.E Board</p>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
