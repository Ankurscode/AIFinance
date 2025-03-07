import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PageLayout } from '../components/PageLayout';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { AddGoalModal } from '../components/AddGoalModal';

interface Goal {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  deadline: string;
  description?: string;
  status: 'in_progress' | 'completed';
}

export function Goals() {
  const { isDarkMode } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingGoals, setDeletingGoals] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('deadline', { ascending: true });

        if (error) throw error;
        setGoals(data || []);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();

    // Subscribe to changes
    const channel = supabase
      .channel('goals_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setGoals(prev => [...prev, payload.new as Goal]);
          } else if (payload.eventType === 'DELETE') {
            setGoals(prev => prev.filter(goal => goal.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setGoals(prev => prev.map(goal => 
              goal.id === payload.new.id ? payload.new as Goal : goal
            ));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      setDeletingGoals(prev => new Set(prev).add(id));
      setGoals(prev => prev.filter(goal => goal.id !== id));

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        // Revert optimistic update if there's an error
        const { data } = await supabase
          .from('goals')
          .select('*')
          .eq('id', id)
          .single();
          
        if (data) {
          setGoals(prev => [...prev, data]);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    } finally {
      setDeletingGoals(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <PageLayout
        title="Financial Goals"
        subtitle="Track and manage your financial goals"
        actions={
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4 sm:h-5 sm:w-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Goal
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`h-8 w-8 animate-spin ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          </div>
        ) : goals.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-lg">No financial goals set yet.</p>
            <p className="mt-1">Click the "Add Goal" button to create your first goal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {goals.map((goal) => {
              const progress = calculateProgress(goal.current, goal.target);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const isDeleting = deletingGoals.has(goal.id);
              
              return (
                <div
                  key={goal.id}
                  className={`relative overflow-hidden rounded-xl border p-4 transition-opacity duration-200 ${
                    isDeleting ? 'opacity-50' : 'opacity-100'
                  } ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goal.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {goal.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      disabled={isDeleting}
                      className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 
                        disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200`}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-900'}>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        ${goal.current.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        ${goal.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Days Left</span>
                      <span className={`text-sm font-medium ${
                        daysRemaining < 0
                          ? 'text-red-600 dark:text-red-400'
                          : daysRemaining < 30
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : isDarkMode
                          ? 'text-gray-300'
                          : 'text-gray-900'
                      }`}>
                        {daysRemaining < 0
                          ? 'Overdue'
                          : daysRemaining === 0
                          ? 'Due today'
                          : `${daysRemaining} days`}
                      </span>
                    </div>
                  </div>

                  {goal.description && (
                    <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {goal.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PageLayout>

      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
} 