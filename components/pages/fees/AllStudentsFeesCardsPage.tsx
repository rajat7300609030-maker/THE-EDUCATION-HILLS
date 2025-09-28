import React, { useState, useMemo, useRef } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';
import { useNavigation } from '../../../contexts/NavigationContext';

// Declare html2canvas to avoid TypeScript errors since it's loaded from a script tag.
declare const html2canvas: any;

type FeeStatusFilter = 'All' | 'Paid' | 'Partially Paid' | 'Unpaid';

const FeeCard = React.forwardRef<HTMLDivElement, { student: Student }>(({ student }, ref) => {
    const feesPaid = student.feesPaid || 0;
    const totalFees = student.totalFees || 0;
    const balance = totalFees - feesPaid;
    const progress = totalFees > 0 ? (feesPaid / totalFees) * 100 : 0;

    const getStatus = (): { text: string; color: string; stampColor: string } => {
        if (totalFees <= 0) return { text: 'N/A', color: 'bg-gray-400', stampColor: 'text-gray-400' };
        if (balance <= 0) return { text: 'PAID', color: 'bg-green-500', stampColor: 'text-green-500' };
        if (feesPaid > 0) return { text: 'PARTIALLY PAID', color: 'bg-yellow-500', stampColor: 'text-yellow-500' };
        return { text: 'UNPAID', color: 'bg-red-500', stampColor: 'text-red-500' };
    };

    const { text: statusText, color: progressColor, stampColor } = getStatus();
    const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString('en-IN')}`;

    return (
        <div ref={ref} className="fee-card-for-print neo-container rounded-2xl w-full max-w-md mx-auto overflow-hidden flex flex-col transition-all duration-200 bg-slate-50">
            <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <img src="https://placehold.co/32x32/3B82F6/FFF?text=Logo" alt="School Logo" className="w-8 h-8 rounded-full" />
                    <div>
                        <h1 className="font-extrabold text-sm text-gray-800">THE EDUCATION HILLS</h1>
                        <p className="text-[10px] text-gray-500">FEES STATUS REPORT</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600">Session</p>
                    <p className="text-sm font-bold text-gray-800">2025-26</p>
                </div>
            </div>

            <div className="p-4 flex-grow flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="flex flex-col items-center flex-shrink-0">
                    <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="w-24 h-28 object-cover rounded-md border-2 border-white shadow-md" />
                </div>
                <div className="flex-grow">
                    <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                    <p className="text-sm text-gray-600">S/o: {student.fatherName}</p>
                    <div className="flex text-xs text-gray-500 space-x-2">
                        <span>ID: {student.id}</span>
                        <span>|</span>
                        <span>Class: {student.class}</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between items-center bg-blue-50 p-2 rounded-md"><span className="font-semibold text-blue-800">Total Fees:</span><span className="font-bold text-lg text-blue-800">{formatCurrency(totalFees)}</span></div>
                        <div className="flex justify-between items-center bg-green-50 p-2 rounded-md"><span className="font-semibold text-green-800">Total Paid:</span><span className="font-bold text-lg text-green-800">{formatCurrency(feesPaid)}</span></div>
                        <div className="flex justify-between items-center bg-red-50 p-2 rounded-md"><span className="font-semibold text-red-800">Balance Due:</span><span className="font-bold text-lg text-red-800">{formatCurrency(balance)}</span></div>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between space-x-4">
                <div className="w-full">
                    <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 neo-button"><div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div></div>
                        <span className="text-xs font-bold text-gray-600 w-12 text-right">{progress.toFixed(0)}%</span>
                    </div>
                </div>
                <div className={`text-center font-black text-2xl uppercase opacity-20 -rotate-12 ${stampColor} select-none`}>{statusText}</div>
            </div>
        </div>
    );
});

const FeeCardWrapper: React.FC<{ student: Student }> = ({ student }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { navigate } = useNavigation();

    const handleDownload = () => {
        if (cardRef.current && typeof html2canvas === 'function') {
            html2canvas(cardRef.current, { useCORS: true, scale: 2 })
                .then((canvas: HTMLCanvasElement) => {
                    const link = document.createElement('a');
                    link.download = `Fees_Card_${student.name.replace(/\s+/g, '_')}_${student.id}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
        }
    };

    const handleCardClick = () => {
        navigate(Page.FeesPaymentPage, student.id);
    };

    return (
        <div className="fee-card-container">
            <div className="cursor-pointer" onClick={handleCardClick}>
                <FeeCard ref={cardRef} student={student} />
            </div>
            <div className="mt-4 flex justify-center no-print">
                <button 
                    onClick={handleDownload} 
                    className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                </button>
            </div>
        </div>
    );
};


const AllStudentsFeesCardsPage: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [selectedStatus, setSelectedStatus] = useState<FeeStatusFilter>('All');
    
    const uniqueClasses = useMemo(() => {
        const classSet = new Set(students.filter(s => !s.isDeleted && s.class).map(s => s.class));
        return ['All Classes', ...Array.from(classSet).sort()];
    }, [students]);

    const filteredStudents = useMemo(() => {
        return students
            .filter(s => !s.isDeleted)
            .filter(student => (selectedClass === 'All Classes' || student.class === selectedClass))
            .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(student => {
                if (selectedStatus === 'All') return true;
                const feesPaid = student.feesPaid || 0;
                const totalFees = student.totalFees || 0;
                const balance = totalFees - feesPaid;
                if (selectedStatus === 'Paid') return balance <= 0 && totalFees > 0;
                if (selectedStatus === 'Partially Paid') return feesPaid > 0 && balance > 0;
                if (selectedStatus === 'Unpaid') return feesPaid === 0 && totalFees > 0;
                return false;
            });
    }, [students, searchTerm, selectedClass, selectedStatus]);
    
    const handlePrintAll = () => window.print();

    return (
        <PageWrapper page={Page.AllStudentsFeesCardsPage}>
            <div className="mb-8 p-4 neo-container rounded-2xl space-y-6 no-print">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="neo-button w-full rounded-xl p-3 pl-10 text-gray-700" />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                    </div>
                    <div className="relative">
                        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                            {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                    </div>
                    <div className="relative">
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as FeeStatusFilter)} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                            <option value="All">All Statuses</option><option value="Paid">Paid</option><option value="Partially Paid">Partially Paid</option><option value="Unpaid">Unpaid</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                    </div>
                </div>
                <div className="flex justify-end border-t border-gray-300 pt-4">
                    <button onClick={handlePrintAll} className="neo-button rounded-xl px-6 py-3 text-base font-semibold text-gray-700 flex items-center space-x-2 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        <span>Print All</span>
                    </button>
                </div>
            </div>

            <div id="printable-area">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <FeeCardWrapper key={student.id} student={student} />
                        ))
                    ) : (
                        <div className="col-span-full neo-container rounded-xl p-8 text-center">
                            <p className="text-lg font-semibold text-gray-700">No Students Found</p>
                            <p className="text-sm text-gray-500 mt-2">Please adjust your search term or filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default AllStudentsFeesCardsPage;