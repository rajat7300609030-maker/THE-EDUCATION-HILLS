import React, { useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Class, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
import { getInitialClasses, getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';

const StatCard: React.FC<{ label: string; value: string | number; icon: JSX.Element }> = ({ label, value, icon }) => (
    <div className="neo-container rounded-xl p-4 flex items-center space-x-4">
        <div className="neo-container rounded-full p-3">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ViewClassPage: React.FC = () => {
  const { currentPage, navigate, goBack } = useNavigation();
  const [classes] = useLocalStorage<Class[]>('classes', getInitialClasses);
  const [students] = useLocalStorage<Student[]>('students', getInitialStudents);

  const classToView = useMemo(() => classes.find(c => c.id === currentPage.data), [classes, currentPage.data]);
  
  const studentsInClass = useMemo(() => {
      if (!classToView) return [];
      return students.filter(s => !s.isDeleted && s.class === classToView.name);
  }, [students, classToView]);

  const financialSummary = useMemo(() => {
    return studentsInClass.reduce((acc, student) => {
        acc.totalFees += student.totalFees || 0;
        acc.totalPaid += student.feesPaid || 0;
        return acc;
    }, { totalStudents: studentsInClass.length, totalFees: 0, totalPaid: 0 });
  }, [studentsInClass]);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  if (!classToView) {
    return (
      <PageWrapper page={Page.ViewClass}>
        <div className="text-center text-red-500">Class not found.</div>
        <button onClick={goBack} className="neo-button w-full rounded-xl p-3 text-lg font-semibold text-gray-800 mt-4">Back</button>
      </PageWrapper>
    );
  }

  const totalDue = financialSummary.totalFees - financialSummary.totalPaid;

  return (
    <PageWrapper page={Page.ViewClass}>
      <div className="space-y-6">
        {/* Class Details Header */}
        <div className="neo-container rounded-xl p-6">
            <h2 className="text-3xl font-bold text-gray-800">{classToView.name}</h2>
            <p className="text-md text-gray-600">Class Teacher: {classToView.teacher || 'N/A'}</p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Students" value={financialSummary.totalStudents} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m12-12a4 4 0 100-8 4 4 0 000 8z" /></svg>} />
            <StatCard label="Total Fees" value={formatCurrency(financialSummary.totalFees)} icon={<span className="font-bold text-lg text-purple-500">₹</span>} />
            <StatCard label="Total Paid" value={formatCurrency(financialSummary.totalPaid)} icon={<span className="font-bold text-lg text-green-500">₹</span>} />
            <StatCard label="Total Due" value={formatCurrency(totalDue)} icon={<span className="font-bold text-lg text-red-500">₹</span>} />
        </div>

        {/* Student List */}
        <div className="neo-container rounded-xl p-6">
            <h3 className="text-xl font-bold border-b pb-3 mb-4">Students in this Class</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {studentsInClass.length > 0 ? (
                    studentsInClass.map(student => {
                        const balance = (student.totalFees || 0) - (student.feesPaid || 0);
                        return (
                            <div key={student.id} className="neo-button p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between sm:space-x-4">
                                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                                    <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="neo-container w-12 h-12 rounded-full object-cover"/>
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{student.name}</p>
                                        <p className="text-xs text-gray-500 font-mono truncate">{student.id}</p>
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto grid grid-cols-3 gap-2 text-center text-xs sm:flex sm:items-center sm:space-x-4">
                                    <div><p className="text-gray-500">Total</p><p className="font-semibold text-blue-600">{formatCurrency(student.totalFees)}</p></div>
                                    <div><p className="text-gray-500">Paid</p><p className="font-semibold text-green-600">{formatCurrency(student.feesPaid || 0)}</p></div>
                                    <div><p className="text-gray-500">Due</p><p className="font-semibold text-red-600">{formatCurrency(balance)}</p></div>
                                </div>
                                <button
                                    onClick={() => navigate(Page.ViewStudent, student.id)}
                                    className="neo-button-primary mt-3 sm:mt-0 text-xs font-semibold px-3 py-1.5 rounded-md flex-shrink-0"
                                >
                                    View Profile
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500 py-8">No students enrolled in this class yet.</p>
                )}
            </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ViewClassPage;