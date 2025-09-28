

import React from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';

const AssignmentsPage: React.FC = () => {
  return (
    <PageWrapper page={Page.Assignments}>
        <div className="neo-container rounded-xl p-4">
            <p className="text-gray-600">Manage assignments for all classes. You can create new assignments, set due dates, and track submissions and grades.</p>
            <ul className="mt-4 space-y-2">
                <li className="flex items-center space-x-2 text-gray-700"><span className="font-semibold">Algebra Worksheet:</span> Due Oct 15 (Grade 10)</li>
                <li className="flex items-center space-x-2 text-gray-700"><span className="font-semibold">Physics Lab Report:</span> Due Oct 20 (Grade 10)</li>
            </ul>
        </div>
    </PageWrapper>
  );
};

export default AssignmentsPage;