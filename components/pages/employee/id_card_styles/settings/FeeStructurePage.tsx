import React, { useState } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Class, FeeStructure, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialClasses, getInitialStudents } from '../../../utils/seedData';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../../contexts/NavigationContext';
import ConfirmationModal from '../../ui/ConfirmationModal';

const FeeStructurePage: React.FC = () => {
  const [classes] = useLocalStorage<Class[]>('classes', getInitialClasses);
  const [feeStructure, setFeeStructure] = useLocalStorage<FeeStructure>('feeStructure', {});
  const [students, setStudents] = useLocalStorage<Student[]>('students', getInitialStudents);
  const [feesTypes, setFeesTypes] = useLocalStorage<string[]>('feesTypes', ['Tuition Fee', 'Admission Fee', 'Transport Fee', 'Exam Fee', 'Miscellaneous Fee']);
  const { addNotification } = useNotification();

  const [localFees, setLocalFees] = useState<FeeStructure>(feeStructure);
  const [newFeeType, setNewFeeType] = useState('');
  const [editingState, setEditingState] = useState<{ original: string; current: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; feeType: string | null }>({ isOpen: false, feeType: null });

  const handleFeeChange = (className: string, amount: string) => {
    const newAmount = parseInt(amount, 10);
    setLocalFees(prev => ({
      ...prev,
      [className]: isNaN(newAmount) ? 0 : newAmount
    }));
  };

  const handleSaveClassFees = () => {
    setFeeStructure(localFees);
    addNotification('Class fee structure saved successfully!', 'success');
  };

  const handleAddFeeType = () => {
    if (!newFeeType.trim()) {
      addNotification('Fee type cannot be empty.', 'danger');
      return;
    }
    if (feesTypes.some(ft => ft.toLowerCase() === newFeeType.trim().toLowerCase())) {
      addNotification('This fee type already exists.', 'danger');
      return;
    }
    setFeesTypes(prev => [...prev, newFeeType.trim()]);
    setNewFeeType('');
    addNotification('Fee type added successfully.', 'success');
  };

  const handleStartEdit = (feeType: string) => {
    setEditingState({ original: feeType, current: feeType });
  };

  const handleCancelEdit = () => {
    setEditingState(null);
  };

  const handleSaveEdit = () => {
    if (!editingState) return;
    const { original, current } = editingState;
    if (!current.trim()) {
      addNotification('Fee type cannot be empty.', 'danger');
      return;
    }
    if (current.trim().toLowerCase() !== original.toLowerCase() && feesTypes.some(ft => ft.toLowerCase() === current.trim().toLowerCase())) {
      addNotification('This fee type already exists.', 'danger');
      return;
    }

    setFeesTypes(prev => prev.map(ft => (ft === original ? current.trim() : ft)));
    setStudents(prevStudents =>
      prevStudents.map(student => ({
        ...student,
        paymentHistory: student.paymentHistory.map(record =>
          record.feesType === original ? { ...record, feesType: current.trim() } : record
        ),
      }))
    );
    
    addNotification(`Fee type "${original}" updated to "${current.trim()}".`, 'success');
    setEditingState(null);
  };
  
  const handleDeleteClick = (feeType: string) => {
    if (feeType === 'Miscellaneous Fee') {
        addNotification('"Miscellaneous Fee" is a default type and cannot be deleted.', 'info');
        return;
    }
    const isInUse = students.some(s => s.paymentHistory.some(p => p.feesType === feeType && !p.isDeleted));
    if (isInUse) {
      addNotification(`Cannot delete "${feeType}" as it is currently used in payment records.`, 'danger');
      return;
    }
    setDeleteModal({ isOpen: true, feeType });
  };
  
  const confirmDelete = () => {
    if (!deleteModal.feeType) return;
    setFeesTypes(prev => prev.filter(ft => ft !== deleteModal.feeType));
    addNotification(`Fee type "${deleteModal.feeType}" has been deleted.`, 'info');
    setDeleteModal({ isOpen: false, feeType: null });
  };

  const activeClasses = classes.filter(c => !c.isDeleted);

  return (
    <PageWrapper page={Page.FeeStructure}>
      <div className="space-y-6">
        <div className="neo-container rounded-xl p-6">
            <h3 className="text-xl font-bold border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">Fee Structure by Class</h3>
            <p className="text-sm mb-4">
            Set the default total fees for each class here. When you add a new student and select their class, this fee amount will be automatically filled in.
            </p>
            <div className="space-y-4">
            {activeClasses.length > 0 ? (
                activeClasses.map(cls => (
                <div key={cls.id} className="flex flex-col sm:flex-row items-center justify-between neo-button p-3 rounded-lg">
                    <label htmlFor={`fee-${cls.id}`} className="font-semibold mb-2 sm:mb-0">{cls.name}</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                        <input
                            id={`fee-${cls.id}`}
                            type="number"
                            value={localFees[cls.name] || ''}
                            onChange={e => handleFeeChange(cls.name, e.target.value)}
                            placeholder="Enter amount"
                            className="neo-button rounded-xl p-2 pl-8 w-48 text-right"
                        />
                    </div>
                </div>
                ))
            ) : (
                <p className="text-center">No active classes found. Please add a class first.</p>
            )}
            </div>
            <div className="flex justify-end mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
            <button onClick={handleSaveClassFees} className="neo-button-success rounded-xl px-6 py-2 text-base font-semibold">
                Save Class Fees
            </button>
            </div>
        </div>
        
        <div className="neo-container rounded-xl p-6">
            <h3 className="text-xl font-bold border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">Manage Fee Types</h3>
            <p className="text-sm mb-4">Add, edit, or remove the fee types that can be selected when recording a payment.</p>
            
            <div className="flex items-center space-x-2 mb-4">
                <input
                    type="text"
                    value={newFeeType}
                    onChange={(e) => setNewFeeType(e.target.value)}
                    placeholder="Enter new fee type"
                    className="neo-button flex-grow rounded-xl p-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFeeType()}
                />
                <button onClick={handleAddFeeType} className="neo-button-primary rounded-xl px-4 py-2 font-semibold">Add</button>
            </div>

            <div className="space-y-2">
                {feesTypes.map(feeType => (
                    <div key={feeType} className="neo-button p-3 rounded-lg flex items-center justify-between">
                        {editingState?.original === feeType ? (
                            <>
                                <input
                                    type="text"
                                    value={editingState.current}
                                    onChange={(e) => setEditingState(prev => prev ? { ...prev, current: e.target.value } : null)}
                                    className="neo-button flex-grow rounded-md p-1"
                                    autoFocus
                                />
                                <div className="flex space-x-2 ml-2">
                                    <button onClick={handleSaveEdit} className="neo-button rounded-full p-2 text-green-500" title="Save"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></button>
                                    <button onClick={handleCancelEdit} className="neo-button rounded-full p-2 text-red-500" title="Cancel"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="text-gray-800">{feeType}</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleStartEdit(feeType)} className="neo-button rounded-full p-2 text-blue-500" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button onClick={() => handleDeleteClick(feeType)} className="neo-button rounded-full p-2 text-red-500" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, feeType: null })}
        onConfirm={confirmDelete}
        title="Delete Fee Type"
        message={<>Are you sure you want to delete the fee type <strong>"{deleteModal.feeType}"</strong>? This cannot be undone.</>}
        confirmText="Delete"
        variant="danger"
      />
    </PageWrapper>
  );
};

export default FeeStructurePage;