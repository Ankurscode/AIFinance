import { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sidebar } from './Sidebar';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageLayout({ children, title, subtitle, actions }: PageLayoutProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />
      <main className="lg:pl-20 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`mt-1 text-sm sm:text-base ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex-shrink-0 flex items-center">
                {actions}
              </div>
            )}
          </div>
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 