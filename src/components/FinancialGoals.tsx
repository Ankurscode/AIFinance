import { useState, useEffect } from 'react';
import { useFinanceStore } from '../lib/supabase-realtime';
import { Target, TrendingUp, PiggyBank, Calendar } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  type: 'savings' | 'investment' | 'debt';
}

export function FinancialGoals() {
  const transactions = useFinanceStore((state) => state.transactions);
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 5000,
      deadline: '2024-12-31',
      category: 'Savings',
      type: 'savings'
    },
    {
      id: '2',
      name: 'Investment Portfolio',
      targetAmount: 50000,
      currentAmount: 25000,
      deadline: '2025-12-31',
      category: 'Investment',
      type: 'investment'
    }
  ]);

  // Calculate progress for each goal based on transactions
  useEffect(() => {
    const updatedGoals = goals.map(goal => {
      const relevantTransactions = transactions.filter(t => {
        const isRelevantCategory = t.category.toLowerCase() === goal.category.toLowerCase();
        const isBeforeDeadline = new Date(t.date) <= new Date(goal.deadline);
        return isRelevantCategory && isBeforeDeadline;
      });

      const totalContribution = relevantTransactions.reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        return sum - t.amount;
      }, 0);

      return {
        ...goal,
        currentAmount: Math.max(0, goal.currentAmount + totalContribution)
      };
    });

    setGoals(updatedGoals);
  }, [transactions]);

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getGoalIcon = (type: Goal['type']) => {
    switch (type) {
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5" />;
      case 'debt':
        return <Target className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Target className="h-6 w-6 text-emerald-500" />
        <h2 className="text-xl font-semibold">Financial Goals</h2>
      </div>

      <div className="space-y-6">
        {goals.map(goal => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);
          const isOnTrack = progress >= (daysUntilDeadline / 365) * 100;

          return (
            <div key={goal.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getGoalIcon(goal.type)}
                  <h3 className="font-medium">{goal.name}</h3>
                </div>
                <span className={`text-sm ${isOnTrack ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isOnTrack ? 'On Track' : 'Behind Schedule'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress: ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  <span>{daysUntilDeadline} days remaining</span>
                </div>
              </div>
            </div>
          );
        })}

        <button
          className="w-full bg-emerald-500 text-white rounded-lg px-4 py-2 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          onClick={() => {
            // TODO: Implement add goal functionality
            console.log('Add new goal');
          }}
        >
          Add New Goal
        </button>
      </div>
    </div>
  );
} 