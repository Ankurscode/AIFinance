import { useEffect } from 'react';
import { useFinanceStore } from '../lib/supabase-realtime';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { PiggyBank, LineChart, Target, Receipt, Wallet, DollarSign, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PageLayout } from '../components/PageLayout';
import { GlassCard } from '../components/GlassCard';

export function Dashboard() {
  const { subscribeToTransactions, unsubscribeFromTransactions, transactions } = useFinanceStore();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        subscribeToTransactions(user.id);
      }
    };

    getUser();

    return () => {
      unsubscribeFromTransactions();
    };
  }, [subscribeToTransactions, unsubscribeFromTransactions]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netIncome = totalIncome - totalExpenses;

  const stats = [
    {
      title: 'Total Income',
      value: `$${totalIncome.toLocaleString()}`,
      icon: Wallet,
      iconColor: 'emerald' as const,
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'red' as const,
    },
    {
      title: 'Net Income',
      value: `$${netIncome.toLocaleString()}`,
      icon: TrendingUp,
      iconColor: 'blue' as const,
    },
    {
      title: 'Total Transactions',
      value: transactions.length.toString(),
      icon: Target,
      iconColor: 'purple' as const,
    },
  ];

  const quickLinks = [
    {
      title: 'Transactions',
      description: 'View and manage your transactions',
      icon: Receipt,
      to: '/transactions',
      iconColor: 'blue' as const,
    },
    {
      title: 'Analytics',
      description: 'Analyze your financial data',
      icon: LineChart,
      to: '/analytics',
      iconColor: 'purple' as const,
    },
    {
      title: 'Goals',
      description: 'Track your financial goals',
      icon: PiggyBank,
      to: '/goals',
      iconColor: 'emerald' as const,
    },
  ];

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Overview of your finances"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat) => (
            <GlassCard
              key={stat.title}
              icon={<stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />}
              title={stat.title}
              subtitle={stat.value}
              iconColor={stat.iconColor}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <GlassCard
                icon={<link.icon className="h-5 w-5 sm:h-6 sm:w-6" />}
                title={link.title}
                subtitle={link.description}
                iconColor={link.iconColor}
                className="h-full hover:scale-102 sm:hover:scale-105 transition-transform"
              />
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}