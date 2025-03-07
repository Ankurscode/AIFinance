import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, Wallet, BarChart2, Target, MessageSquare } from 'lucide-react';

export function Home() {
  const { isDarkMode } = useTheme();

  const features = [
    {
      title: 'Smart Transaction Tracking',
      description: 'Automatically categorize and track your income and expenses with AI-powered insights.',
      icon: Wallet,
      link: '/transactions',
    },
    {
      title: 'Advanced Analytics',
      description: 'Get detailed financial reports and visualizations to understand your spending patterns.',
      icon: BarChart2,
      link: '/analytics',
    },
    {
      title: 'Financial Goals',
      description: 'Set and track your financial goals with personalized recommendations.',
      icon: Target,
      link: '/goals',
    },
    {
      title: 'AI Financial Assistant',
      description: 'Get personalized financial advice and insights from our AI-powered chatbot.',
      icon: MessageSquare,
      link: '/chatbot',
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to AiFinance
          </h1>
          <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your intelligent financial management companion
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                to={feature.link}
                className={`group p-6 rounded-xl transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`p-3 rounded-lg w-fit ${
                  isDarkMode
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className={`mt-4 text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
                <div className={`mt-4 flex items-center text-sm font-medium ${
                  isDarkMode
                    ? 'text-emerald-400 group-hover:text-emerald-300'
                    : 'text-emerald-600 group-hover:text-emerald-500'
                }`}>
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className={`mt-16 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>Don't have an account yet?</p>
          <Link
            to="/signup"
            className={`mt-2 inline-block px-6 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}