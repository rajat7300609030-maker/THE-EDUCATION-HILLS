import React, { useState, useEffect } from 'react';
import { PaymentRecord } from '../../types';
import FormField from './FormField';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: PaymentRecord, originalAmount: number) => void;
  paymentRecord: PaymentRecord | null;
  feesTypes: string[];
}

const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ isOpen, onClose, onSave, paymentRecord, feesTypes }) => {
  const [formData, setFormData] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    if (paymentRecord) {
      // Format date for input[type=date]
      const dateForInput = new Date(paymentRecord.date).toISOString().split('T')[0];
      setFormData({ ...paymentRecord, date: dateForInput });
    }
  }, [paymentRecord]);
  
  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: name === 'amount' ? Number(value) : value } : null);
  };
  
  const handleSave = () => {
    if (formData && paymentRecord) {
        // Convert date back to ISO string for storage
        const recordToSave: PaymentRecord = {
            ...formData,
            date: new Date(formData.date).toISOString()
        };
        onSave(recordToSave, paymentRecord.amount);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container neo-container max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-gray-300 rounded-t-2xl">
          <h3 className="text-xl font-semibold text-gray-900">Edit Payment Record</h3>
          <button type="button" className="neo-button rounded-full p-1 ml-auto inline-flex items-center" onClick={onClose}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
            <FormField label="Amount" icon={<span className="h-5 w-5 text-green-600 font-bold">₹</span>}>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" min="0" />
            </FormField>
            <FormField label="Payment Date" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700"/>
            </FormField>
            <FormField label="Fees Type" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V7a4 4 0 014-4z" /></svg>}>
                <select name="feesType" value={formData.feesType} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                    {feesTypes.map(ft => (
                        <option key={ft} value={ft}>{ft}</option>
                    ))}
                </select>
            </FormField>
            <FormField label="Payment Instrument" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}>
                <select name="instrument" value={formData.instrument} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700 appearance-none">
                    <option>Cash</option><option>Cheque</option><option>Online (UPI/NetBanking)</option><option>Card (Debit/Credit)</option>
                </select>
            </FormField>
            {formData.instrument !== 'Cash' && (
                <FormField label="Instrument Details" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                    <input type="text" name="instrumentDetails" value={formData.instrumentDetails || ''} onChange={handleChange} placeholder={formData.instrument === 'Cheque' ? 'Cheque No.' : 'Transaction ID'} className="neo-button w-full rounded-xl p-3 text-gray-700"/>
                </FormField>
            )}
        </div>

        <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-300 rounded-b-2xl">
          <button onClick={onClose} type="button" className="neo-button rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
          <button onClick={handleSave} type="button" className="neo-button-success rounded-xl px-5 py-2.5 text-sm font-medium">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditPaymentModal;
