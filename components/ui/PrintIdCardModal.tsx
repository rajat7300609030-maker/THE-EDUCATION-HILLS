import React, { useRef, useState, ComponentType } from 'react';
import { Student } from '../../types';
import Style1Classic from '../pages/student/id_card_styles/Style1Classic';
import Style2ModernVertical from '../pages/student/id_card_styles/Style2ModernVertical';
import Style3VibrantGradient from '../pages/student/id_card_styles/Style3VibrantGradient';
import Style4MinimalistMono from '../pages/student/id_card_styles/Style4MinimalistMono';
import Style5Playful from '../pages/student/id_card_styles/Style5Playful';

declare const html2canvas: any;

interface CardStyleProps { student: Student; }
interface PrintIdCardModalProps { isOpen: boolean; onClose: () => void; student: Student; }

const CARD_STYLES: Record<string, { name: string; component: ComponentType<CardStyleProps & { ref: React.Ref<HTMLDivElement> }>; }> = {
    style1: { name: 'Classic', component: Style1Classic },
    style2: { name: 'Modern Vertical', component: Style2ModernVertical },
    style3: { name: 'Vibrant Gradient', component: Style3VibrantGradient },
    style4: { name: 'Minimalist Mono', component: Style4MinimalistMono },
    style5: { name: 'Playful', component: Style5Playful },
};

const PrintIdCardModal: React.FC<PrintIdCardModalProps> = ({ isOpen, onClose, student }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [cardStyle, setCardStyle] = useState('style1');

    if (!isOpen) return null;

    const CardComponent = CARD_STYLES[cardStyle].component;
    
    const handleDownload = () => {
        if (cardRef.current) {
            html2canvas(cardRef.current, { useCORS: true, scale: 3 }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = `ID_Card_${student.name.replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const handlePrint = () => {
        if (!cardRef.current) return;
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) return;

        const cardHtml = cardRef.current.outerHTML;
        const styles = `
            @page { margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .id-card-for-print { box-shadow: none !important; border: 1px dashed #ccc !important; }
            .id-card-for-print.landscape { width: 85.60mm !important; height: 53.98mm !important; }
            .id-card-for-print.portrait { width: 53.98mm !important; height: 85.60mm !important; }
        `;
        printWindow.document.write(`<html><head><title>Print ID</title><script src="https://cdn.tailwindcss.com"></script><style>${styles}</style></head><body>${cardHtml}</body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container neo-container max-w-xl" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b"><h3 className="text-xl font-semibold">Print ID Card for {student.name}</h3></div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Select Card Style</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(CARD_STYLES).map(([id, { name }]) => (
                                <button key={id} onClick={() => setCardStyle(id)} className={`neo-button text-xs font-semibold rounded-full px-3 py-1.5 ${cardStyle === id ? 'active' : ''}`}>{name}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center items-center p-4 neo-container rounded-lg bg-gray-200">
                        <CardComponent ref={cardRef} student={student} />
                    </div>
                </div>
                <div className="flex items-center justify-end p-6 space-x-2 border-t">
                    <button onClick={onClose} type="button" className="neo-button rounded-xl px-5 py-2.5">Close</button>
                    <button onClick={handleDownload} type="button" className="neo-button-success rounded-xl px-5 py-2.5">Download</button>
                    <button onClick={handlePrint} type="button" className="neo-button-primary rounded-xl px-5 py-2.5">Print</button>
                </div>
            </div>
        </div>
    );
};

export default PrintIdCardModal;
