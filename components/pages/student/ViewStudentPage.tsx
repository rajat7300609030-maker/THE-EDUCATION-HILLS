import React, { useState, useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student, PaymentRecord } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
import StudentPhoto from '../../ui/StudentPhoto';
import { getInitialStudents } from '../../../utils/seedData';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { useNotification } from '../../../contexts/NavigationContext';
import EditStudentModal from '../../ui/EditStudentModal';
import PrintIdCardModal from '../../ui/PrintIdCardModal';
import PrintFeesCardModal from '../../ui/PrintFeesCardModal';
import useUserProfile from '../../../hooks/useUserProfile';

const StudentProfilePage: React.FC = () => {
    const { currentPage, navigate, goBack } = useNavigation();
    const [students, setStudents] = useLocalStorage<Student[]>('students', getInitialStudents);
    const { addNotification } = useNotification();
    const [userProfile] = useUserProfile();

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isIdCardModalOpen, setIdCardModalOpen] = useState(false);
    const [isFeesCardModalOpen, setFeesCardModalOpen] = useState(false);

    const student = students.find(s => s.id === currentPage.data);

    const handleSaveStudent = (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        setEditModalOpen(false);
    };

    const handleDeleteStudent = () => {
        if (!student) return;
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isDeleted: true } : s));
        addNotification(`Student "${student.name}" moved to Recycle Bin.`, 'danger');
        goBack();
    };

    const handleSendReminder = () => {
        if (!student) return;
        addNotification(`Fee reminder sent to ${student.name} via SMS.`, 'success');
    };

    const feesPaid = student?.feesPaid || 0;
    const totalFees = student?.totalFees || 0;
    const balance = totalFees - feesPaid;
    const progress = totalFees > 0 ? (feesPaid / totalFees) * 100 : 0;
    const getProgressColor = () => {
        if (progress >= 100) return 'bg-green-500';
        if (progress > 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (!student) {
        return (
            <PageWrapper page={Page.ViewStudent}>
                <div className="text-center text-red-500">Student not found.</div>
                <button onClick={goBack} className="neo-button w-full rounded-xl p-3 text-lg font-semibold text-gray-800 mt-4">Back</button>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper page={Page.ViewStudent}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="neo-container rounded-xl p-6 text-center">
                        <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="neo-container rounded-full w-24 h-24 object-cover mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                        <p className="text-sm text-gray-500">ID: {student.id} | Class: {student.class}</p>
                    </div>

                    <div className="neo-container rounded-xl p-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 px-2">Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {userProfile.role !== 'Student' && (
                                <ActionButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} label="Edit Student" onClick={() => setEditModalOpen(true)} />
                            )}
                            {userProfile.role === 'Admin' && (
                                <ActionButton icon={<span className="font-bold text-blue-500">₹</span>} label="Pay Fees" onClick={() => navigate(Page.FeesPaymentPage, student.id)} />
                            )}
                            <ActionButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>} label="Print ID Card" onClick={() => setIdCardModalOpen(true)} />
                            <ActionButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} label="Print Fees Card" onClick={() => setFeesCardModalOpen(true)} />
                            {userProfile.role !== 'Student' && (
                                <ActionButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} label="Send Reminder" onClick={handleSendReminder} />
                            )}
                             {userProfile.role === 'Admin' && (
                                <ActionButton icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} label="Delete Student" onClick={() => setDeleteModalOpen(true)} />
                            )}
                        </div>
                    </div>

                    <div className="neo-container rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Father's Name" value={student.fatherName} />
                            <InfoRow label="Mother's Name" value={student.motherName} />
                            <InfoRow label="Date of Birth" value={student.dob} />
                            <InfoRow label="Gender" value={student.gender} />
                            <InfoRow label="Religion" value={student.religion} />
                            <InfoRow label="Category" value={student.category} />
                            <InfoRow label="Cast" value={student.cast} />
                            <InfoRow label="Contact Number" value={student.contactNumber} />
                            <InfoRow label="Transport" value={student.transportNeeded ? `Yes (${student.transportDetails || 'Details not provided'})` : 'No'} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="neo-container rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Fees Summary</h3>
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                            <StatCard label="Total Fees" value={`₹${totalFees.toLocaleString()}`} color="text-blue-600" />
                            <StatCard label="Fees Paid" value={`₹${feesPaid.toLocaleString()}`} color="text-green-600" />
                            <StatCard label="Balance Due" value={`₹${balance.toLocaleString()}`} color="text-red-600" />
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 neo-button"><div className={`${getProgressColor()} h-4 rounded-full`} style={{ width: `${progress}%` }}></div></div>
                    </div>

                    <div className="neo-container rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Payment History</h3>
                        <div className="max-h-96 overflow-y-auto">
                            {student.paymentHistory && student.paymentHistory.filter(p => !p.isDeleted).length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-gray-700 uppercase"><tr className="border-b-2"><th className="py-2 px-1">Date</th><th className="py-2 px-1">Receipt</th><th className="py-2 px-1">Type</th><th className="py-2 px-1 text-right">Amount</th></tr></thead>
                                    <tbody>
                                        {student.paymentHistory.filter(p => !p.isDeleted).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                                            <tr key={p.receiptNumber} className="border-b"><td className="py-2 px-1">{new Date(p.date).toLocaleDateString()}</td><td className="py-2 px-1 font-mono">{p.receiptNumber}</td><td className="py-2 px-1">{p.feesType}</td><td className="py-2 px-1 text-right font-semibold">₹{p.amount.toLocaleString()}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="text-center text-gray-500 py-4">No payment history found.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <EditStudentModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSave={handleSaveStudent} student={student} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteStudent} title="Delete Student" message={<>Are you sure you want to move <strong>{student.name}</strong> to the recycle bin?</>} confirmText="Delete" variant="danger" />
            <PrintIdCardModal isOpen={isIdCardModalOpen} onClose={() => setIdCardModalOpen(false)} student={student} />
            <PrintFeesCardModal isOpen={isFeesCardModalOpen} onClose={() => setFeesCardModalOpen(false)} student={student} />
        </PageWrapper>
    );
};

const ActionButton: React.FC<{ icon: JSX.Element; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="neo-button p-3 rounded-lg flex flex-col items-center justify-center text-center text-xs font-semibold space-y-1 hover:text-blue-600 transition-colors">
        {icon}
        <span>{label}</span>
    </button>
);

const InfoRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div>
        <p className="font-semibold text-gray-500">{label}</p>
        <p className="text-gray-800">{value || 'N/A'}</p>
    </div>
);

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-bold text-lg ${color}`}>{value}</p>
    </div>
);

export default StudentProfilePage;