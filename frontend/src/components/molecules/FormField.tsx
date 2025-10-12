import React from 'react';
import { Label } from '../atoms/Label';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, children, className = '' }) => {
  return (
    <div className={`space-y-1 ${className}`.trim()}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
};

export default FormField;


