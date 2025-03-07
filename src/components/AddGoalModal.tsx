import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Emergency Fund',
  'Retirement',
  'House Down Payment',
  'Car',
  'Education',
  'Travel',
  'Wedding',
  'Business',
  'Debt Repayment',
  'Investment',
  'Other'
];

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    target: '',
    current: '0',
    deadline: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            category: formData.category,
            target: Number(formData.target),
            current: Number(formData.current),
            deadline: formData.deadline,
            description: formData.description,
            status: 'in_progress'
          }
        ]);

      if (error) throw error;

      onClose();
      setFormData({
        title: '',
        category: '',
        target: '',
        current: '0',
        deadline: '',
        description: ''
      });
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-xl shadow-lg z-50 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Add Financial Goal
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-emerald-500'
              }`}
              placeholder="Enter goal title"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-emerald-500'
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Target Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                required
                className={`w-full rounded-lg border pl-7 pr-3 py-2 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-emerald-500'
                }`}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Current Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                required
                className={`w-full rounded-lg border pl-7 pr-3 py-2 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-emerald-500'
                }`}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Target Date
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-emerald-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-emerald-500'
              }`}
              placeholder="Add a description (optional)"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Goal'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
} 