import React, { useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';
import { useNavigation } from '../../../contexts/NavigationContext';

const LatePaymentStudentCard: React.FC<{ student: Student; lastPaymentDate: string; onClick: () => void }> = ({ student, lastPaymentDate, onClick }) => {
    const feesPaid = student.feesPaid || 0;
    const totalFees = student.totalFees || 0;
    const balance = totalFees - feesPaid;

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div onClick={onClick} className="neo-container neo-card-hover rounded-xl p-4 flex flex-col transition-all duration-200 cursor-pointer border-l-4 border-orange-500">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="neo-container rounded-full w-14 h-14 object-cover" />
                    <div>
                        <p className="font-bold text-gray-800 text-lg">{student.name}</p>
                        <p className="text-xs text-gray-600">S/o: {student.fatherName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">ID: {student.id} | Class: {student.class}</p>
                    </div>
                </div>
                 <div className="text-right">
                     <p className="text-xs font-semibold text-orange-600">Last Payment On</p>
                     <p className="font-bold text-sm text-gray-700">{formatDate(lastPaymentDate)}</p>
                 </div>
            </div>
            <div className="space-y-3 mt-2">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div><p className="text-gray-500 text-xs">Total</p><p className="font-bold text-blue-600">{formatCurrency(totalFees)}</p></div>
                    <div><p className="text-gray-500 text-xs">Paid</p><p className="font-bold text-green-600">{formatCurrency(feesPaid)}</p></div>
                    <div><p className="text-gray-500 text-xs">Balance</p><p className="font-bold text-red-600">{formatCurrency(balance)}</p></div>
                </div>
            </div>
        </div>
    );
};


const LatePaymentStudentsPage: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
    const { navigate } = useNavigation();

    const latePaymentStudents = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lateStudents: { student: Student; lastPaymentDate: string }[] = [];

        students.forEach(student => {
            if (student.isDeleted) return;

            const balance = (student.totalFees || 0) - (student.feesPaid || 0);
            if (balance <= 0) return; // No dues, not late

            if (!student.paymentHistory || student.paymentHistory.filter(p => !p.isDeleted).length === 0) {
                // If there's a balance but no payment history, we can't determine the due date.
                // For this implementation, we will skip them. A more advanced system might have a session start date.
                return;
            }
            
            const validPayments = student.paymentHistory.filter(p => !p.isDeleted);
            const mostRecentPayment = validPayments.reduce((latest, current) => {
                return new Date(current.date) > new Date(latest.date) ? current : latest;
            });

            if (new Date(mostRecentPayment.date) < thirtyDaysAgo) {
                lateStudents.push({ student, lastPaymentDate: mostRecentPayment.date });
            }
        });
        
        // Sort by last payment date, oldest first
        return lateStudents.sort((a, b) => new Date(a.lastPaymentDate).getTime() - new Date(b.lastPaymentDate).getTime());

    }, [students]);
    
    const handleCardClick = (studentId: string) => {
        navigate(Page.FeesPaymentPage, studentId);
    };

    return (
        <PageWrapper page={Page.LatePaymentStudentsPage}>
             {latePaymentStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {latePaymentStudents.map(({ student, lastPaymentDate }) => (
                        <LatePaymentStudentCard 
                            key={student.id} 
                            student={student} 
                            lastPaymentDate={lastPaymentDate} 
                            onClick={() => handleCardClick(student.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="neo-container rounded-xl p-8 text-center text-gray-500">
                    <p className="font-semibold text-lg">No Late Payments Found</p>
                    <p>All students with pending fees have made a payment within the last 30 days.</p>
                </div>
            )}
        </PageWrapper>
    );
};

export default LatePaymentStudentsPage;