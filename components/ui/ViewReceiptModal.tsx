import React, { useRef } from 'react';
import { Student, PaymentRecord } from '../../types';
import useSchoolProfile from '../../hooks/useSchoolProfile';
import SchoolLogo from './SchoolLogo';

interface ViewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  paymentRecord: PaymentRecord | null;
}

// Declare html2canvas to avoid TypeScript errors since it's loaded from a script tag.
declare const html2canvas: any;

const ViewReceiptModal: React.FC<ViewReceiptModalProps> = ({ isOpen, onClose, student, paymentRecord }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [schoolProfile] = useSchoolProfile();

  if (!isOpen || !student || !paymentRecord) return null;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const numberToWords = (num: number): string => {
      if (num === 0) return "Zero";
      
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      const numToWords = (n: number): string => {
          let str = "";
          if (n > 99) {
              str += ones[Math.floor(n / 100)] + " Hundred ";
              n %= 100;
          }
          if (n > 19) {
              str += tens[Math.floor(n / 10)] + " " + ones[n % 10];
          } else {
              str += ones[n];
          }
          return str.trim();
      };
      
      let words = "";
      if (num >= 10000000) {
          words += numToWords(Math.floor(num / 10000000)) + " Crore ";
          num %= 10000000;
      }
      if (num >= 100000) {
          words += numToWords(Math.floor(num / 100000)) + " Lakh ";
          num %= 100000;
      }
      if (num >= 1000) {
          words += numToWords(Math.floor(num / 1000)) + " Thousand ";
          num %= 1000;
      }
      if (num > 0) {
          words += numToWords(num);
      }
      
      return words.trim();
  };

  const handlePrint = () => {
    const content = receiptRef.current;
    if (content) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Receipt</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        printWindow.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }</style>');
        printWindow.document.write('</head><body class="bg-gray-100 p-8">');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };
  
  const handleDownload = () => {
    const content = receiptRef.current;
    if (content && typeof html2canvas === 'function') {
      html2canvas(content, { 
        useCORS: true, 
        scale: 2 // Higher scale for better quality image
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `Receipt_${student.name.replace(/\s+/g, '_')}_${paymentRecord.receiptNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } else {
      alert("Could not initiate download. The required library might not be loaded.");
    }
  };

  const sortedHistory = student.paymentHistory
        .filter(p => !p.isDeleted)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
  const balance = student.totalFees - (student.feesPaid || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container neo-container max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-300 dark:border-gray-700 rounded-t-2xl">
          <h3 className="text-xl font-semibold">Payment Receipt</h3>
          <button type="button" className="neo-button rounded-full p-1 ml-auto inline-flex items-center" onClick={onClose}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        
        <div ref={receiptRef} className="p-6 bg-white text-black">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-dashed pb-4">
            <SchoolLogo 
              hasLogo={schoolProfile.hasLogo} 
              alt="School Logo" 
              className="mx-auto mb-2 w-12 h-12 rounded-full" 
              style={{ transform: `scale(${(schoolProfile.logoSize || 100) / 100})` }}
            />
            <h1 className="text-2xl font-bold text-slate-900">{schoolProfile.name}</h1>
            <p className="text-sm text-slate-600">{schoolProfile.motto}</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">Session: {schoolProfile.session}</p>
          </div>
          
          {/* Receipt Details */}
          <div className="flex justify-between text-sm mb-4">
            <div className="space-y-1">
              <p><strong className="font-medium text-slate-600">Receipt No:</strong> <span className="text-slate-800 font-mono">{paymentRecord.receiptNumber}</span></p>
              <p><strong className="font-medium text-slate-600">Date:</strong> <span className="text-slate-800">{formatDate(paymentRecord.date)}</span></p>
            </div>
             <div className="text-right space-y-1">
              <p><strong className="font-medium text-slate-600">Student ID:</strong> <span className="text-slate-800">{student.id}</span></p>
              <p><strong className="font-medium text-slate-600">Class:</strong> <span className="text-slate-800">{student.class}</span></p>
            </div>
          </div>
          
          {/* Student Details */}
          <div className="mb-6 bg-slate-50 p-3 rounded-lg">
            <p className="text-sm"><strong className="font-medium text-slate-600">Received From:</strong> <span className="text-slate-900 font-semibold">{student.name}</span></p>
            <p className="text-sm"><strong className="font-medium text-slate-600">S/o:</strong> <span className="text-slate-800">{student.fatherName}</span></p>
          </div>
          
          {/* Items Table */}
          <h4 className="font-semibold text-slate-700 mb-2">Transaction History:</h4>
          <table className="w-full text-left text-sm mb-4">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                <th className="p-2 font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                <th className="p-2 text-right font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map(record => (
                <tr key={record.receiptNumber} className={`border-b border-slate-200 ${record.receiptNumber === paymentRecord.receiptNumber ? 'bg-blue-50 font-semibold' : ''}`}>
                    <td className="p-2 text-slate-800">{formatDate(record.date)}</td>
                    <td className="p-2 text-slate-800">{record.feesType}</td>
                    <td className="p-2 text-right text-slate-800">{formatCurrency(record.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Amount in Words for current transaction */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm">
                <strong className="font-medium text-slate-600">Amount in Words:</strong>
                <span className="text-slate-800 font-semibold italic ml-2">
                    Rupees {numberToWords(paymentRecord.amount)} Only
                </span>
            </p>
          </div>

          {/* Total Section */}
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-600">Total Fees:</span>
                    <span className="font-bold text-lg text-blue-600">{formatCurrency(student.totalFees)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-600">Total Paid:</span>
                    <span className="font-bold text-lg text-green-600">{formatCurrency(student.feesPaid || 0)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg">
                    <span className="text-md font-bold text-slate-800">Balance Due:</span>
                    <span className="text-xl font-bold text-red-600">{formatCurrency(balance)}</span>
                </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 text-sm border-t pt-4">
            <p><strong className="font-medium text-slate-600">Payment Method (Current Txn):</strong> <span className="text-slate-800">{paymentRecord.instrument} {paymentRecord.instrumentDetails ? `(${paymentRecord.instrumentDetails})` : ''}</span></p>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-400">
            This is a computer-generated receipt and does not require a signature.
          </div>
        </div>

        <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-300 dark:border-gray-700 rounded-b-2xl no-print">
          <button onClick={handleDownload} type="button" className="neo-button-success rounded-xl px-5 py-2.5 text-sm font-medium flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </button>
          <button onClick={handlePrint} type="button" className="neo-button-primary rounded-xl px-5 py-2.5 text-sm font-medium flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print</span>
          </button>
          <button onClick={onClose} type="button" className="neo-button rounded-xl px-5 py-2.5 text-sm font-medium">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewReceiptModal;