import React, { useState, useMemo } from 'react';

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const days = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

        const calendarDays: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
        
        for (let i = firstDayOfMonth; i > 0; i--) {
            calendarDays.push({ day: lastDateOfPrevMonth - i + 1, isCurrentMonth: false, isToday: false });
        }

        const today = new Date();
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            calendarDays.push({ day: i, isCurrentMonth: true, isToday });
        }
        
        const remainingCells = 42 - calendarDays.length;
        for (let i = 1; i <= remainingCells; i++) {
            calendarDays.push({ day: i, isCurrentMonth: false, isToday: false });
        }

        return calendarDays;
    }, [currentDate]);

    return (
        <div className="neo-container rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="neo-button rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={handleNextMonth} className="neo-button rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="font-bold p-2">{day}</div>
                ))}
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`p-2 rounded-full flex items-center justify-center h-10 w-10 mx-auto
                            ${!d.isCurrentMonth ? 'opacity-50' : ''}
                            ${d.isToday ? 'neo-button active bg-blue-500 text-white font-bold' : ''}
                            ${d.isCurrentMonth && !d.isToday ? 'neo-button' : ''}
                        `}
                    >
                        {d.day}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
