import React from 'react';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 cursor-pointer';

  const variantStyles = {
    primary: 'bg-cta text-white hover:opacity-90 hover:-translate-y-0.5 shadow-md hover:shadow-lg',
    secondary: 'bg-cta/10 text-cta border-2 border-cta hover:bg-cta/20',
    danger: 'bg-error text-white hover:opacity-90',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledStyles = disabled || loading ? 'opacity-40 cursor-not-allowed !translate-y-0 !shadow-md' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
