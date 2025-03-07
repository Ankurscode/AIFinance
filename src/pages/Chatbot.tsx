import { useState, useRef, useEffect } from 'react';
import { PageLayout } from '../components/PageLayout';
import { GlassCard } from '../components/GlassCard';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFinanceStore } from '../lib/supabase-realtime';
import { analyzeFinances } from '../lib/gemini';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();
  const { transactions } = useFinanceStore();

  // Fetch goals when component mounts
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
      }
    };

    fetchGoals();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (response: any): string => {
    if (typeof response === 'string') {
      return response;
    }

    // If it's a financial analysis object, format it nicely
    if (typeof response === 'object') {
      const sections = [
        { title: 'Immediate Insights', content: response.immediateInsights },
        { title: 'Spending Patterns', content: response.spendingPatterns },
        { title: 'Category Analysis', content: response.categoryAnalysis },
        { title: 'Savings Opportunities', content: response.savingsOpportunities },
        { title: 'Recommendations', content: response.recommendations },
        { title: 'Risk Factors', content: response.riskFactors },
        { title: 'Monthly Summary', content: response.monthlySummary }
      ];

      return sections
        .filter(section => section.content && section.content !== `No ${section.title.toLowerCase()} available.`)
        .map(section => `${section.title}:\n${section.content}`)
        .join('\n\n');
    }

    return 'I apologize, but I encountered an error while processing your request. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await analyzeFinances(transactions, goals, userMessage);
      const formattedResponse = formatResponse(response);
      setMessages(prev => [...prev, { role: 'assistant', content: formattedResponse }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <PageLayout
      title="AI Financial Assistant"
      subtitle="Get insights and answers about your finances"
    >
      <div className="max-w-4xl mx-auto">
        <GlassCard
          icon={<MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />}
          title="Chat with your AI Assistant"
          subtitle="Ask questions about your financial data"
          iconColor="purple"
        >
          <div className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className="text-sm">No messages yet. Start by asking a question about your finances!</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs">Example questions:</p>
                    <ul className="text-xs space-y-1">
                      <li>"What's my total income this month?"</li>
                      <li>"Show me my spending breakdown by category"</li>
                      <li>"How can I improve my savings?"</li>
                      <li>"What are my largest expenses?"</li>
                      <li>"Analyze my financial health"</li>
                      <li>"Give me savings recommendations"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? isDarkMode
                            ? 'bg-emerald-500/20 text-emerald-200 backdrop-blur-lg'
                            : 'bg-emerald-500/10 text-emerald-800 backdrop-blur-lg'
                          : isDarkMode
                            ? 'bg-gray-700/40 text-gray-200 backdrop-blur-lg'
                            : 'bg-gray-200/40 text-gray-800 backdrop-blur-lg'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-4 py-2 ${
                    isDarkMode
                      ? 'bg-gray-700/40 text-gray-200'
                      : 'bg-gray-200/40 text-gray-800'
                  }`}>
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about your finances..."
                className={`flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700/40 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-xl'
                    : 'bg-white/40 border-gray-200/50 text-gray-900 placeholder-gray-500 backdrop-blur-xl'
                }`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isDarkMode
                    ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50 backdrop-blur-xl'
                    : 'bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 disabled:opacity-50 backdrop-blur-xl'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </GlassCard>
      </div>
    </PageLayout>
  );
} 