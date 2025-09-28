import React from 'react';

interface FormFieldProps {
  label: string;
  icon: JSX.Element;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center space-x-3 text-sm font-medium text-gray-700 mb-2">
      {icon}
      <span>{label}</span>
    </label>
    {children}
  </div>
);

export default FormField;
