import React, { forwardRef } from 'react';
import { Student } from '../../../../types';
import StudentPhoto from '../../../ui/StudentPhoto';

interface CardStyleProps {
  student: Student;
}

const Style3VibrantGradient = forwardRef<HTMLDivElement, CardStyleProps>(({ student }, ref) => {
    return (
        <div ref={ref} className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl w-80 h-52 mx-auto overflow-hidden flex flex-col id-card-for-print landscape shadow-lg">
            {/* Header */}
            <div className="p-2 text-center flex-shrink-0">
                <h1 className="font-extrabold text-sm leading-tight tracking-wider">THE EDUCATION HILLS</h1>
            </div>

            {/* Body */}
            <div className="p-3 flex items-center space-x-4 flex-grow">
                 <div className="flex flex-col items-center flex-shrink-0">
                    <StudentPhoto
                        studentId={student.id}
                        hasPhoto={student.hasPhoto}
                        alt={student.name}
                        className="w-24 h-24 object-cover rounded-full border-4 border-white/50 shadow-md"
                    />
                 </div>
                 <div className="flex-grow h-full flex flex-col justify-center">
                    <h2 className="text-xl font-bold leading-tight">{student.name}</h2>
                    
                    <div className="w-full space-y-px text-xs text-left mt-2">
                         <p><span className="font-semibold opacity-80">ID:</span> <span className="font-mono">{student.id}</span></p>
                         <p><span className="font-semibold opacity-80">Class:</span> {student.class}</p>
                         <p><span className="font-semibold opacity-80">Father:</span> {student.fatherName}</p>
                    </div>
                 </div>
            </div>

             {/* Footer */}
            <div className="w-full text-center bg-black/20 py-1 flex-shrink-0">
                <p className="text-[9px] font-light">Session 2025-2026</p>
            </div>
        </div>
    );
});

export default Style3VibrantGradient;
