import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = '', ...props }) => {
  const classes = `block text-sm text-gray-800 ${className}`.trim();
  return <label {...props} className={classes} />;
};

export default Label;


