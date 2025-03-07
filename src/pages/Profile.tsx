import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { PageLayout } from '../components/PageLayout';
import { Button } from '../components/Button';
import { User, Mail, Key, LogOut, Edit2, Loader2, Check, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const [user, setUser] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setUser(user);
        setNewName(user?.user_metadata?.full_name || '');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/signin');
      } else if (event === 'USER_UPDATED') {
        fetchUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser, navigate]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Navigation will be handled by the auth state change listener
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false); // Only reset if error, otherwise state will be cleaned up on unmount
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;

    try {
      setIsUpdating(true);
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() }
      });

      if (error) throw error;
      setUser(updatedUser);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdateName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setNewName(user?.user_metadata?.full_name || '');
    }
  };

  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your account settings"
      actions={
        <Button
          variant="secondary"
          icon={isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          Sign Out
        </Button>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        <GlassCard
          icon={<User className="h-5 w-5 sm:h-6 sm:w-6" />}
          title="Account Information"
          subtitle="Your basic account details"
          iconColor="blue"
        >
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <div>
              <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Name
              </label>
              <div className="mt-1">
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm sm:text-base focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-emerald-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-emerald-500'
                      }`}
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={isUpdating || !newName.trim()}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'hover:bg-gray-700 text-emerald-400 hover:text-emerald-300'
                          : 'hover:bg-gray-100 text-emerald-600 hover:text-emerald-700'
                      } ${(!newName.trim() || isUpdating) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(user?.user_metadata?.full_name || '');
                      }}
                      disabled={isUpdating}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'hover:bg-gray-700 text-red-400 hover:text-red-300'
                          : 'hover:bg-gray-100 text-red-600 hover:text-red-700'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {user?.user_metadata?.full_name || 'Add your name'}
                    </span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                        isDarkMode
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <Mail className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {user?.email}
                </span>
              </div>
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Account Created
              </label>
              <div className="mt-1">
                <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {new Date(user?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard
          icon={<Key className="h-5 w-5 sm:h-6 sm:w-6" />}
          title="Security"
          subtitle="Manage your security settings"
          iconColor="red"
        >
          <div className="mt-4 sm:mt-6">
            <Button variant="secondary" className="text-sm sm:text-base py-1.5 sm:py-2">
              Change Password
            </Button>
          </div>
        </GlassCard>
      </div>
    </PageLayout>
  );
} 