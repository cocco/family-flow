import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className = '', ...props }) => {
  const classes = `bg-white overflow-hidden shadow rounded-lg border border-gray-200 ${className}`.trim();
  return <div {...props} className={classes} />;
};

export default Card;


