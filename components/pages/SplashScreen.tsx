

import React from 'react';
import useSchoolProfile from '../../hooks/useSchoolProfile';
import SchoolLogo from '../ui/SchoolLogo';

const SplashScreen: React.FC = () => {
  const [schoolProfile] = useSchoolProfile();
  
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-transparent transition-opacity duration-1000">
      <div className="neo-container rounded-3xl p-8 text-center flex flex-col items-center max-w-sm w-full">
        <div className="flex flex-col items-center mb-6">
          <SchoolLogo 
              hasLogo={schoolProfile.hasLogo} 
              alt="School Logo" 
              className="neo-container rounded-full p-4 mb-4 w-32 h-32" 
              style={{ transform: `scale(${(schoolProfile.logoSize || 100) / 100})` }}
          />
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 whitespace-nowrap animate-pulse-glow">{schoolProfile.name}</h1>
          <p className="text-lg sm:text-xl">{schoolProfile.motto}</p>
          <p className="text-base sm:text-lg mt-2">Session {schoolProfile.session}</p>
           <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-2 w-full">
                <p>{schoolProfile.schoolAddress}</p>
                <p>Contact: {schoolProfile.schoolNumber} | ID: {schoolProfile.schoolId}</p>
            </div>
        </div>
        <div className="flex flex-col items-center w-full space-y-4">
          <div className="flex justify-center space-x-2">
            <div className="pulse-circle"></div>
            <div className="pulse-circle pulse-circle-2"></div>
            <div className="pulse-circle pulse-circle-3"></div>
          </div>
          <p className="text-sm mt-4">Powered by:-C.B.S.E Board</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;