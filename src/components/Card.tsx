import React from 'react';

interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`
        bg-background border border-secondary rounded-lg p-6 shadow-md
        transition-all duration-200
        ${hoverable ? 'cursor-pointer hover:shadow-lg hover:border-cta hover:-translate-y-0.5' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
