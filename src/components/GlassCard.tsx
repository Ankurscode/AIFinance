import { useTheme } from '../context/ThemeContext';
import { ReactNode } from 'react';

interface GlassCardProps {
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  iconColor?: 'emerald' | 'blue' | 'purple' | 'red' | 'amber';
}

const colorMap = {
  emerald: {
    dark: 'text-emerald-400',
    light: 'text-emerald-600',
  },
  blue: {
    dark: 'text-blue-400',
    light: 'text-blue-600',
  },
  purple: {
    dark: 'text-purple-400',
    light: 'text-purple-600',
  },
  red: {
    dark: 'text-red-400',
    light: 'text-red-600',
  },
  amber: {
    dark: 'text-amber-400',
    light: 'text-amber-600',
  },
};

export function GlassCard({ children, className = '', icon, title, subtitle, iconColor = 'blue' }: GlassCardProps) {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`w-full p-4 sm:p-6 rounded-xl backdrop-blur-2xl backdrop-saturate-150 shadow-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/50' 
          : 'bg-white/60 border border-gray-200/50 hover:bg-white/70'
      } ${className}`}
    >
      {(icon || title) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          {icon && (
            <div className={`flex-shrink-0 p-2 sm:p-3 rounded-xl backdrop-blur-xl ${
              isDarkMode 
                ? `bg-gray-700/40 ${colorMap[iconColor].dark}`
                : `bg-gray-50/40 ${colorMap[iconColor].light}`
            }`}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`text-base sm:text-lg font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
} 