import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  const classes = `mt-1 w-full border rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${props.type === 'number' ? 'focus-visible:ring-green-600' : 'focus-visible:ring-blue-600'} ${className}`.trim();
  return <input {...props} className={classes} />;
};

export default Input;


