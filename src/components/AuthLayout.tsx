import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Wallet } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full mx-auto px-6">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Wallet className={`h-8 w-8 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AiFinance
            </span>
          </Link>
          <h2 className={`mt-6 text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        </div>

        <div className={`rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {children}
        </div>

        <p className={`mt-8 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {footerText}{' '}
          <Link
            to={footerLinkTo}
            className={`font-medium ${
              isDarkMode
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-emerald-600 hover:text-emerald-500'
            }`}
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
} 