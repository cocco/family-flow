import React from 'react';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  small?: boolean;
}

const variantToClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-600',
  success: 'bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600',
  secondary: 'border focus-visible:ring-gray-400',
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', small = false, className = '', ...props }) => {
  const sizeClasses = small ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm';
  const baseClasses = 'rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60';
  const classes = `${variantToClasses[variant]} ${sizeClasses} ${baseClasses} ${className}`.trim();
  return <button {...props} className={classes} />;
};

export default Button;


