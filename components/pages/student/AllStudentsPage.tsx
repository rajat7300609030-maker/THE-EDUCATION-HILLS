import React, { useState, useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../../contexts/NavigationContext';
import StudentPhoto from '../../ui/StudentPhoto';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { getInitialStudents } from '../../../utils/seedData';

const AllStudentsPage: React.FC = () => {
  const [students, setStudents] = useLocalStorage<Student[]>('students', getInitialStudents);
  const { navigate } = useNavigation();
  const { addNotification } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');

  // Memos for filtering
  const uniqueClasses = useMemo(() => {
    const classSet = new Set(students.filter(s => !s.isDeleted && s.class).map(s => s.class));
    return ['All Classes', ...Array.from(classSet).sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => !s.isDeleted)
      .filter(student => (selectedClass === 'All Classes' || student.class === selectedClass))
      .filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [students, searchTerm, selectedClass]);

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    setStudents(prevStudents => 
        prevStudents.map(s => 
            s.id === studentToDelete.id ? { ...s, isDeleted: true } : s
        )
    );
    addNotification(`Student "${studentToDelete.name}" moved to Recycle Bin.`, 'danger');

    setIsModalOpen(false);
    setStudentToDelete(null);
  };

  return (
    <PageWrapper page={Page.AllStudents}>
      {/* Filter Controls */}
      <div className="neo-container rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:flex-grow">
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="neo-button w-full rounded-xl p-3 pl-10 text-gray-700 focus:outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
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
        </div>
      </div>

      <div className="neo-container rounded-xl p-4">
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="neo-container neo-card-hover rounded-xl p-5 flex flex-col justify-between transition-all duration-200">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <StudentPhoto 
                      studentId={student.id} 
                      hasPhoto={student.hasPhoto} 
                      alt={student.name}
                      className="neo-container rounded-full w-16 h-16 object-cover" 
                    />
                    <div>
                      <p className="text-xl font-bold text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">ID: {student.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                      {student.type && (
                          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full shadow-inner">
                              {student.type}
                          </span>
                      )}
                      {student.transportNeeded && (
                          <div title="Transport Needed" className="mt-2 text-purple-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1z" />
                              </svg>
                          </div>
                      )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.14M12 14v10" /><path d="M6 16.5V12M18 16.5V12" /></svg>
                        <span className="font-semibold mr-1">Class:</span> {student.class || 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="font-semibold mr-1">Father:</span> {student.fatherName || 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span className="font-semibold mr-1">Contact:</span> {student.contactNumber || 'N/A'}
                    </div>
                </div>

                {/* Card Footer */}
                <div className="flex justify-end space-x-2 border-t border-gray-300 pt-3 mt-auto">
                  <button onClick={() => navigate(Page.ViewStudent, student.id)} className="neo-button rounded-full p-2 text-indigo-500 hover:text-indigo-700" title="View"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                  <button onClick={() => navigate(Page.EditStudent, student.id)} className="neo-button rounded-full p-2 text-green-500 hover:text-green-700" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button onClick={() => handleDeleteClick(student)} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {students.filter(s => !s.isDeleted).length === 0 
                ? "No students added yet. Click 'Add New Student' to get started!"
                : "No students match the current filters."
            }
          </p>
        )}
      </div>
       <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Are you sure Delete now"
        message={
          <>
            Are you sure you want to move the student <strong>"{studentToDelete?.name}"</strong> to the Recycle Bin?
            You can restore them later.
          </>
        }
        confirmText="Delete now"
        confirmButtonVariant="danger"
        variant="danger"
      />
    </PageWrapper>
  );
};

export default AllStudentsPage;