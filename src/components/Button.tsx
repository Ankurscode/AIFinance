import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const { isDarkMode } = useTheme();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: isDarkMode
      ? 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500'
      : 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500',
    secondary: isDarkMode
      ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    danger: isDarkMode
      ? 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500'
      : 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
} 