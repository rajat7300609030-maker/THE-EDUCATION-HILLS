import React, { ReactNode } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string | null;
  confirmButtonVariant?: 'default' | 'danger' | 'success';
  variant?: 'default' | 'danger' | 'success';
  children?: ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonVariant = 'danger',
  variant = 'default',
  children,
}) => {
  if (!isOpen) return null;

  const headerClasses = `flex items-start justify-between p-5 border-b border-gray-300 rounded-t-2xl ${
    variant === 'danger' ? 'modal-header-danger' : ''
  } ${
    variant === 'success' ? 'modal-header-success' : ''
  }`;

  const getButtonClasses = () => {
    switch (confirmButtonVariant) {
      case 'danger':
        return 'neo-button-danger';
      case 'success':
        return 'neo-button-success';
      case 'default':
      default:
        return 'neo-button text-blue-600 active:text-blue-700';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container neo-container" onClick={(e) => e.stopPropagation()}>
        <div className={headerClasses}>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
             {variant === 'danger' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {variant === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            <span>{title}</span>
          </h3>
          <button 
            type="button" 
            className={(variant === 'danger' || variant === 'success') ? 'close-button' : 'neo-button rounded-full p-1 ml-auto inline-flex items-center'} 
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-base leading-relaxed text-gray-600">
            {message}
          </p>
          {children}
        </div>
        <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-300 rounded-b-2xl">
          {cancelText && (
            <button onClick={onClose} type="button" className="neo-button rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700">{cancelText}</button>
          )}
          <button 
            onClick={onConfirm} 
            type="button" 
            className={`rounded-xl px-5 py-2.5 text-sm font-medium flex items-center justify-center space-x-2 ${getButtonClasses()}`}
          >
             {confirmButtonVariant === 'danger' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
             )}
             {confirmButtonVariant === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" /></svg>
             )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;