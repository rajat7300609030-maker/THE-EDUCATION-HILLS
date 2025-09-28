import React, { forwardRef } from 'react';
import { UserProfile } from '../../../../types';
import ProfilePhoto from '../../../ui/ProfilePhoto';
import useSchoolProfile from '../../../../hooks/useSchoolProfile';
import SchoolLogo from '../../../ui/SchoolLogo';

interface CardStyleProps {
  employee: UserProfile;
}

const EmployeeStyle1Classic = forwardRef<HTMLDivElement, CardStyleProps>(({ employee }, ref) => {
    const [schoolProfile] = useSchoolProfile();
    
    return (
        <div ref={ref} className="bg-[#e0e5ec] neo-container rounded-xl w-80 h-52 mx-auto overflow-hidden flex flex-col id-card-for-print landscape">
            {/* Header */}
            <div className="bg-blue-600 text-white p-2 flex items-center space-x-2 flex-shrink-0">
                <SchoolLogo hasLogo={schoolProfile.hasLogo} alt="School Logo" className="rounded-full w-8 h-8 object-cover" />
                <div>
                    <h1 className="font-extrabold text-sm leading-tight">{schoolProfile.name}</h1>
                    <p className="text-[10px] font-light tracking-wide">{schoolProfile.motto}</p>
                </div>
            </div>

            {/* Body */}
            <div className="p-2 flex items-center space-x-3 flex-grow">
                 <div className="flex flex-col items-center flex-shrink-0">
                    <ProfilePhoto
                        userId={employee.userId}
                        hasPhoto={employee.hasPhoto}
                        alt={employee.name}
                        className="w-20 h-24 object-cover rounded-md border-2 border-gray-100 shadow-md"
                    />
                 </div>
                 <div className="flex-grow h-full flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-gray-800 leading-tight">{employee.name}</h2>
                    <p className="font-medium text-gray-500 text-xs mb-1">{employee.role}</p>

                    <div className="w-full space-y-px text-[10px] text-left">
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 w-2/5">Employee ID:</span>
                            <span className="font-mono text-gray-800 w-3/5 text-right">{employee.userId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 w-2/5">D.O.B:</span>
                            <span className="font-medium text-gray-800 w-3/5 text-right">{new Date(employee.dob).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 w-2/5">Contact:</span>
                            <span className="font-medium text-gray-800 w-3/5 text-right">{employee.phone}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 w-2/5">Email:</span>
                            <span className="font-medium text-gray-800 w-3/5 text-right truncate">{employee.email}</span>
                        </div>
                    </div>
                 </div>
            </div>

             {/* Footer */}
            <div className="w-full text-center bg-gray-100 border-t py-1 flex-shrink-0">
                <p className="text-[9px] text-gray-500">{schoolProfile.schoolAddress}</p>
            </div>
        </div>
    );
});

export default EmployeeStyle1Classic;