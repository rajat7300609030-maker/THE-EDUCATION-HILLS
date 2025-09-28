import React, { useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';
import { useNavigation } from '../../../contexts/NavigationContext';

const FamilyGroupCardsPage: React.FC = () => {
  const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
  const { navigate } = useNavigation();

  const familyGroups = useMemo(() => {
    const activeStudents = students.filter(s => !s.isDeleted);
    const groups: { [key: string]: Student[] } = {};

    activeStudents.forEach(student => {
      if (student.fatherName && student.motherName && student.contactNumber) {
        const familyKey = `${student.fatherName.trim().toLowerCase()}|${student.motherName.trim().toLowerCase()}|${student.contactNumber.trim()}`;
        
        if (!groups[familyKey]) {
          groups[familyKey] = [];
        }
        groups[familyKey].push(student);
      }
    });

    return Object.values(groups).filter(group => group.length > 1);
  }, [students]);

  const handleViewProfileClick = (studentId: string) => {
    navigate(Page.ViewStudent, studentId);
  };
  
  const handlePayFeesClick = (studentId: string) => {
    navigate(Page.FeesPaymentPage, studentId);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <PageWrapper page={Page.FamilyGroupCards}>
      {familyGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {familyGroups.map((group, index) => {
            const familyInfo = group[0];
            return (
              <div key={index} className="neo-container rounded-2xl p-5 flex flex-col h-full">
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
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-700 mb-3">Children ({group.length})</h4>
                  <div className="space-y-4">
                    {group.map(student => {
                        const feesPaid = student.feesPaid || 0;
                        const totalFees = student.totalFees || 0;
                        const balance = totalFees - feesPaid;
                        const progress = totalFees > 0 ? (feesPaid / totalFees) * 100 : 0;
                        const getProgressColor = () => {
                            if (progress >= 100) return 'bg-green-500';
                            if (progress > 50) return 'bg-yellow-500';
                            return 'bg-red-500';
                        };

                        return (
                          <div key={student.id} className="neo-button p-3 rounded-lg flex flex-col space-y-3">
                              <div className="flex items-center space-x-4">
                                  <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="neo-container rounded-full w-12 h-12 object-cover flex-shrink-0" />
                                  <div className="flex-grow min-w-0">
                                      <p className="font-bold text-gray-800 truncate">{student.name}</p>
                                      <p className="text-sm text-gray-600 truncate"><span className="font-semibold">ID:</span> {student.id} | <span className="font-semibold">Class:</span> {student.class}</p>
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                      <div><p className="text-gray-500">Total</p><p className="font-bold text-blue-600">{formatCurrency(totalFees)}</p></div>
                                      <div><p className="text-gray-500">Paid</p><p className="font-bold text-green-600">{formatCurrency(feesPaid)}</p></div>
                                      <div><p className="text-gray-500">Due</p><p className="font-bold text-red-600">{formatCurrency(balance)}</p></div>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 neo-button"><div className={`${getProgressColor()} h-2 rounded-full`} style={{ width: `${progress}%` }}></div></div>
                              </div>
                              <div className="flex items-center justify-end space-x-2 border-t pt-2 mt-auto">
                                  <button onClick={() => handleViewProfileClick(student.id)} className="neo-button text-xs font-semibold px-3 py-1.5 rounded-md">View Profile</button>
                                  <button onClick={() => handlePayFeesClick(student.id)} className="neo-button-primary text-xs font-semibold px-3 py-1.5 rounded-md" disabled={balance <= 0}>Pay Fees</button>
                              </div>
                          </div>
                        );
                    })}
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

export default FamilyGroupCardsPage;