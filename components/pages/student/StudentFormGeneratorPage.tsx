import React, { useState, useMemo, useRef, useEffect } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student, SchoolProfile } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
import { getInitialStudents } from '../../../utils/seedData';
import StudentPhoto from '../../ui/StudentPhoto';
import useSchoolProfile from '../../../hooks/useSchoolProfile';
import SchoolLogo from '../../ui/SchoolLogo';
import { GoogleGenAI } from "@google/genai";

// Declare html2canvas as it's loaded from a script in index.html
declare const html2canvas: any;

const FORM_TITLES: { [key: string]: string } = {
    'admission': 'Admission Form',
    'leave': 'Leave Application',
    'bonafide': 'Bonafide Certificate',
    'transport': 'Transport Application',
    'library': 'Library Membership',
    'transfer-certificate': 'Transfer Certificate',
    'notice-letter': 'Notice / Letter',
};

const generateFormTemplate = (student: Student, formType: string, schoolProfile: SchoolProfile): string => {
    const title = FORM_TITLES[formType] || 'Student Form';
    const studentDetails = `Student Name: ${student.name}\nFather's Name: ${student.fatherName}\nClass: ${student.class}\nStudent ID: ${student.id}`;

    switch (formType) {
        case 'bonafide':
            return `This is to certify that ${student.name}, son/daughter of ${student.fatherName}, is a bonafide student of ${schoolProfile.name}.\n\nHe/She is studying in Class ${student.class} during the academic session ${schoolProfile.session}.\n\nAccording to our school records, his/her date of birth is ${new Date(student.dob).toLocaleDateString('en-GB')}.\n\nWe wish him/her all the best for their future endeavors.`;
        case 'leave':
            return `To,\nThe Principal,\n${schoolProfile.name},\n${schoolProfile.schoolAddress}.\n\nSubject: Application for Leave\n\nRespected Sir/Madam,\n\nWith due respect, I, ${student.name}, a student of Class ${student.class}, would like to state that I will be unable to attend school from [Start Date] to [End Date] due to [Reason for leave].\n\nTherefore, I kindly request you to grant me leave for those days. I will be grateful for your kindness.\n\nThank you.\n\nYours obediently,\n${student.name}\nClass: ${student.class}\nID: ${student.id}`;
        default:
            return `This is a generated ${title} for the student:\n\n${studentDetails}\n\nThis is a placeholder for the actual content of the form. You can click "Edit Form" to modify this text before printing or downloading.`;
    }
};


