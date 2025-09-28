
import React from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';

const ExamsResultsPage: React.FC = () => {
  return (
    <PageWrapper page={Page.ExamsResults}>
        <div className="neo-container rounded-xl p-4">
            <p className="text-gray-600">This page is for scheduling exams, entering results, and generating report cards for students across all classes.</p>
            <ul className="mt-4 space-y-2">
                <li className="flex items-center space-x-2 text-gray-700"><span className="font-semibold">Mid-Term Exams:</span> Nov 2025</li>
                <li className="flex items-center space-x-2 text-gray-700"><span className="font-semibold">Annual Exams:</span> Mar 2026</li>
                <li className="flex items-center space-x-2 text-gray-700">Results for Quarter 1 released.</li>
            </ul>
        </div>
    </PageWrapper>
  );
};

export default ExamsResultsPage;
