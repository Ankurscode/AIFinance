import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PageLayout } from '../components/PageLayout';
import { BarChart2, PieChart, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '../lib/supabase-realtime';
import { GlassCard } from '../components/GlassCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ChartData,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface MonthlyData {
  [key: string]: {
    income: number;
    expenses: number;
  };
}

interface ExpensesByCategory {
  [category: string]: number;
}

interface ChartDataState {
  incomeVsExpenses: ChartData<'bar'>;
  expenseCategories: ChartData<'pie'>;
  monthlyTrends: ChartData<'line'>;
}

export function Analytics() {
  const { isDarkMode } = useTheme();
  const { transactions, subscribeToTransactions, unsubscribeFromTransactions } = useFinanceStore();
  const [chartData, setChartData] = useState<ChartDataState>({
    incomeVsExpenses: {
      labels: [],
      datasets: [],
    },
    expenseCategories: {
      labels: [],
      datasets: [],
    },
    monthlyTrends: {
      labels: [],
      datasets: [],
    },
  });

  // Subscribe to transactions
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

  useEffect(() => {
    // Process transactions for charts
    const processTransactions = () => {
      // Income vs Expenses Data
      const incomeTotal = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expensesTotal = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Expense Categories Data
      const expensesByCategory: ExpensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + Number(t.amount);
          return acc;
        }, {} as ExpensesByCategory);

      // Monthly Trends Data
      const monthlyData: MonthlyData = transactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!acc[monthYear]) {
          acc[monthYear] = { income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          acc[monthYear].income += Number(t.amount);
        } else {
          acc[monthYear].expenses += Number(t.amount);
        }
        return acc;
      }, {} as MonthlyData);

      const months = Object.keys(monthlyData).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });

      setChartData({
        incomeVsExpenses: {
          labels: ['Income', 'Expenses'],
          datasets: [
            {
              data: [incomeTotal, expensesTotal],
              backgroundColor: isDarkMode 
                ? ['rgba(34, 197, 94, 0.5)', 'rgba(239, 68, 68, 0.5)']
                : ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
              borderColor: isDarkMode
                ? ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)']
                : ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
              borderWidth: 1,
            },
          ],
        },
        expenseCategories: {
          labels: Object.keys(expensesByCategory),
          datasets: [
            {
              data: Object.values(expensesByCategory),
              backgroundColor: isDarkMode
                ? [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(236, 72, 153, 0.5)',
                    'rgba(245, 158, 11, 0.5)',
                    'rgba(16, 185, 129, 0.5)',
                    'rgba(139, 92, 246, 0.5)',
                  ]
                : [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                  ],
              borderColor: isDarkMode
                ? Array(Object.keys(expensesByCategory).length).fill('rgba(255, 255, 255, 0.1)')
                : Array(Object.keys(expensesByCategory).length).fill('rgba(0, 0, 0, 0.1)'),
              borderWidth: 1,
            },
          ],
        },
        monthlyTrends: {
          labels: months,
          datasets: [
            {
              label: 'Income',
              data: months.map(month => monthlyData[month].income),
              borderColor: isDarkMode ? 'rgba(34, 197, 94, 0.8)' : 'rgb(34, 197, 94)',
              backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.5)',
              tension: 0.4,
            },
            {
              label: 'Expenses',
              data: months.map(month => monthlyData[month].expenses),
              borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgb(239, 68, 68)',
              backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.5)',
              tension: 0.4,
            },
          ],
        },
      });
    };

    processTransactions();
  }, [transactions, isDarkMode]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 600,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          font: {
            family: "'Inter', sans-serif",
          },
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          font: {
            family: "'Inter', sans-serif",
          },
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          font: {
            family: "'Inter', sans-serif",
          },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 600,
        },
      },
    },
  };

  return (
    <PageLayout
      title="Analytics"
      subtitle="Visualize your financial data"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <GlassCard
          icon={<BarChart2 className="h-5 w-5 sm:h-6 sm:w-6" />}
          title="Income vs Expenses"
          iconColor="emerald"
          className="h-full"
        >
          <div className="h-[300px] lg:h-[400px]">
            {chartData.incomeVsExpenses.datasets.length > 0 && (
              <Bar data={chartData.incomeVsExpenses} options={{
                ...chartOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    display: window.innerWidth > 640,
                  },
                },
              }} />
            )}
          </div>
        </GlassCard>

        <GlassCard
          icon={<PieChart className="h-5 w-5 sm:h-6 sm:w-6" />}
          title="Expense Categories"
          iconColor="blue"
          className="h-full"
        >
          <div className="h-[300px] lg:h-[400px]">
            {chartData.expenseCategories.datasets.length > 0 && (
              <Pie data={chartData.expenseCategories} options={{
                ...pieOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...pieOptions.plugins,
                  legend: {
                    ...pieOptions.plugins.legend,
                    position: window.innerWidth <= 640 ? 'bottom' as const : 'right' as const,
                  },
                },
              }} />
            )}
          </div>
        </GlassCard>

        <GlassCard
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          title="Monthly Trends"
          iconColor="purple"
          className="lg:col-span-2"
        >
          <div className="h-[300px] lg:h-[400px]">
            {chartData.monthlyTrends.datasets.length > 0 && (
              <Line data={chartData.monthlyTrends} options={{
                ...chartOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    display: true,
                    position: 'top' as const,
                  },
                },
              }} />
            )}
          </div>
        </GlassCard>
      </div>
    </PageLayout>
  );
} 