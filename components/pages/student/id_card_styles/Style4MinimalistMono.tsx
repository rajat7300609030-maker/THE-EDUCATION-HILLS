import React, { forwardRef } from 'react';
import { Student } from '../../../../types';
import StudentPhoto from '../../../ui/StudentPhoto';

interface CardStyleProps {
  student: Student;
}

const Style4MinimalistMono = forwardRef<HTMLDivElement, CardStyleProps>(({ student }, ref) => {
    return (
        <div ref={ref} className="bg-white border-2 border-gray-900 rounded-lg w-52 h-80 mx-auto overflow-hidden flex flex-col id-card-for-print portrait">
            {/* Header */}
            <div className="p-3 text-center border-b-2 border-gray-900 flex-shrink-0">
                <h1 className="font-black text-xs leading-tight tracking-[0.2em] uppercase">The Education Hills</h1>
            </div>
            
            {/* Photo Section */}
            <div className="p-4 flex-shrink-0 flex items-center justify-center">
                 <StudentPhoto
                    studentId={student.id}
                    hasPhoto={student.hasPhoto}
                    alt={student.name}
                    className="w-28 h-36 object-cover grayscale"
                />
            </div>

            {/* Details Section */}
            <div className="px-4 pb-4 flex-grow flex flex-col items-center text-center">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{student.name}</h2>
                <p className="font-mono text-gray-600 text-xs mb-3">ID: {student.id}</p>
                
                <div className="w-full border-t border-gray-300 pt-3 mt-auto space-y-1.5 text-xs">
                    <p><span className="font-semibold text-gray-500">CLASS:</span> {student.class}</p>
                    <p><span className="font-semibold text-gray-500">CONTACT:</span> {student.contactNumber}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white p-1 text-center flex-shrink-0">
                <p className="text-[9px] font-light tracking-widest">2025-2026</p>
            </div>
        </div>
    );
});

export default Style4MinimalistMono;
