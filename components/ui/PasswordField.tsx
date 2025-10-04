import React, { useState } from 'react';
import FormField from './FormField';

interface PasswordFieldProps {
    label: string;
    // Fix: Changed icon type from JSX.Element to React.ReactNode to resolve namespace issue.
    icon: React.ReactNode;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    placeholder?: string;
    required?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, icon, value, onChange, name, placeholder, required }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <FormField label={label} icon={icon}>
            <div className="relative">
                <input
                    type={isVisible ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="neo-button w-full p-3 rounded-xl pr-10"
                    placeholder={placeholder}
                    required={required}
                />
                <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                >
                    {isVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.11 3.522-5.44 6.812-6.18M15.55 5.55a11.93 11.93 0 012.05 1.83M2.458 12C3.732 7.943 7.523 5 12 5c1.13 0 2.213.197 3.22.56M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 2l20 20" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>
        </FormField>
    );
};

export default PasswordField;