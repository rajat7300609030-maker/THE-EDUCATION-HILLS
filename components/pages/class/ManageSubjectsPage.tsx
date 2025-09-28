
import React from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';

const ManageSubjectsPage: React.FC = () => {
  return (
    <PageWrapper page={Page.ManageSubjects}>
        <div className="neo-container rounded-xl p-4">
            <p className="text-gray-600">Here you can add, edit, or delete subjects offered in each class. You might link subjects to teachers and assign them to specific classes.</p>
            <ul className="mt-4 space-y-2">
                <li className="flex items-center space-x-2 text-gray-700"><span className="font-semibold">Mathematics:</span> Algebra, Geometry, Calculus</li>
                <li className="flex items-center space-x-2 text-gray-700"><span className="font-semibold">Science:</span> Physics, Chemistry, Biology</li>
                <li className="flex items-center space-x-2 text-gray-700"><span className="font-semibold">Languages:</span> English, Hindi, French</li>
            </ul>
        </div>
    </PageWrapper>
  );
};

export default ManageSubjectsPage;
