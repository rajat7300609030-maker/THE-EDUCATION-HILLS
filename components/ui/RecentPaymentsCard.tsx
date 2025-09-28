import React, { useMemo, useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { getInitialStudents } from '../../utils/seedData';
import { Page, PaymentRecord, Student } from '../../types';
import StudentPhoto from './StudentPhoto';
import { useNavigation } from '../../contexts/NavigationContext';

interface AugmentedPayment extends PaymentRecord {
    studentId: string;
    studentName: string;
    studentHasPhoto: boolean;
}

const RecentPaymentsCard: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
    const { navigate } = useNavigation();
    const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All Classes');

    const uniqueClasses = useMemo(() => {
        const classSet = new Set(students.filter(s => !s.isDeleted && s.class).map(s => s.class));
        return ['All Classes', ...Array.from(classSet).sort()];
    }, [students]);
    
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    const recentPayments = useMemo<AugmentedPayment[]>(() => {
        const allPayments: AugmentedPayment[] = [];
        students.forEach(student => {
            if (student.paymentHistory && !student.isDeleted) {
                student.paymentHistory.forEach(record => {
                    if (!record.isDeleted) {
                        allPayments.push({
                            ...record,
                            studentId: student.id,
                            studentName: student.name,
                            studentHasPhoto: student.hasPhoto,
                        });
                    }
                });
            }
        });

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const filteredPayments = allPayments
            .filter(payment => {
                const nameMatch = payment.studentName.toLowerCase().includes(studentSearchTerm.toLowerCase());
                const student = studentMap.get(payment.studentId);
                const classMatch = selectedClass === 'All Classes' || (student && student.class === selectedClass);
                return nameMatch && classMatch;
            })
            .filter(payment => {
                const paymentDate = new Date(payment.date);
                if (timeFilter === 'today') return paymentDate >= today;
                if (timeFilter === 'week') return paymentDate >= startOfWeek;
                if (timeFilter === 'month') return paymentDate >= startOfMonth;
                return true; // 'all' case
            });


        return filteredPayments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7); // Show the 7 most recent payments
    }, [students, timeFilter, studentSearchTerm, selectedClass, studentMap]);

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
    });

    const TimeFilterButton: React.FC<{
        label: string;
        filterValue: typeof timeFilter;
    }> = ({ label, filterValue }) => (
        <button
            onClick={() => setTimeFilter(filterValue)}
            className={`neo-button rounded-full px-3 py-1 text-xs font-semibold transition-all ${timeFilter === filterValue ? 'active' : ''}`}
        >
            {label}
        </button>
    );

    return (
        <div className="neo-container rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">
                <h3 className="text-lg font-bold">Recent Payments</h3>
                <button
                    onClick={() => navigate(Page.AllStudentsFeesPage)}
                    className="neo-button rounded-xl px-3 py-1 text-xs font-semibold text-blue-600"
                >
                    View All
                </button>
            </div>
            
            <div className="space-y-4 my-4">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                     <div className="relative w-full sm:w-1/2">
                        <input
                            type="text"
                            placeholder="Filter by student name..."
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                            className="neo-button w-full rounded-xl p-2.5 pl-9 text-gray-700 text-sm focus:outline-none"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-1/2">
                        <select 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)} 
                            className="neo-button w-full rounded-xl p-2.5 text-gray-700 text-sm appearance-none"
                        >
                            {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                           <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                    <TimeFilterButton label="All Time" filterValue="all" />
                    <TimeFilterButton label="Today" filterValue="today" />
                    <TimeFilterButton label="This Week" filterValue="week" />
                    <TimeFilterButton label="This Month" filterValue="month" />
                </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentPayments.length > 0 ? (
                    recentPayments.map(payment => (
                        <div key={payment.receiptNumber} className="neo-button p-3 rounded-lg flex items-center justify-between space-x-3">
                            <div className="flex items-center space-x-3 min-w-0">
                                <StudentPhoto
                                    studentId={payment.studentId}
                                    hasPhoto={payment.studentHasPhoto}
                                    alt={payment.studentName}
                                    className="neo-container rounded-full w-10 h-10 object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="font-semibold truncate text-gray-800">{payment.studentName}</p>
                                    <p className="text-xs text-gray-500">{payment.feesType}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                                <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-4">No payments found for the selected filters.</p>
                )}
            </div>
        </div>
    );
};

export default RecentPaymentsCard;