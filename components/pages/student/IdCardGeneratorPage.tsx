import React, { useRef, useState, useMemo, forwardRef, ComponentType } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { getInitialStudents } from '../../../utils/seedData';
import Style1Classic from './id_card_styles/Style1Classic';
import Style2ModernVertical from './id_card_styles/Style2ModernVertical';
import Style3VibrantGradient from './id_card_styles/Style3VibrantGradient';
import Style4MinimalistMono from './id_card_styles/Style4MinimalistMono';
import Style5Playful from './id_card_styles/Style5Playful';


declare const html2canvas: any;

interface CardStyleProps {
    student: Student;
}

const CARD_STYLES: Record<string, { name: string; component: ComponentType<CardStyleProps & { ref: React.Ref<HTMLDivElement> }>; previewClass: string; }> = {
    style1: { name: 'Classic', component: Style1Classic, previewClass: 'bg-blue-600' },
    style2: { name: 'Modern Vertical', component: Style2ModernVertical, previewClass: 'bg-gray-800' },
    style3: { name: 'Vibrant Gradient', component: Style3VibrantGradient, previewClass: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
    style4: { name: 'Minimalist Mono', component: Style4MinimalistMono, previewClass: 'bg-gray-200 border border-gray-400' },
    style5: { name: 'Playful', component: Style5Playful, previewClass: 'bg-yellow-400' },
};

// This component is a wrapper that handles the print/download logic for any given card style component.
const StudentIdCardWrapper: React.FC<{ student: Student, CardComponent: ComponentType<CardStyleProps & { ref: React.Ref<HTMLDivElement> }> }> = ({ student, CardComponent }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        if (cardRef.current) {
            html2canvas(cardRef.current, { useCORS: true, scale: 3 }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = `ID_Card_${student.name.replace(/\s+/g, '_')}_${student.id}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const handlePrint = () => {
        if (!cardRef.current) return;

        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) {
            alert('Could not open print window. Please disable pop-up blockers.');
            return;
        }

        const cardHtml = cardRef.current.outerHTML;
        const printStyles = `
            <style>
                @page { margin: 0; }
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .id-card-for-print { box-shadow: none !important; border: none !important; break-inside: avoid; transform: scale(1.02); }
                .id-card-for-print.landscape { width: 85.60mm !important; height: 53.98mm !important; }
                .id-card-for-print.portrait { width: 53.98mm !important; height: 85.60mm !important; }
            </style>
        `;
        const tailwindCdn = `<script src="https://cdn.tailwindcss.com"></script>`;
        
        printWindow.document.write(`<html><head><title>Print ID Card - ${student.name}</title>${tailwindCdn}${printStyles}</head><body>${cardHtml}</body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 500);
    };
    
    return (
      <div className="id-card-container break-inside-avoid flex flex-col items-center">
        <CardComponent ref={cardRef} student={student} />
         <div className="mt-4 flex justify-center space-x-2 no-print">
            <button onClick={handleDownload} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Download</span>
            </button>
             <button onClick={handlePrint} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                <span>Print</span>
            </button>
        </div>
      </div>
    );
};


const IdCardGeneratorPage: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', getInitialStudents);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All Classes');
    const [cardStyle, setCardStyle] = useState('style1');

    const uniqueClasses = useMemo(() => {
        const classSet = new Set(students.filter(s => !s.isDeleted && s.class).map(s => s.class));
        return ['All Classes', ...Array.from(classSet).sort()];
    }, [students]);

    const filteredStudents = useMemo(() => {
        return students
            .filter(s => !s.isDeleted)
            .filter(student => (selectedClass === 'All Classes' || student.class === selectedClass))
            .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [students, searchTerm, selectedClass]);


    const handlePrintAll = () => {
        window.print();
    };
    
    const CardComponent = CARD_STYLES[cardStyle].component;

    return (
        <PageWrapper page={Page.IdCardGenerator}>
            {/* Controls Section */}
            <div className="mb-8 p-4 neo-container rounded-2xl space-y-6 no-print">
                {/* Style Chooser */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 text-center">Choose ID Card Style</h3>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {Object.entries(CARD_STYLES).map(([styleId, { name, previewClass }]) => (
                        <button 
                            key={styleId} 
                            onClick={() => setCardStyle(styleId)} 
                            className={`neo-button rounded-lg p-2 text-center transition-all duration-200 ${cardStyle === styleId ? 'active' : ''}`}
                        >
                            <div className={`w-20 h-12 rounded-md ${previewClass} mx-auto mb-2 shadow-inner`}></div>
                            <span className="text-xs font-semibold text-gray-700">{name}</span>
                        </button>
                    ))}
                  </div>
                </div>

                {/* Filters & Print All */}
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 border-t border-gray-300 pt-6">
                    <div className="w-full flex-grow flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="relative w-full sm:w-1/2">
                            <input
                                type="text"
                                placeholder="Search by student name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="neo-button w-full rounded-xl p-3 pl-10 text-gray-700 focus:outline-none"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <div className="relative w-full sm:w-1/2">
                            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                                {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    <button onClick={handlePrintAll} className="neo-button rounded-xl px-6 py-3 text-base font-semibold text-gray-700 flex items-center space-x-2 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        <span>Print All</span>
                    </button>
                </div>
            </div>

            <div id="printable-area">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <StudentIdCardWrapper key={student.id} student={student} CardComponent={CardComponent} />
                        ))
                    ) : (
                        <div className="col-span-full neo-container rounded-xl p-8 text-center">
                            <p className="text-lg font-semibold text-gray-700">No Students Found</p>
                            <p className="text-sm text-gray-500 mt-2">Please adjust your search term or class filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default IdCardGeneratorPage;