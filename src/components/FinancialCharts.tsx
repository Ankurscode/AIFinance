import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinanceStore } from '../lib/supabase-realtime';
import { format } from 'date-fns';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1', '#EC4899'];

export function FinancialCharts() {
  const transactions = useFinanceStore((state) => state.transactions);

  const { monthlyData, categoryData } = useMemo(() => {
    const monthly: Record<string, { income: number; expense: number }> = {};
    const categories: Record<string, number> = {};

    transactions.forEach((t) => {
      // Monthly data
      const monthKey = format(new Date(t.date), 'MMM yyyy');
      if (!monthly[monthKey]) {
        monthly[monthKey] = { income: 0, expense: 0 };
      }
      monthly[monthKey][t.type] += Number(t.amount);

      // Category data
      if (!categories[t.category]) {
        categories[t.category] = 0;
      }
      categories[t.category] += Number(t.amount);
    });

    const monthlyData = Object.entries(monthly).map(([month, data]) => ({
      month,
      ...data,
    }));

    const categoryData = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { monthlyData, categoryData };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Add some transactions to see analytics
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Income vs Expenses</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expense" fill="#EF4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name}: $${entry.value}`}
              >
                {categoryData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}