
import React from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';

const ClassTimetablePage: React.FC = () => {
  return (
    <PageWrapper page={Page.ClassTimetable}>
        <div className="neo-container rounded-xl p-4">
            <p className="text-gray-600">This section would allow you to create, view, and modify timetables for all classes. This could involve drag-and-drop interfaces or detailed forms.</p>
            <p className="mt-4 text-gray-700">Example: Grade 10A Timetable (Monday)</p>
            <ul className="mt-2 ml-4 list-disc list-inside text-gray-600">
                <li>9:00 AM - 10:00 AM: Mathematics</li>
                <li>10:00 AM - 11:00 AM: Science</li>
                <li>11:00 AM - 11:30 AM: Break</li>
            </ul>
        </div>
    </PageWrapper>
  );
};

export default ClassTimetablePage;
