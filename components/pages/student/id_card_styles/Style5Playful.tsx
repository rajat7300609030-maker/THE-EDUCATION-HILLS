import React, { forwardRef } from 'react';
import { Student } from '../../../../types';
import StudentPhoto from '../../../ui/StudentPhoto';

interface CardStyleProps {
  student: Student;
}

const Style5Playful = forwardRef<HTMLDivElement, CardStyleProps>(({ student }, ref) => {
    return (
        <div ref={ref} className="bg-yellow-300 rounded-2xl w-80 h-52 mx-auto overflow-hidden flex p-3 id-card-for-print landscape shadow-lg">
            <div className="w-1/3 flex flex-col items-center justify-center bg-white/60 rounded-xl p-2">
                 <img src="https://placehold.co/40x40/333/FFF?text=Logo" alt="School Logo" className="rounded-full w-10 h-10 mb-2" />
                 <StudentPhoto
                    studentId={student.id}
                    hasPhoto={student.hasPhoto}
                    alt={student.name}
                    className="w-20 h-24 object-cover rounded-lg shadow-md"
                />
            </div>
            <div className="w-2/3 flex flex-col pl-3">
                <div className="text-right">
                    <h1 className="font-extrabold text-sm leading-tight text-gray-800">THE EDUCATION HILLS</h1>
                    <p className="text-[9px] font-bold text-gray-600">STUDENT ID</p>
                </div>
                <div className="flex-grow flex flex-col justify-end text-sm">
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight -mb-1">{student.name.split(' ')[0]}</h2>
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">{student.name.split(' ').slice(1).join(' ')}</h2>
                    <div className="mt-2 space-y-1 text-xs bg-white/60 p-2 rounded-md">
                        <p><span className="font-bold text-gray-600">ID:</span> {student.id}</p>
                        <p><span className="font-bold text-gray-600">Class:</span> {student.class}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Style5Playful;