const StudentFormGeneratorPage: React.FC = () => {
    const { currentPage } = useNavigation();
    const [schoolProfile] = useSchoolProfile();
    const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formContent, setFormContent] = useState('');
    const formRef = useRef<HTMLDivElement>(null);

    // AI Modal State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Fix: Changed currentPage.dataId to currentPage.data to match NavigationState interface
    const formType = currentPage.data as string || 'default';
    const formTitle = FORM_TITLES[formType] || 'Student Form';

     useEffect(() => {
        if (selectedStudent) {
            setFormContent(generateFormTemplate(selectedStudent, formType, schoolProfile));
        }
    }, [selectedStudent, formType, schoolProfile]);


    const uniqueClasses = useMemo(() => {
        const classSet = new Set(students.filter(s => !s.isDeleted && s.class).map(s => s.class));
        return ['All Classes', ...Array.from(classSet).sort()];
    }, [students]);

    const filteredStudents = useMemo(() => {
        return students
            .filter(s => !s.isDeleted)
            .filter(student => (selectedClass === 'All Classes' || student.class === selectedClass))
            .filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                student.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [students, searchTerm, selectedClass]);
    
    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setIsEditing(false); // Reset editing mode when a new student is selected
    };

    const handleChooseAnother = () => {
        setSelectedStudent(null);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (formRef.current && typeof html2canvas === 'function') {
            html2canvas(formRef.current, { scale: 2, useCORS: true }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = `${formTitle.replace(/\s+/g, '_')}_${selectedStudent?.name.replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const handleGenerateWithAi = async () => {
        if (!aiPrompt.trim() || !selectedStudent) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `You are a helpful school administrative assistant. You are writing a document for a student.
Document Type: "${formTitle}"
Student Name: ${selectedStudent.name}
Student Class: ${selectedStudent.class}
Father's Name: ${selectedStudent.fatherName}
Based on the user's request below, please generate the full text content for the document. Be formal and professional.
---
User Request: "${aiPrompt}"
---`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
            });

            const generatedText = response.text;
            setFormContent(generatedText);
            setIsEditing(true); // Switch to editing mode to show the new content
            setIsAiModalOpen(false);
            setAiPrompt('');
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("An error occurred while generating content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };


    const AiModal = () => (
        <div className="modal-overlay" onClick={() => setIsAiModalOpen(false)}>
            <div className="modal-container neo-container max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-xl font-semibold flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        <span>Write with AI</span>
                    </h3>
                    <button onClick={() => setIsAiModalOpen(false)} className="neo-button rounded-full p-1"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg></button>
                </div>
                <div className="p-6 space-y-4">
                    <label htmlFor="ai-prompt" className="text-sm font-medium">What should the form content be about?</label>
                    <textarea
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., 'Write a leave application for 3 days due to a family function'"
                        rows={4}
                        className="neo-button w-full rounded-xl p-3"
                    />
                </div>
                <div className="flex items-center justify-end p-6 space-x-2 border-t">
                    <button onClick={() => setIsAiModalOpen(false)} className="neo-button rounded-xl px-5 py-2.5">Cancel</button>
                    <button onClick={handleGenerateWithAi} disabled={isGenerating} className="neo-button-primary rounded-xl px-5 py-2.5 flex items-center justify-center w-32">
                        {isGenerating ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : "Generate"}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <PageWrapper page={Page.StudentFormGenerator}>
            {isAiModalOpen && <AiModal />}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Panel: Student Selection */}
                <div className="lg:w-1/3 xl:w-1/4 flex-shrink-0">
                    <div className="neo-container rounded-xl p-4 sticky top-24">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Select Student</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="neo-button w-full rounded-xl p-3"
                            />
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="neo-button w-full rounded-xl p-3"
                            >
                                {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                            </select>
                        </div>
                        <div className="mt-4 max-h-[50vh] overflow-y-auto space-y-2 pr-2">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <button 
                                        key={student.id} 
                                        onClick={() => handleSelectStudent(student)} 
                                        className={`neo-button p-3 rounded-lg w-full flex items-center space-x-3 text-left transition-all duration-200 ${selectedStudent?.id === student.id ? 'active' : ''}`}
                                    >
                                        <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="neo-container rounded-full w-10 h-10 object-cover flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm">{student.name}</p>
                                            <p className="text-xs text-gray-600">{student.id} - {student.class}</p>
                                        </div>
                                    </button>
                                ))
                            ) : <p className="text-center text-gray-500 py-4">No students found.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form Preview & Actions */}
                <div className="lg:w-2/3 xl:w-3/4">
                    <div className="neo-container rounded-xl p-6">
                        {!selectedStudent ? (
                            <div className="text-center py-24 flex flex-col items-center justify-center h-full min-h-[60vh]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <p className="text-lg font-semibold text-gray-700">Select a student from the list</p>
                                <p className="text-sm text-gray-500 mt-1">Their form will be generated here.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-wrap gap-2 justify-between items-center mb-4 pb-4 border-b no-print">
                                    <div className="flex items-center space-x-3">
                                        <StudentPhoto studentId={selectedStudent.id} hasPhoto={selectedStudent.hasPhoto} alt={selectedStudent.name} className="neo-container w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <p className="font-bold text-lg">{selectedStudent.name}</p>
                                            <p className="text-sm text-gray-500">{formTitle}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleChooseAnother} className="neo-button rounded-full p-2 text-red-500" title="Deselect Student">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-4 no-print">
                                    <button onClick={() => setIsEditing(!isEditing)} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-2">
                                        {isEditing ? '✓ Finish Editing' : '✎ Edit Form'}
                                    </button>
                                    <button onClick={() => setIsAiModalOpen(true)} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-2">
                                        ✨ Write with AI
                                    </button>
                                    <div className="flex-grow"></div>
                                    <button onClick={handleDownload} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-2">
                                        ⤓ Download
                                    </button>
                                    <button onClick={handlePrint} className="neo-button-primary rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-2">
                                        ⎙ Print
                                    </button>
                                </div>
                                
                                <div id="form-to-print" ref={formRef} className="bg-white p-8 border rounded-lg shadow-inner max-h-[60vh] overflow-y-auto">
                                    <div className="text-center mb-8 border-b pb-4">
                                        <SchoolLogo 
                                            hasLogo={schoolProfile.hasLogo} 
                                            alt="School Logo" 
                                            className="mx-auto mb-2 w-16 h-16 rounded-full"
                                            style={{ transform: `scale(${(schoolProfile.logoSize || 100) / 100})` }}
                                        />
                                        <h1 className="text-3xl font-bold">{schoolProfile.name}</h1>
                                        <p className="text-sm">{schoolProfile.schoolAddress}</p>
                                        <h2 className="text-2xl font-semibold mt-6 underline">{formTitle}</h2>
                                    </div>

                                    {isEditing ? (
                                        <textarea
                                            value={formContent}
                                            onChange={(e) => setFormContent(e.target.value)}
                                            className="w-full h-[25rem] p-2 border rounded font-mono text-sm bg-blue-50/50"
                                        />
                                    ) : (
                                        <div className="space-y-4 text-gray-800 whitespace-pre-wrap font-serif text-base leading-relaxed">
                                            {formContent}
                                        </div>
                                    )}
                                    
                                    <div className="pt-24 flex justify-between">
                                        <p className="pt-4 border-t-2 border-dotted">Parent's Signature</p>
                                        <p className="pt-4 border-t-2 border-dotted">Principal's Signature</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default StudentFormGeneratorPage;