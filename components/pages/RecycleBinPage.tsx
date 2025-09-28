import React, { useState, useMemo } from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page, Student, Class, PaymentRecord, InquiryRecord, UserProfile } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../contexts/NavigationContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { deleteImage, deleteData, USER_PHOTOS_STORE } from '../../utils/db';
import StudentPhoto from '../ui/StudentPhoto';
import ProfilePhoto from '../ui/ProfilePhoto';
import useUsers from '../../hooks/useUsers';
import { getInitialClasses, getInitialStudents } from '../../utils/seedData';

interface DeletedPayment {
    record: PaymentRecord;
    studentId: string;
    studentName: string;
}

const RecycleBinPage: React.FC = () => {
  const [students, setStudents] = useLocalStorage<Student[]>('students', getInitialStudents);
  const [classes, setClasses] = useLocalStorage<Class[]>('classes', getInitialClasses);
  const [users, setUsers] = useUsers();
  const [inquiries, setInquiries] = useLocalStorage<InquiryRecord[]>('inquiries', []);
  const { addNotification } = useNotification();

  // State for student/class modals
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; item: Student | Class | UserProfile | null; type: 'student' | 'class' | 'employee' | null }>({ isOpen: false, item: null, type: null });
  const [restoreModalState, setRestoreModalState] = useState<{ isOpen: boolean; item: Student | Class | UserProfile | null; type: 'student' | 'class' | 'employee' | null }>({ isOpen: false, item: null, type: null });

  // State for payment modals
  const [deletePaymentModal, setDeletePaymentModal] = useState<{ isOpen: boolean; item: DeletedPayment | null }>({ isOpen: false, item: null });
  const [restorePaymentModal, setRestorePaymentModal] = useState<{ isOpen: boolean; item: DeletedPayment | null }>({ isOpen: false, item: null });
  
  // State for inquiry modals
  const [deleteInquiryModal, setDeleteInquiryModal] = useState<{ isOpen: boolean; item: InquiryRecord | null }>({ isOpen: false, item: null });
  const [restoreInquiryModal, setRestoreInquiryModal] = useState<{ isOpen: boolean; item: InquiryRecord | null }>({ isOpen: false, item: null });
  
  const deletedStudents = students.filter(s => s.isDeleted);
  const deletedClasses = classes.filter(c => c.isDeleted);
  const deletedEmployees = users.filter(u => u.role === 'Employee' && u.isDeleted);
  const deletedInquiries = inquiries.filter(i => i.isDeleted);

  const deletedPayments = useMemo<DeletedPayment[]>(() => {
    const allDeleted: DeletedPayment[] = [];
    students.forEach(student => {
        if (student.paymentHistory) {
            student.paymentHistory.forEach(record => {
                if (record.isDeleted) {
                    allDeleted.push({ record, studentId: student.id, studentName: student.name });
                }
            });
        }
    });
    return allDeleted.sort((a, b) => new Date(b.record.date).getTime() - new Date(a.record.date).getTime());
  }, [students]);
  
  // --- Student/Class Handlers ---
  const openRestoreModal = (item: Student | Class | UserProfile, type: 'student' | 'class' | 'employee') => setRestoreModalState({ isOpen: true, item, type });
  const closeRestoreModal = () => setRestoreModalState({ isOpen: false, item: null, type: null });
  const openDeleteModal = (item: Student | Class | UserProfile, type: 'student' | 'class' | 'employee') => setDeleteModalState({ isOpen: true, item, type });
  const closeDeleteModal = () => setDeleteModalState({ isOpen: false, item: null, type: null });

  const confirmRestore = () => {
    if (!restoreModalState.item || !restoreModalState.type) return;
    const { item, type } = restoreModalState;

    if (type === 'student') {
        // FIX: Cast item to Student to access 'id' property safely.
        setStudents(prev => prev.map(s => s.id === (item as Student).id ? { ...s, isDeleted: false } : s));
    } else if (type === 'class') {
        // FIX: Cast item to Class to access 'id' property safely.
        setClasses(prev => prev.map(c => c.id === (item as Class).id ? { ...c, isDeleted: false } : c));
    } else if (type === 'employee') {
        setUsers(prev => prev.map(u => u.userId === (item as UserProfile).userId ? { ...u, isDeleted: false } : u));
    }
    addNotification(`"${restoreModalState.item.name}" has been restored.`, 'info');
    closeRestoreModal();
  };

  const confirmPermanentDelete = async () => {
    if (!deleteModalState.item || !deleteModalState.type) return;
    const { item, type } = deleteModalState;
    if (type === 'student') {
        const student = item as Student;
        if (student.hasPhoto) await deleteImage(student.id).catch(console.error);
        setStudents(prev => prev.filter(s => s.id !== student.id));
    } else if (type === 'class') {
        const classToDelete = item as Class;
        setStudents(prev => prev.map(s => s.class === classToDelete.name ? { ...s, class: '' } : s));
        setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
    } else if (type === 'employee') {
        const employee = item as UserProfile;
        if (employee.hasPhoto) await deleteData(USER_PHOTOS_STORE, employee.userId).catch(console.error);
        setUsers(prev => prev.filter(u => u.userId !== employee.userId));
    }
    addNotification(`"${deleteModalState.item.name}" has been permanently deleted.`, 'danger');
    closeDeleteModal();
  };

  // --- Payment Handlers ---
  const openRestorePaymentModal = (item: DeletedPayment) => setRestorePaymentModal({ isOpen: true, item });
  const closeRestorePaymentModal = () => setRestorePaymentModal({ isOpen: false, item: null });
  const openDeletePaymentModal = (item: DeletedPayment) => setDeletePaymentModal({ isOpen: true, item });
  const closeDeletePaymentModal = () => setDeletePaymentModal({ isOpen: false, item: null });

  const confirmRestorePayment = () => {
    if (!restorePaymentModal.item) return;
    const { record, studentId } = restorePaymentModal.item;
    setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
            const newFeesPaid = (s.feesPaid || 0) + record.amount;
            const newHistory = s.paymentHistory.map(p => p.receiptNumber === record.receiptNumber ? { ...p, isDeleted: false } : p);
            return { ...s, feesPaid: newFeesPaid, paymentHistory: newHistory };
        }
        return s;
    }));
    addNotification(`Payment record for "${restorePaymentModal.item.studentName}" restored.`, 'info');
    closeRestorePaymentModal();
  };

  const confirmPermanentDeletePayment = () => {
    if (!deletePaymentModal.item) return;
    const { record, studentId } = deletePaymentModal.item;
    setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
            const newHistory = s.paymentHistory.filter(p => p.receiptNumber !== record.receiptNumber);
            return { ...s, paymentHistory: newHistory };
        }
        return s;
    }));
    addNotification(`Payment record for "${deletePaymentModal.item.studentName}" permanently deleted.`, 'danger');
    closeDeletePaymentModal();
  };

  // --- Inquiry Handlers ---
  const openRestoreInquiryModal = (item: InquiryRecord) => setRestoreInquiryModal({ isOpen: true, item });
  const closeRestoreInquiryModal = () => setRestoreInquiryModal({ isOpen: false, item: null });
  const openDeleteInquiryModal = (item: InquiryRecord) => setDeleteInquiryModal({ isOpen: true, item });
  const closeDeleteInquiryModal = () => setDeleteInquiryModal({ isOpen: false, item: null });

  const confirmRestoreInquiry = () => {
    if (!restoreInquiryModal.item) return;
    setInquiries(prev => prev.map(i => i.id === restoreInquiryModal.item!.id ? { ...i, isDeleted: false } : i));
    addNotification(`Inquiry from "${restoreInquiryModal.item.name}" has been restored.`, 'info');
    closeRestoreInquiryModal();
  };

  const confirmPermanentDeleteInquiry = () => {
    if (!deleteInquiryModal.item) return;
    setInquiries(prev => prev.filter(i => i.id !== deleteInquiryModal.item!.id));
    addNotification(`Inquiry from "${deleteInquiryModal.item.name}" has been permanently deleted.`, 'danger');
    closeDeleteInquiryModal();
  };


  return (
    <PageWrapper page={Page.RecycleBin}>
      <div className="space-y-8">
        {/* Deleted Inquiries */}
        <div className="neo-container rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3 mb-4">Deleted Inquiries</h3>
          {deletedInquiries.length > 0 ? (
            <div className="space-y-3">
              {deletedInquiries.map(item => (
                <div key={item.id} className="neo-button p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name} ({item.role})</p>
                    <p className="text-sm text-gray-600 truncate max-w-xs sm:max-w-md">{item.message}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => openRestoreInquiryModal(item)} className="neo-button rounded-full p-2 text-green-500 hover:text-green-700" title="Restore"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" /></svg></button>
                    <button onClick={() => openDeleteInquiryModal(item)} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete Permanently"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          ) : ( <p className="text-gray-500">No deleted inquiries found.</p> )}
        </div>
        
        {/* Deleted Payment Records */}
        <div className="neo-container rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3 mb-4">Deleted Payment Records</h3>
          {deletedPayments.length > 0 ? (
            <div className="space-y-3">
              {deletedPayments.map(item => (
                <div key={item.record.receiptNumber} className="neo-button p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">₹{item.record.amount.toLocaleString()} for {item.studentName} <span className="text-gray-500">({item.studentId})</span></p>
                    <p className="text-sm text-gray-600">Receipt: {item.record.receiptNumber} | Date: {new Date(item.record.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => openRestorePaymentModal(item)} className="neo-button rounded-full p-2 text-green-500 hover:text-green-700" title="Restore"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" /></svg></button>
                    <button onClick={() => openDeletePaymentModal(item)} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete Permanently"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          ) : ( <p className="text-gray-500">No deleted payment records found.</p> )}
        </div>
        
        {/* Deleted Classes */}
        <div className="neo-container rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3 mb-4">Deleted Classes</h3>
          {deletedClasses.length > 0 ? (
            <div className="space-y-3">
              {deletedClasses.map(cls => (
                <div key={cls.id} className="neo-button p-4 rounded-lg flex items-center justify-between">
                  <div><p className="font-semibold text-gray-800">{cls.name}</p><p className="text-sm text-gray-600">Teacher: {cls.teacher}</p></div>
                  <div className="flex space-x-2"><button onClick={() => openRestoreModal(cls, 'class')} className="neo-button rounded-full p-2 text-green-500 hover:text-green-700" title="Restore"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" /></svg></button><button onClick={() => openDeleteModal(cls, 'class')} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete Permanently"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div>
                </div>
              ))}
            </div>
          ) : ( <p className="text-gray-500">No deleted classes found.</p> )}
        </div>

        {/* Deleted Students */}
        <div className="neo-container rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3 mb-4">Deleted Students</h3>
          {deletedStudents.length > 0 ? (
            <div className="space-y-3">
              {deletedStudents.map(student => (
                 <div key={student.id} className="neo-button p-4 rounded-lg flex items-center justify-between">
                   <div className="flex items-center space-x-3"><StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="neo-container rounded-full w-10 h-10 object-cover" /><div><p className="font-semibold text-gray-800">{student.name}</p><p className="text-sm text-gray-600">ID: {student.id}</p></div></div>
                  <div className="flex space-x-2"><button onClick={() => openRestoreModal(student, 'student')} className="neo-button rounded-full p-2 text-green-500 hover:text-green-700" title="Restore"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" /></svg></button><button onClick={() => openDeleteModal(student, 'student')} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete Permanently"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div>
                </div>
              ))}
            </div>
          ) : ( <p className="text-gray-500">No deleted students found.</p> )}
        </div>
        
        {/* Deleted Employees */}
        <div className="neo-container rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3 mb-4">Deleted Employees</h3>
            {deletedEmployees.length > 0 ? (
                <div className="space-y-3">
                    {deletedEmployees.map(employee => (
                        <div key={employee.userId} className="neo-button p-4 rounded-lg flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                               <ProfilePhoto userId={employee.userId} hasPhoto={employee.hasPhoto} alt={employee.name} className="neo-container rounded-full w-10 h-10 object-cover" />
                               <div><p className="font-semibold text-gray-800">{employee.name}</p><p className="text-sm text-gray-600">ID: {employee.userId}</p></div>
                           </div>
                          <div className="flex space-x-2">
                            <button onClick={() => openRestoreModal(employee, 'employee')} className="neo-button rounded-full p-2 text-green-500 hover:text-green-700" title="Restore"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" /></svg></button>
                            <button onClick={() => openDeleteModal(employee, 'employee')} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete Permanently"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        </div>
                    ))}
                </div>
            ) : ( <p className="text-gray-500">No deleted employees found.</p> )}
        </div>
      </div>
      
      {/* --- Modals --- */}
      <ConfirmationModal isOpen={deleteModalState.isOpen} onClose={closeDeleteModal} onConfirm={confirmPermanentDelete} title={`Permanently Delete ${deleteModalState.type || ''}`} message={<>Are you sure you want to permanently delete <strong>"{deleteModalState.item?.name}"</strong>? This action is irreversible.</>} confirmText="Delete Permanently" variant="danger" />
      <ConfirmationModal isOpen={restoreModalState.isOpen} onClose={closeRestoreModal} onConfirm={confirmRestore} title="Restore Item" message={<>Are you sure you want to restore <strong>"{restoreModalState.item?.name}"</strong>?</>} confirmText="Restore" variant="success" />
      <ConfirmationModal isOpen={deletePaymentModal.isOpen} onClose={closeDeletePaymentModal} onConfirm={confirmPermanentDeletePayment} title="Permanently Delete Payment" message={<>Permanently delete payment of <strong>₹{deletePaymentModal.item?.record.amount.toLocaleString()}</strong> for <strong>{deletePaymentModal.item?.studentName}</strong>?</>} confirmText="Delete Permanently" variant="danger" />
      <ConfirmationModal isOpen={restorePaymentModal.isOpen} onClose={closeRestorePaymentModal} onConfirm={confirmRestorePayment} title="Restore Payment" message={<>Restore payment of <strong>₹{restorePaymentModal.item?.record.amount.toLocaleString()}</strong> for <strong>{restorePaymentModal.item?.studentName}</strong>?</>} confirmText="Restore" variant="success" />
      <ConfirmationModal isOpen={deleteInquiryModal.isOpen} onClose={closeDeleteInquiryModal} onConfirm={confirmPermanentDeleteInquiry} title="Permanently Delete Inquiry" message={<>Permanently delete inquiry from <strong>{deleteInquiryModal.item?.name}</strong>? This action is irreversible.</>} confirmText="Delete Permanently" variant="danger" />
      <ConfirmationModal isOpen={restoreInquiryModal.isOpen} onClose={closeRestoreInquiryModal} onConfirm={confirmRestoreInquiry} title="Restore Inquiry" message={<>Are you sure you want to restore the inquiry from <strong>{restoreInquiryModal.item?.name}</strong>?</>} confirmText="Restore" variant="success" />
    </PageWrapper>
  );
};

export default RecycleBinPage;
