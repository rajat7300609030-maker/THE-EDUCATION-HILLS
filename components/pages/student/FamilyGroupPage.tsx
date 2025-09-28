import React, { useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';

const FamilyGroupPage: React.FC = () => {
  const [students] = useLocalStorage<Student[]>('students', getInitialStudents);

  const familyGroups = useMemo(() => {
    const activeStudents = students.filter(s => !s.isDeleted);
    const groups: { [key: string]: Student[] } = {};

    activeStudents.forEach(student => {
      // A student must have all three identifiers to be considered for grouping.
      if (student.fatherName && student.motherName && student.contactNumber) {
        const familyKey = `${student.fatherName.trim().toLowerCase()}|${student.motherName.trim().toLowerCase()}|${student.contactNumber.trim()}`;
        
        if (!groups[familyKey]) {
          groups[familyKey] = [];
        }
        groups[familyKey].push(student);
      }
    });

    // Return only groups with more than one student (i.e., siblings).
    return Object.values(groups).filter(group => group.length > 1);
  }, [students]);

  return (
    <PageWrapper page={Page.FamilyGroup}>
      {familyGroups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {familyGroups.map((group, index) => {
            const familyInfo = group[0]; // Use the first student for common family info
            return (
              <div key={index} className="neo-container rounded-2xl p-5 flex flex-col">
                {/* Family Info Header */}
                <div className="border-b border-gray-300 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Family of {familyInfo.fatherName}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="font-semibold mr-2">Father:</span>
                      <span>{familyInfo.fatherName}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="font-semibold mr-2">Mother:</span>
                      <span>{familyInfo.motherName}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span className="font-semibold mr-2">Contact:</span>
                      <span>{familyInfo.contactNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Siblings List */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Siblings in this Family ({group.length})</h4>
                  <div className="space-y-3">
                    {group.map(student => (
                      <div key={student.id} className="neo-button p-3 rounded-lg flex items-center space-x-4">
                        <StudentPhoto
                          studentId={student.id}
                          hasPhoto={student.hasPhoto}
                          alt={student.name}
                          className="neo-container rounded-full w-12 h-12 object-cover flex-shrink-0"
                        />
                        <div className="flex-grow">
                          <p className="font-bold text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">ID:</span> {student.id} | <span className="font-semibold">Class:</span> {student.class}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="neo-container rounded-2xl p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zM5 8a4 4 0 118 0 4 4 0 01-8 0z" />
          </svg>
          <p className="text-lg font-semibold text-gray-700">No Family Groups Found</p>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            A family group is automatically created when two or more students share the exact same Father's Name, Mother's Name, and Contact Number in their profiles.
          </p>
        </div>
      )}
    </PageWrapper>
  );
};

export default FamilyGroupPage;