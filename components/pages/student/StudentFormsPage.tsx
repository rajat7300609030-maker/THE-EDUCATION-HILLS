import React from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';
import { useNavigation } from '../../../contexts/NavigationContext';

const FORMS_LIST = [
    { type: 'admission', title: 'Admission Form', description: 'Generate a new student enrollment and registration form.' },
    { type: 'leave', title: 'Leave Application', description: 'Create an application form for student leave of absence.' },
    { type: 'bonafide', title: 'Bonafide Certificate', description: 'Generate a bonafide certificate for a student.' },
    { type: 'transport', title: 'Transport Application', description: 'Form to apply for or cancel school transport services.' },
    { type: 'library', title: 'Library Membership', description: 'Generate a form for library membership.' },
    { type: 'transfer-certificate', title: 'Transfer Certificate', description: 'Generate a transfer certificate for a student leaving the school.' },
    { type: 'notice-letter', title: 'Notices & Letters', description: 'Create custom notices or letters for students.' },
];

const FormLink: React.FC<{ title: string, description: string, onClick: () => void }> = ({ title, description, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="neo-button p-4 rounded-lg w-full flex items-center justify-between transition-transform duration-200 hover:scale-[1.02]"
        >
            <div className="text-left">
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div className="text-blue-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
        </button>
    );
};


const StudentFormsPage: React.FC = () => {
    const { navigate } = useNavigation();

    const handleFormSelect = (formType: string) => {
        navigate(Page.StudentFormGenerator, formType);
    };

  return (
    <PageWrapper page={Page.StudentForms}>
      <div className="neo-container rounded-xl p-6">
        <p className="text-sm mb-6 text-gray-600">
          Select a form type below. You will then be able to search for a student and generate the selected document for them.
        </p>
        <div className="space-y-4">
            {FORMS_LIST.map(form => (
                <FormLink 
                    key={form.type}
                    title={form.title}
                    description={form.description}
                    onClick={() => handleFormSelect(form.type)}
                />
            ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default StudentFormsPage;