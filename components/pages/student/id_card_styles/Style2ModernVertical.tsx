import React, { forwardRef } from 'react';
import { Student } from '../../../../types';
import StudentPhoto from '../../../ui/StudentPhoto';

interface CardStyleProps {
  student: Student;
}

const Style2ModernVertical = forwardRef<HTMLDivElement, CardStyleProps>(({ student }, ref) => {
    return (
        <div ref={ref} className="bg-white neo-container rounded-xl w-52 h-80 mx-auto overflow-hidden flex flex-col id-card-for-print portrait">
            {/* Photo Section */}
            <div className="flex-shrink-0 h-2/5 flex items-center justify-center bg-gray-200">
                 <StudentPhoto
                    studentId={student.id}
                    hasPhoto={student.hasPhoto}
                    alt={student.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Details Section */}
            <div className="p-3 flex-grow flex flex-col items-center text-center">
                <h2 className="text-lg font-bold text-gray-900 leading-tight mt-1">{student.name}</h2>
                <p className="font-medium text-gray-500 text-xs mb-3">Student ID: {student.id}</p>
                
                <div className="w-full border-t border-gray-200 pt-3 mt-auto space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Class:</span>
                        <span className="font-medium text-gray-800">{student.class}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">D.O.B:</span>
                        <span className="font-medium text-gray-800">{student.dob}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Contact:</span>
                        <span className="font-medium text-gray-800">{student.contactNumber}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-800 text-white p-2 text-center flex-shrink-0">
                <h1 className="font-bold text-sm leading-tight">THE EDUCATION HILLS</h1>
                <p className="text-[9px] font-light">Session 2025-2026</p>
            </div>
        </div>
    );
});

export default Style2ModernVertical;
