import { supabase } from './supabase';
import { create } from 'zustand';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
}

interface FinanceStore {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  setTransactions: (transactions: Transaction[]) => void;
  subscribeToTransactions: (userId: string) => void;
  unsubscribeFromTransactions: () => void;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: [],
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [...state.transactions, transaction] })),
  setTransactions: (transactions) => set({ transactions }),
  subscribeToTransactions: (userId) => {
    // Initial fetch
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) {
          set({ transactions: data as Transaction[] });
        }
      });

    // Real-time subscription
    const subscription = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const { data, eventType } = payload;
          
          if (eventType === 'INSERT') {
            set((state) => ({
              transactions: [data as Transaction, ...state.transactions],
            }));
          } else if (eventType === 'DELETE') {
            set((state) => ({
              transactions: state.transactions.filter((t) => t.id !== data.id),
            }));
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              transactions: state.transactions.map((t) =>
                t.id === data.id ? (data as Transaction) : t
              ),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
  unsubscribeFromTransactions: () => {
    supabase.removeAllChannels();
  },
}));