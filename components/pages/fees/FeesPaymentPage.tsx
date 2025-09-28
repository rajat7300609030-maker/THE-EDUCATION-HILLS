import React, { useState, useMemo, useEffect, useRef } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student, PaymentRecord } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../../contexts/NavigationContext';
import { getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';
import { useNavigation } from '../../../contexts/NavigationContext';
import FormField from '../../ui/FormField';
import ConfirmationModal from '../../ui/ConfirmationModal';
import EditPaymentModal from '../../ui/EditPaymentModal';
import ViewReceiptModal from '../../ui/ViewReceiptModal';

const FeesPaymentPage: React.FC = () => {
    const [students, setStudents] = useLocalStorage<Student[]>('students', getInitialStudents);
    const [feesTypes] = useLocalStorage<string[]>('feesTypes', ['Tuition Fee', 'Admission Fee', 'Transport Fee', 'Exam Fee', 'Miscellaneous Fee']);
    const { addNotification } = useNotification();
    const { currentPage } = useNavigation();
    const actionMenuRef = useRef<HTMLDivElement>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    
    // State for new payment form
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [feesType, setFeesType] = useState<string>(feesTypes[0] || 'Tuition Fee');
    const [paymentInstrument, setPaymentInstrument] = useState<string>('Cash');
    const [instrumentDetails, setInstrumentDetails] = useState<string>('');

    const [sortConfig, setSortConfig] = useState<{ key: keyof PaymentRecord; direction: 'ascending' | 'descending' }>({
        key: 'date',
        direction: 'descending',
    });

    // State for modals and actions
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);
    const [paymentToEdit, setPaymentToEdit] = useState<PaymentRecord | null>(null);
    const [paymentToView, setPaymentToView] = useState<PaymentRecord | null>(null);
    
    useEffect(() => {
        // Fix: Changed currentPage.dataId to currentPage.data to match NavigationState interface
        if (currentPage.data && typeof currentPage.data === 'string') {
            const studentFromNav = students.find(s => s.id === currentPage.data);
            if (studentFromNav) {
                setSelectedStudent(studentFromNav);
                setSearchTerm(''); // Clear search term if we found a student
            }
        }
    }, [currentPage.data, students]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActiveActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const uniqueClasses = useMemo(() => {
        const classSet = new Set(students.filter(s => !s.isDeleted && s.class).map(s => s.class));
        return ['All Classes', ...Array.from(classSet).sort()];
    }, [students]);

    const searchResults = useMemo(() => {
        if (selectedClass === 'All Classes' && !searchTerm) {
            return [];
        }
        return students
            .filter(s => !s.isDeleted)
            .filter(student => (selectedClass === 'All Classes' || student.class === selectedClass))
            .filter(s => 
                !searchTerm ||
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [searchTerm, students, selectedClass]);


    const sortedHistory = useMemo(() => {
        if (!selectedStudent || !selectedStudent.paymentHistory) {
            return [];
        }
        const sortableItems = selectedStudent.paymentHistory.filter(p => !p.isDeleted);
        sortableItems.sort((a, b) => {
            if (sortConfig.key === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            }
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [selectedStudent, sortConfig]);

    const requestSort = (key: keyof PaymentRecord) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const getSortIndicator = (key: keyof PaymentRecord) => {
        if (sortConfig.key !== key) {
            return <span className="opacity-30">▲▼</span>;
        }
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSearchTerm('');
        setSelectedClass('All Classes'); // Reset class filter after selection
    };
    
    const handleRecordPayment = () => {
        if (!selectedStudent || !paymentAmount || paymentAmount <= 0) {
            addNotification('Please enter a valid payment amount.', 'danger');
            return;
        }

        const balance = selectedStudent.totalFees - (selectedStudent.feesPaid || 0);
        if (paymentAmount > balance) {
            addNotification('Payment amount cannot be greater than the balance due.', 'danger');
            return;
        }

        const newPayment: PaymentRecord = {
            amount: paymentAmount,
            date: new Date(paymentDate).toISOString(),
            receiptNumber: `RCPT-${Date.now()}`,
            feesType: feesType,
            instrument: paymentInstrument,
            instrumentDetails: instrumentDetails || undefined,
        };

        const updatedStudent: Student = {
            ...selectedStudent,
            feesPaid: (selectedStudent.feesPaid || 0) + paymentAmount,
            paymentHistory: [...(selectedStudent.paymentHistory || []), newPayment],
        };

        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));
        setSelectedStudent(updatedStudent);
        
        addNotification(`Payment of ₹${paymentAmount} for ${selectedStudent.name} recorded successfully.`, 'success');

        // Open the receipt modal for the new payment
        setPaymentToView(newPayment);

        // Reset form
        setPaymentAmount('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setFeesType(feesTypes[0] || 'Tuition Fee');
        setPaymentInstrument('Cash');
        setInstrumentDetails('');
    };

    // --- Action Handlers ---
    const handleDeleteClick = (payment: PaymentRecord) => {
        setPaymentToDelete(payment);
        setActiveActionMenu(null);
    };

    const confirmDelete = () => {
        if (!paymentToDelete || !selectedStudent) return;
        
        const newFeesPaid = (selectedStudent.feesPaid || 0) - paymentToDelete.amount;
        const newPaymentHistory = selectedStudent.paymentHistory.map(p => 
            p.receiptNumber === paymentToDelete.receiptNumber ? { ...p, isDeleted: true } : p
        );

        const updatedStudent = { ...selectedStudent, feesPaid: newFeesPaid, paymentHistory: newPaymentHistory };
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        setSelectedStudent(updatedStudent);
        
        addNotification('Payment record moved to Recycle Bin.', 'danger');
        setPaymentToDelete(null);
    };

    const handleEditClick = (payment: PaymentRecord) => {
        setPaymentToEdit(payment);
        setActiveActionMenu(null);
    };

    const handleSaveEdit = (updatedRecord: PaymentRecord, originalAmount: number) => {
        if (!selectedStudent) return;
        
        const amountDifference = updatedRecord.amount - originalAmount;
        const newFeesPaid = (selectedStudent.feesPaid || 0) + amountDifference;
        const newPaymentHistory = selectedStudent.paymentHistory.map(p => p.receiptNumber === updatedRecord.receiptNumber ? updatedRecord : p);

        const updatedStudent = { ...selectedStudent, feesPaid: newFeesPaid, paymentHistory: newPaymentHistory };
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        setSelectedStudent(updatedStudent);

        addNotification('Payment record updated successfully.', 'success');
        setPaymentToEdit(null);
    };

    const handleViewReceiptClick = (payment: PaymentRecord) => {
        setPaymentToView(payment);
        setActiveActionMenu(null);
    };

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const balance = selectedStudent ? selectedStudent.totalFees - (selectedStudent.feesPaid || 0) : 0;
    const progress = selectedStudent && selectedStudent.totalFees > 0 ? ((selectedStudent.feesPaid || 0) / selectedStudent.totalFees) * 100 : 0;

    const getProgressColor = () => {
        if (!selectedStudent || selectedStudent.totalFees <= 0) return 'bg-gray-400';
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-teal-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        if (progress > 0) return 'bg-red-400';
        return 'bg-red-500';
    };

    return (
        <PageWrapper page={Page.FeesPaymentPage}>
            <div className="space-y-6">
                {/* Search Section */}
                <div className="neo-container rounded-xl p-4">
                     <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Class Filter */}
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

                        {/* Search Input */}
                        <div className="relative w-full sm:w-2/3">
                            <input
                                type="text"
                                placeholder="Search by student name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="neo-button w-full rounded-xl p-3 pl-10 text-gray-700 focus:outline-none"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-2 neo-container rounded-lg p-2 max-h-60 overflow-y-auto">
                            {searchResults.map(student => (
                                <div key={student.id} onClick={() => handleSelectStudent(student)} className="p-2 neo-button rounded-md hover:text-blue-600 cursor-pointer text-black">
                                    {student.name} ({student.id})
                                </div>
                            ))}
                        </div>
                    )}
                    {(searchTerm || selectedClass !== 'All Classes') && searchResults.length === 0 && (
                        <p className="mt-2 p-2 text-gray-500 text-sm">No students found.</p>
                    )}
                </div>

                {selectedStudent ? (
                    <div className="space-y-6">
                         {/* Student Info */}
                        <div className="neo-container rounded-xl p-4 flex items-center space-x-4">
                            <StudentPhoto studentId={selectedStudent.id} hasPhoto={selectedStudent.hasPhoto} alt={selectedStudent.name} className="neo-container rounded-full w-16 h-16 object-cover" />
                            <div>
                                <p className="text-xl font-bold text-gray-800">{selectedStudent.name}</p>
                                <p className="text-sm text-gray-600">S/o: {selectedStudent.fatherName || 'N/A'}</p>
                                <p className="text-sm text-gray-500">ID: {selectedStudent.id} | Class: {selectedStudent.class}</p>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="neo-button rounded-full p-2 ml-auto text-red-500" title="Clear Selection">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        {/* Fees Summary */}
                        <div className="neo-container rounded-xl p-4">
                            <h4 className="text-lg font-bold text-gray-800 mb-3">Fees Summary</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div><p className="text-xs text-gray-500">Total Fees</p><p className="font-bold text-blue-600 text-lg">{formatCurrency(selectedStudent.totalFees)}</p></div>
                                    <div><p className="text-xs text-gray-500">Fees Paid</p><p className="font-bold text-green-600 text-lg">{formatCurrency(selectedStudent.feesPaid || 0)}</p></div>
                                    <div><p className="text-xs text-gray-500">Balance Due</p><p className="font-bold text-red-600 text-lg">{formatCurrency(balance)}</p></div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-full bg-gray-200 rounded-full h-4 neo-button">
                                        <div className={`${getProgressColor()} h-4 rounded-full`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-600 w-12 text-right">{progress.toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>

                         {/* Record Payment */}
                        <div className="neo-container rounded-xl p-4">
                            <h4 className="text-lg font-bold text-gray-800 mb-3">Record New Payment</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <FormField label="Payment Date" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                                    <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="neo-button w-full rounded-xl p-3 text-gray-700"/>
                                </FormField>
                                <FormField label="Fees Type" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V7a4 4 0 014-4z" /></svg>}>
                                    <select value={feesType} onChange={e => setFeesType(e.target.value)} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                                        {feesTypes.map(ft => (
                                            <option key={ft} value={ft}>{ft}</option>
                                        ))}
                                    </select>
                                </FormField>
                                <FormField label="Payment Instrument" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}>
                                    <select value={paymentInstrument} onChange={e => setPaymentInstrument(e.target.value)} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                                        <option>Cash</option>
                                        <option>Cheque</option>
                                        <option>Online (UPI/NetBanking)</option>
                                        <option>Card (Debit/Credit)</option>
                                    </select>
                                </FormField>
                                {paymentInstrument !== 'Cash' && (
                                <FormField label="Instrument Details" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                                    <input type="text" value={instrumentDetails} onChange={e => setInstrumentDetails(e.target.value)} placeholder={paymentInstrument === 'Cheque' ? 'Cheque No.' : 'Transaction ID'} className="neo-button w-full rounded-xl p-3 text-gray-700"/>
                                </FormField>
                                )}
                                <div className="md:col-span-2">
                                    <FormField label="Enter Amount" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                placeholder="Amount to pay"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                                className="neo-button w-full rounded-xl p-3 pl-8 text-gray-700"
                                                min="0"
                                                max={balance > 0 ? balance : undefined}
                                            />
                                        </div>
                                    </FormField>
                                </div>
                            </div>
                            <div className="flex justify-end border-t border-gray-200 pt-4">
                                <button onClick={handleRecordPayment} className="neo-button-success w-full sm:w-auto rounded-xl px-6 py-3 text-base font-semibold flex items-center justify-center space-x-2 flex-shrink-0" disabled={balance <= 0}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>{balance <= 0 ? 'Fees Paid' : 'Pay Fees'}</span>
                                </button>
                            </div>
                        </div>

                         {/* Payment History */}
                        <div className="neo-container rounded-xl p-4">
                            <h4 className="text-lg font-bold text-gray-800 mb-3">Payment History</h4>
                            <div className="max-h-96 overflow-y-auto">
                                {sortedHistory.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase sticky top-0 bg-[#e0e5ec] z-10">
                                            <tr>
                                                <th className="py-2 px-4 whitespace-nowrap"><button onClick={() => requestSort('date')} className="font-bold flex items-center space-x-1 hover:text-blue-600 transition-colors"><span>Date</span><span>{getSortIndicator('date')}</span></button></th>
                                                <th className="py-2 px-4 whitespace-nowrap"><button onClick={() => requestSort('receiptNumber')} className="font-bold flex items-center space-x-1 hover:text-blue-600 transition-colors"><span>Receipt No.</span><span>{getSortIndicator('receiptNumber')}</span></button></th>
                                                <th className="py-2 px-4 whitespace-nowrap"><button onClick={() => requestSort('feesType')} className="font-bold flex items-center space-x-1 hover:text-blue-600 transition-colors"><span>Fees Type</span><span>{getSortIndicator('feesType')}</span></button></th>
                                                <th className="py-2 px-4 whitespace-nowrap"><button onClick={() => requestSort('instrument')} className="font-bold flex items-center space-x-1 hover:text-blue-600 transition-colors"><span>Instrument</span><span>{getSortIndicator('instrument')}</span></button></th>
                                                <th className="py-2 px-4 text-right whitespace-nowrap"><button onClick={() => requestSort('amount')} className="font-bold flex items-center space-x-1 ml-auto hover:text-blue-600 transition-colors"><span>Amount</span><span>{getSortIndicator('amount')}</span></button></th>
                                                <th className="py-2 px-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedHistory.map((p) => (
                                                <tr key={p.receiptNumber} className="border-t border-gray-200">
                                                    <td className="py-2 px-4 text-blue-600">{formatDate(p.date)}</td>
                                                    <td className="py-2 px-4 font-mono text-indigo-600">{p.receiptNumber}</td>
                                                    <td className="py-2 px-4 text-purple-600">{p.feesType}</td>
                                                    <td className="py-2 px-4 text-teal-600">
                                                        {p.instrument}
                                                        {p.instrumentDetails && <span className="text-xs text-gray-500 block">({p.instrumentDetails})</span>}
                                                    </td>
                                                    <td className="py-2 px-4 text-right font-bold text-green-700">{formatCurrency(p.amount)}</td>
                                                    <td className="py-2 px-4 text-center">
                                                        <div className="relative inline-block text-left" ref={activeActionMenu === p.receiptNumber ? actionMenuRef : null}>
                                                            <button onClick={() => setActiveActionMenu(activeActionMenu === p.receiptNumber ? null : p.receiptNumber)} className="neo-button rounded-full p-2 text-gray-500 hover:text-gray-800">
                                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                                            </button>
                                                            {activeActionMenu === p.receiptNumber && (
                                                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md neo-container p-1 z-20">
                                                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleViewReceiptClick(p); }} className="neo-button block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-md m-1">View Receipt</a>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleEditClick(p); }} className="neo-button block px-4 py-2 text-sm text-gray-700 hover:text-green-600 rounded-md m-1">Edit</a>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteClick(p); }} className="neo-button block px-4 py-2 text-sm text-red-500 hover:text-red-700 rounded-md m-1">Delete</a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No payment history found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="neo-container rounded-xl p-8 text-center">
                        <p className="text-gray-600">Please search for and select a student to proceed with payment.</p>
                    </div>
                )}
            </div>
            
            {/* Modals */}
            <ConfirmationModal
                isOpen={!!paymentToDelete}
                onClose={() => setPaymentToDelete(null)}
                onConfirm={confirmDelete}
                title="Move to Recycle Bin"
                message={<>Are you sure you want to move this payment record of <strong>{formatCurrency(paymentToDelete?.amount || 0)}</strong> to the Recycle Bin? The student's balance will be updated.</>}
                confirmText="Delete"
                variant="danger"
            />
            <EditPaymentModal
                isOpen={!!paymentToEdit}
                onClose={() => setPaymentToEdit(null)}
                onSave={handleSaveEdit}
                paymentRecord={paymentToEdit}
                feesTypes={feesTypes}
            />
            <ViewReceiptModal
                isOpen={!!paymentToView}
                onClose={() => setPaymentToView(null)}
                paymentRecord={paymentToView}
                student={selectedStudent}
            />
        </PageWrapper>
    );
};

export default FeesPaymentPage;