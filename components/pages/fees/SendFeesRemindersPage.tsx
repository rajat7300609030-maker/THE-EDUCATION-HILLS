import React, { useState, useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialStudents } from '../../../utils/seedData';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../../contexts/NavigationContext';
import StudentPhoto from '../../ui/StudentPhoto';
import ConfirmationModal from '../../ui/ConfirmationModal';

const SendFeesRemindersPage: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
    const { addNotification } = useNotification();

    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const studentsWithDues = useMemo(() => {
        return students.filter(s => !s.isDeleted && (s.totalFees || 0) > (s.feesPaid || 0));
    }, [students]);

    const uniqueClasses = useMemo(() => {
        const classSet = new Set(studentsWithDues.map(s => s.class).filter(Boolean));
        return ['All Classes', ...Array.from(classSet).sort()];
    }, [studentsWithDues]);

    const filteredStudents = useMemo(() => {
        return studentsWithDues.filter(student => (selectedClass === 'All Classes' || student.class === selectedClass));
    }, [studentsWithDues, selectedClass]);

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    const handleSendReminder = (student: Student) => {
        const balance = (student.totalFees || 0) - (student.feesPaid || 0);

        const message = `Dear Parent of ${student.name} (S/o ${student.fatherName}, Class: ${student.class}),

This is a friendly reminder from The Education Hills regarding pending school fees for the session 2025-26.

*Student Details:*
- Name: ${student.name}
- Class: ${student.class}

*Fee Summary:*
- Total Fees: ${formatCurrency(student.totalFees)}
- Fees Paid: ${formatCurrency(student.feesPaid || 0)}
- *Balance Due: ${formatCurrency(balance)}*

Kindly clear the outstanding dues at your earliest convenience. You can contact the school office for any queries.

Thank you,
The Education Hills`;

        let phoneNumber = (student.contactNumber || '').replace(/\D/g, '');
        if (phoneNumber.length === 10) {
            phoneNumber = '91' + phoneNumber; // Prepending country code for India
        }

        if (!phoneNumber) {
            addNotification(`No valid contact number found for ${student.name}.`, 'danger');
            return;
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        addNotification(`Opening WhatsApp for ${student.name}...`, 'info');
    };

    const handleSendToAll = () => {
        setIsBulkModalOpen(true);
    };

    return (
        <PageWrapper page={Page.SendFeesReminders}>
            <div className="space-y-6">
                {/* Filter and Actions */}
                <div className="neo-container rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative w-full sm:w-1/3">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none"
                        >
                            {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    <button
                        onClick={handleSendToAll}
                        disabled={filteredStudents.length === 0}
                        className="neo-button-primary w-full sm:w-auto rounded-xl px-6 py-3 text-base font-semibold flex items-center justify-center space-x-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Send to All ({filteredStudents.length})</span>
                    </button>
                </div>

                {/* Student List */}
                <div className="neo-container rounded-xl p-4">
                    <div className="max-h-[60vh] overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase sticky top-0 bg-[#e0e5ec] z-10">
                                    <tr>
                                        <th className="py-2 px-4 font-bold">Student</th>
                                        <th className="py-2 px-4 font-bold hidden sm:table-cell">Class</th>
                                        <th className="py-2 px-4 font-bold hidden md:table-cell">Contact</th>
                                        <th className="py-2 px-4 font-bold text-right">Balance Due</th>
                                        <th className="py-2 px-4 font-bold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => {
                                        const balance = (student.totalFees || 0) - (student.feesPaid || 0);
                                        return (
                                            <tr key={student.id} className="border-t border-gray-200">
                                                <td className="py-2 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="w-10 h-10 rounded-full object-cover neo-container" />
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{student.name}</p>
                                                            <p className="font-mono text-xs text-gray-500">{student.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 hidden sm:table-cell">{student.class}</td>
                                                <td className="py-2 px-4 hidden md:table-cell">{student.contactNumber || 'N/A'}</td>
                                                <td className="py-2 px-4 text-right font-bold text-red-600">{formatCurrency(balance)}</td>
                                                <td className="py-2 px-4 text-center">
                                                    <button
                                                        onClick={() => handleSendReminder(student)}
                                                        className="neo-button rounded-full p-2 text-green-500 hover:text-green-700"
                                                        title="Send WhatsApp Reminder"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No students with pending fees found for the selected criteria.</p>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onConfirm={() => setIsBulkModalOpen(false)}
                title="Feature Information"
                message="Bulk messaging via WhatsApp requires a premium integration with the WhatsApp Business API to avoid account restrictions. This feature is not available in the current version."
                confirmText="OK"
                cancelText={null}
                variant="success"
            />
        </PageWrapper>
    );
};

export default SendFeesRemindersPage;