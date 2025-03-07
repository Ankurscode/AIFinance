import { InputHTMLAttributes, forwardRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const { isDarkMode } = useTheme();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className={`mt-1 text-sm ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {error}
          </p>
        )}
      </div>
    );
  }
); 