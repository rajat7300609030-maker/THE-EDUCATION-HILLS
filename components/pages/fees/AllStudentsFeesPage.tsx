import React, { useState, useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';
import { useNavigation } from '../../../contexts/NavigationContext';

type FeeStatus = 'All' | 'Paid' | 'Partially Paid' | 'Unpaid';

const StudentFeeCard: React.FC<{ student: Student; onClick: () => void }> = ({ student, onClick }) => {
    const feesPaid = student.feesPaid || 0;
    const totalFees = student.totalFees || 0;
    const balance = totalFees - feesPaid;
    const progress = totalFees > 0 ? (feesPaid / totalFees) * 100 : 0;

    const getStatus = (): { text: string, color: string } => {
        if (totalFees <= 0) return { text: 'N/A', color: 'bg-gray-400' };
        if (progress >= 100) return { text: 'Paid', color: 'bg-green-500' };
        if (progress >= 75) return { text: 'Almost Paid', color: 'bg-teal-500' };
        if (progress >= 50) return { text: 'Partially Paid', color: 'bg-yellow-500' };
        if (progress >= 25) return { text: 'Significant Dues', color: 'bg-orange-500' };
        if (progress > 0) return { text: 'Minimal Payment', color: 'bg-red-400' };
        return { text: 'Unpaid', color: 'bg-red-500' };
    };

    const { text: statusText, color: statusColor } = getStatus();

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div onClick={onClick} className="neo-container neo-card-hover rounded-xl p-4 flex flex-col transition-all duration-200 cursor-pointer">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="neo-container rounded-full w-14 h-14 object-cover" />
                    <div>
                        <p className="font-bold text-gray-800 text-lg">{student.name}</p>
                        <p className="text-xs text-gray-600">S/o: {student.fatherName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">ID: {student.id} | Class: {student.class}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold text-white px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
            </div>
            <div className="space-y-3 mt-2">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div><p className="text-gray-500 text-xs">Total</p><p className="font-bold text-blue-600">{formatCurrency(totalFees)}</p></div>
                    <div><p className="text-gray-500 text-xs">Paid</p><p className="font-bold text-green-600">{formatCurrency(feesPaid)}</p></div>
                    <div><p className="text-gray-500 text-xs">Balance</p><p className="font-bold text-red-600">{formatCurrency(balance)}</p></div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 neo-button">
                        <div className={`${statusColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-12 text-right">{progress.toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
};


const AllStudentsFeesPage: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [selectedStatus, setSelectedStatus] = useState<FeeStatus>('All');
    const { navigate } = useNavigation();

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

    const handleCardClick = (studentId: string) => {
        navigate(Page.FeesPaymentPage, studentId);
    };

    return (
        <PageWrapper page={Page.AllStudentsFeesPage}>
            {/* Filter Controls */}
            <div className="neo-container rounded-xl p-4 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div className="relative md:col-span-1">
                         <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="neo-button w-full rounded-xl p-3 pl-10 text-gray-700" />
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                    </div>
                     {/* Class Filter */}
                    <div className="relative md:col-span-1">
                        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                            {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                    </div>
                    {/* Status Filter */}
                    <div className="relative md:col-span-1">
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as FeeStatus)} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                            <option value="All">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                    </div>
                </div>
            </div>

            {/* Student Cards Grid */}
            {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <StudentFeeCard key={student.id} student={student} onClick={() => handleCardClick(student.id)} />
                    ))}
                </div>
            ) : (
                <div className="neo-container rounded-xl p-8 text-center text-gray-500">
                    <p>No students match the current filters.</p>
                </div>
            )}
        </PageWrapper>
    );
};

export default AllStudentsFeesPage;