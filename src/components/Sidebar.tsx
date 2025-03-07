import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Receipt, LineChart, Target, User, 
  Moon, Sun, MessageSquare, ChevronLeft, ChevronRight, Wallet 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'AI Assistant', href: '/chatbot', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden ${isCollapsed ? 'hidden' : 'block'}`} onClick={() => setIsCollapsed(true)} />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full transition-all duration-300 ease-in-out z-50 
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'}
        ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
        border-r backdrop-blur-2xl backdrop-saturate-150`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center p-4 ${!isCollapsed ? 'justify-between' : 'justify-center'}`}>
            <Link to="/dashboard" className="flex items-center space-x-3">
              <Wallet className={`h-8 w-8 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
              {!isCollapsed && (
                <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  AiFinance
                </span>
              )}
            </Link>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? isDarkMode
                        ? 'bg-gray-800/80 text-white'
                        : 'bg-gray-100/80 text-gray-900'
                      : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900'
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden lg:block p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={`fixed bottom-6 left-6 z-50 lg:hidden p-3 rounded-full shadow-lg transition-colors ${
          isDarkMode
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'bg-white text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
} 