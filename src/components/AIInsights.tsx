import { useEffect, useState } from 'react';
import { analyzeFinances } from '../lib/gemini';
import { useFinanceStore } from '../lib/supabase-realtime';
import { Brain, TrendingUp, PiggyBank, Lightbulb, AlertTriangle, Calendar, Zap, PieChart } from 'lucide-react';

interface FinancialAnalysis {
  immediateInsights: string;
  spendingPatterns: string;
  categoryAnalysis: string;
  savingsOpportunities: string;
  recommendations: string;
  riskFactors: string;
  monthlySummary: string;
}

export function AIInsights() {
  const transactions = useFinanceStore((state) => state.transactions);
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getInsights() {
      if (transactions.length > 0) {
        setLoading(true);
        const insights = await analyzeFinances(transactions);
        setAnalysis(insights);
        setLoading(false);
      }
    }

    getInsights();
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-6 w-6 text-emerald-500" />
          <h2 className="text-xl font-semibold">AI Financial Insights</h2>
        </div>
        <p className="text-gray-500">Add some transactions to get AI-powered insights.</p>
      </div>
    );
  }

  const InsightSection = ({ icon: Icon, title, content }: { icon: any; title: string; content: string }) => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="h-5 w-5 text-emerald-500" />
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="prose prose-emerald max-w-none">
        <div className="whitespace-pre-wrap text-gray-600">{content}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="h-6 w-6 text-emerald-500" />
        <h2 className="text-xl font-semibold">AI Financial Insights</h2>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          <InsightSection
            icon={Zap}
            title="Immediate Financial Insights"
            content={analysis.immediateInsights}
          />
          <InsightSection
            icon={TrendingUp}
            title="Spending Patterns & Trends"
            content={analysis.spendingPatterns}
          />
          <InsightSection
            icon={PieChart}
            title="Category Analysis"
            content={analysis.categoryAnalysis}
          />
          <InsightSection
            icon={PiggyBank}
            title="Savings Opportunities"
            content={analysis.savingsOpportunities}
          />
          <InsightSection
            icon={Lightbulb}
            title="Financial Recommendations"
            content={analysis.recommendations}
          />
          <InsightSection
            icon={AlertTriangle}
            title="Risk Factors & Concerns"
            content={analysis.riskFactors}
          />
          <InsightSection
            icon={Calendar}
            title="Monthly Summary"
            content={analysis.monthlySummary}
          />
        </div>
      ) : (
        <p className="text-gray-500">Unable to generate insights at this time.</p>
      )}
    </div>
  );
}