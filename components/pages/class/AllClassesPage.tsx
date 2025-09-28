import React, { useState } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Class } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../../contexts/NavigationContext';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { getInitialClasses } from '../../../utils/seedData';

const AllClassesPage: React.FC = () => {
  const [classes, setClasses] = useLocalStorage<Class[]>('classes', getInitialClasses);
  const { navigate } = useNavigation();
  const { addNotification } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const handleDeleteClick = (cls: Class) => {
    setClassToDelete(cls);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!classToDelete) return;

    setClasses(prevClasses => 
        prevClasses.map(cls => 
            cls.id === classToDelete.id ? { ...cls, isDeleted: true } : cls
        )
    );

    addNotification(`Class "${classToDelete.name}" moved to Recycle Bin.`, 'danger');
    
    // Close modal and reset state
    setIsModalOpen(false);
    setClassToDelete(null);
  };


  return (
    <PageWrapper page={Page.AllClasses}>
      <div className="neo-container rounded-xl p-4">
        {classes.filter(c => !c.isDeleted).length > 0 ? (
          <div className="space-y-4">
            {classes.filter(cls => !cls.isDeleted).map((cls) => (
              <div key={cls.id} className="neo-container neo-card-hover rounded-xl p-5 flex flex-col justify-between transition-all duration-200">
                <div className="mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  <p className="text-xl font-bold text-gray-800">{cls.name}</p>
                </div>
                <div className="text-sm text-gray-600 mb-4 space-y-1">
                  <p><span className="font-semibold">Teacher:</span> {cls.teacher || 'N/A'}</p>
                </div>
                <div className="flex justify-end space-x-2 border-t border-gray-300 pt-3 mt-auto">
                  <button onClick={() => navigate(Page.ViewClass, cls.id)} className="neo-button rounded-full p-2 text-indigo-500 hover:text-indigo-700" title="View Details"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                  <button onClick={() => navigate(Page.EditClass, cls.id)} className="neo-button rounded-full p-2 text-green-500 hover:text-green-700" title="Edit Class"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button onClick={() => handleDeleteClick(cls)} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete Class"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No classes added yet. Click 'Add New Class' to get started!</p>
        )}
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Are you sure Delete now"
        message={
          <>
            Are you sure you want to move the class <strong>"{classToDelete?.name}"</strong> to the Recycle Bin?
            You can restore it later.
          </>
        }
        confirmText="Delete now"
        confirmButtonVariant="danger"
        variant="danger"
      />
    </PageWrapper>
  );
};

export default AllClassesPage;