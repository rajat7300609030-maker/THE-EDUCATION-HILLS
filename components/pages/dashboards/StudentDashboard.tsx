import React, { useMemo, useState, useEffect } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import { useNavigation } from '../../../contexts/NavigationContext';
import useUserProfile from '../../../hooks/useUserProfile';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';
import useSchoolProfile from '../../../hooks/useSchoolProfile';
import ImageSlider from '../../dashboard/ImageSlider';
import SchoolProfileCard from '../../dashboard/SchoolProfileCard';
import Calendar from '../../dashboard/Calendar';

const BlinkingPayNowButton: React.FC<{ studentId: string }> = ({ studentId }) => {
    const { navigate } = useNavigation();
    const colors = [
        'bg-red-500', 
        'bg-amber-500', 
        'bg-blue-500', 
        'bg-purple-500'
    ];
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setColorIndex(prevIndex => (prevIndex + 1) % colors.length);
        }, 15000); // Change color every 15 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const handleClick = () => {
        navigate(Page.ViewStudent, studentId);
    };

    const currentColorClass = colors[colorIndex];

    return (
        <button
            onClick={handleClick}
            className={`w-full p-4 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-1000 ${currentColorClass}`}
            style={{
                boxShadow: '7px 7px 14px var(--shadow-dark), -7px -7px 14px var(--shadow-light)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
            }}
        >
            <div className="relative h-6 w-6">
                 <svg xmlns="http://www.w3.org/2000/svg" className="absolute h-6 w-6 animate-ping" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                 </svg>
                 <svg xmlns="http://www.w3.org/2000/svg" className="relative h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                 </svg>
            </div>
            <span className="animate-pulse-glow">PENDING FEES: PAY NOW</span>
        </button>
    );
};


const StudentDashboard: React.FC = () => {
    const { navigate } = useNavigation();
    const [userProfile] = useUserProfile();
    const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
    const [schoolProfile] = useSchoolProfile();

    const studentData = useMemo(() => {
        return students.find(s => s.id === userProfile.userId);
    }, [students, userProfile.userId]);

    if (!studentData) {
        return (
            <PageWrapper page={Page.Dashboard}>
                <div className="neo-container rounded-xl p-8 text-center text-red-500">
                    <h2 className="text-xl font-bold">Student Profile Not Found</h2>
                    <p>Could not find a student record with ID: {userProfile.userId}</p>
                </div>
            </PageWrapper>
        );
    }
    
    const feesPaid = studentData.feesPaid || 0;
    const totalFees = studentData.totalFees || 0;
    const balance = totalFees - feesPaid;
    const progress = totalFees > 0 ? (feesPaid / totalFees) * 100 : 0;
    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
    
    const getProgressColor = () => {
        if (progress >= 100) return 'bg-green-500';
        if (progress > 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <PageWrapper page={Page.Dashboard}>
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 space-y-8">
                    <SchoolProfileCard />
                    <Calendar />
                </div>
                 <div className="xl:col-span-2 space-y-8">
                    <ImageSlider duration={schoolProfile.sliderDuration || 5000} />

                    {balance > 0 && (
                        <BlinkingPayNowButton studentId={studentData.id} />
                    )}

                    <div className="neo-container rounded-xl p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <StudentPhoto 
                            studentId={studentData.id} 
                            hasPhoto={studentData.hasPhoto} 
                            alt={studentData.name} 
                            className="neo-container rounded-full w-24 h-24 object-cover flex-shrink-0"
                        />
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl font-bold text-gray-800">Welcome, {studentData.name}!</h2>
                            <p className="text-gray-600">Class: {studentData.class} | ID: {studentData.id}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate(Page.ViewStudent, studentData.id)}
                        className="neo-container rounded-xl p-6 w-full text-left transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                            <span>Your Fees Summary</span>
                            <span className="text-sm font-normal text-blue-600 flex items-center space-x-1">
                                <span>View Details</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </span>
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500">Total Fees</p>
                                    <p className="font-bold text-2xl text-blue-600">{formatCurrency(totalFees)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Fees Paid</p>
                                    <p className="font-bold text-2xl text-green-600">{formatCurrency(feesPaid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Balance Due</p>
                                    <p className="font-bold text-2xl text-red-600">{formatCurrency(balance)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 pt-2">
                                <div className="w-full bg-gray-200 rounded-full h-4 neo-button">
                                    <div className={`${getProgressColor()} h-4 rounded-full`} style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-md font-bold text-gray-600">{progress.toFixed(0)}%</span>
                            </div>
                        </div>
                    </button>
                 </div>
            </div>
        </PageWrapper>
    );
};

export default StudentDashboard;
