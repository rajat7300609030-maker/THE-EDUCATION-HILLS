import React, { useRef, forwardRef } from 'react';
import { Student } from '../../types';
import StudentPhoto from './StudentPhoto';

declare const html2canvas: any;

interface PrintFeesCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

const FeeCard = forwardRef<HTMLDivElement, { student: Student }>(({ student }, ref) => {
    const feesPaid = student.feesPaid || 0;
    const totalFees = student.totalFees || 0;
    const balance = totalFees - feesPaid;
    const progress = totalFees > 0 ? (feesPaid / totalFees) * 100 : 0;
    const getStatus = () => {
        if (balance <= 0) return { text: 'PAID', color: 'bg-green-500', stampColor: 'text-green-500' };
        return { text: 'DUES PENDING', color: 'bg-red-500', stampColor: 'text-red-500' };
    };
    const { text: statusText, color: progressColor, stampColor } = getStatus();
    const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString('en-IN')}`;

    return (
        <div ref={ref} className="fee-card-for-print bg-slate-50 neo-container rounded-2xl w-full max-w-md mx-auto overflow-hidden flex flex-col">
            <div className="p-3 bg-gray-100 border-b flex items-center justify-between">
                <div>
                    <h1 className="font-extrabold text-sm text-gray-800">THE EDUCATION HILLS</h1>
                    <p className="text-[10px] text-gray-500">FEES STATUS REPORT (2025-26)</p>
                </div>
            </div>
            <div className="p-4 flex-grow flex space-x-4">
                <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt={student.name} className="w-24 h-28 object-cover rounded-md border-2 border-white shadow-md flex-shrink-0" />
                <div className="flex-grow">
                    <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                    <p className="text-xs text-gray-500">ID: {student.id} | Class: {student.class}</p>
                    <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between items-center"><span className="font-semibold text-gray-600">Total Fees:</span><span className="font-bold text-blue-800">{formatCurrency(totalFees)}</span></div>
                        <div className="flex justify-between items-center"><span className="font-semibold text-gray-600">Total Paid:</span><span className="font-bold text-green-800">{formatCurrency(feesPaid)}</span></div>
                        <div className="flex justify-between items-center"><span className="font-semibold text-gray-600">Balance:</span><span className="font-bold text-red-800">{formatCurrency(balance)}</span></div>
                    </div>
                </div>
            </div>
            <div className="p-3 bg-gray-100 border-t flex items-center justify-between">
                <div className="w-full h-2.5 bg-gray-200 rounded-full neo-button"><div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div></div>
                <div className={`font-black text-xl uppercase opacity-20 -rotate-12 ${stampColor} select-none ml-4`}>{statusText}</div>
            </div>
        </div>
    );
});


const PrintFeesCardModal: React.FC<PrintFeesCardModalProps> = ({ isOpen, onClose, student }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handleDownload = () => {
        if (cardRef.current) {
            html2canvas(cardRef.current, { useCORS: true, scale: 2 }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = `Fees_Card_${student.name.replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    const handlePrint = () => {
        if (!cardRef.current) return;
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) return;
        printWindow.document.write(`<html><head><title>Print Fees Card</title><script src="https://cdn.tailwindcss.com"></script><style>@page { margin: 1cm; } body { font-family: sans-serif; }</style></head><body>${cardRef.current.outerHTML}</body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container neo-container max-w-xl" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b"><h3 className="text-xl font-semibold">Print Fees Card for {student.name}</h3></div>
                <div className="p-6 flex justify-center items-center bg-gray-200 neo-container rounded-lg">
                    <FeeCard ref={cardRef} student={student} />
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

export default PrintFeesCardModal;
