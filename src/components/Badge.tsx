import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-info/10 text-info border-info',
    error: 'bg-error/10 text-error border-error',
    warning: 'bg-warning/10 text-warning border-warning',
    info: 'bg-cta/10 text-cta border-cta',
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-sm
        text-xs font-semibold uppercase tracking-wide
        border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
