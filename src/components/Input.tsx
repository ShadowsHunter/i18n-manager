import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text
          focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/20
          transition-all duration-200
          ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-sm text-error">{error}</span>
      )}
    </div>
  );
};
