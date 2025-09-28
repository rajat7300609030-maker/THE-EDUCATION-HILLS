import React, { forwardRef } from 'react';
import { Student } from '../../../../types';
import StudentPhoto from '../../../ui/StudentPhoto';

interface CardStyleProps {
  student: Student;
}

const Style1Classic = forwardRef<HTMLDivElement, CardStyleProps>(({ student }, ref) => {
    return (
        <div ref={ref} className="bg-[#e0e5ec] neo-container rounded-xl w-80 h-52 mx-auto overflow-hidden flex flex-col id-card-for-print landscape">
            {/* Header */}
            <div className="bg-blue-600 text-white p-2 flex items-center space-x-2 flex-shrink-0">
                <img src="https://placehold.co/32x32/ffffff/3B82F6?text=Logo" alt="School Logo" className="rounded-full w-8 h-8" />
                <div>
                    <h1 className="font-extrabold text-sm leading-tight">THE EDUCATION HILLS</h1>
                    <p className="text-[10px] font-light tracking-wide">Knowledge is Power</p>
                </div>
            </div>

            {/* Body */}
            <div className="p-2 flex items-center space-x-3 flex-grow">
                 <div className="flex flex-col items-center flex-shrink-0">
                    <StudentPhoto
                        studentId={student.id}
                        hasPhoto={student.hasPhoto}
                        alt={student.name}
                        className="w-20 h-24 object-cover rounded-md border-2 border-gray-100 shadow-md"
                    />
                 </div>
                 <div className="flex-grow h-full flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-gray-800 leading-tight">{student.name}</h2>
                    <p className="font-medium text-gray-500 text-xs mb-1">Student</p>

                    <div className="w-full space-y-px text-[10px] text-left">
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 w-2/5">Student ID:</span>
                            <span className="font-mono text-gray-800 w-3/5 text-right">{student.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 w-2/5">Class:</span>
                            <span className="font-medium text-gray-800 w-3/5 text-right">{student.class}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 w-2/5">Father:</span>
                            <span className="font-medium text-gray-800 w-3/5 text-right">{student.fatherName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-600 w-2/5">Contact:</span>
                            <span className="font-medium text-gray-800 w-3/5 text-right">{student.contactNumber}</span>
                        </div>
                    </div>
                 </div>
            </div>

             {/* Footer */}
            <div className="w-full text-center bg-gray-100 border-t py-1 flex-shrink-0">
                <p className="text-[9px] text-gray-500">Session 2025-2026 | Valid till: March 2026</p>
            </div>
        </div>
    );
});

export default Style1Classic;
