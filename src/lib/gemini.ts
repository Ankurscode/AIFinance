import { GoogleGenerativeAI } from '@google/generative-ai';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description?: string;
}

interface FinancialAnalysis {
  spendingPatterns: string;
  savingsOpportunities: string;
  recommendations: string;
  riskFactors: string;
  monthlySummary: string;
  immediateInsights: string;
  categoryAnalysis: string;
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

// Initialize the Gemini API client with beta endpoint
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Use the flash model for faster responses
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  }
});

// Add safety limits for free tier
const MAX_TOKENS = 30720; // Free tier token limit
const MAX_INPUT_TOKENS = 15000; // Conservative limit for input to leave room for response

export async function analyzeFinances(transactions: Transaction[], goals: Goal[], userQuestion?: string): Promise<string | FinancialAnalysis> {
  try {
    if (!transactions || transactions.length === 0) {
      return "I don't see any transactions to analyze yet. Please add some transactions first!";
    }

    // Calculate key financial metrics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    // Group transactions by category
    const categoryTotals = transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[t.category].income += t.amount;
      } else {
        acc[t.category].expenses += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    // Group transactions by month for better analysis
    const monthlyTransactions = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    const transactionsSummary = Object.entries(monthlyTransactions)
      .map(([month, txs]) => {
        const total = txs.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
        return `${month}:\n${txs.map(t => 
          `  ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)} - ${t.category}${t.description ? ` (${t.description})` : ''}`
        ).join('\n')}\n  Monthly Total: ${total >= 0 ? '+' : ''}$${total.toFixed(2)}\n`;
      })
      .join('\n');

    const categorySummary = Object.entries(categoryTotals)
      .map(([category, { income, expenses }]) => 
        `${category}:\n  Income: +$${income.toFixed(2)}\n  Expenses: -$${expenses.toFixed(2)}\n  Net: ${income - expenses >= 0 ? '+' : ''}$${(income - expenses).toFixed(2)}`
      )
      .join('\n\n');

    // Trim the prompt if it's too long for free tier
    let prompt = `As an AI financial assistant, analyze the following financial data:\n\n`;
    prompt += `Total Income: ${totalIncome}\n`;
    prompt += `Total Expenses: ${totalExpenses}\n`;
    prompt += `Net Income: ${netIncome}\n\n`;
    
    // Add transaction summaries but limit the amount of data
    const recentTransactions = transactions.slice(-50); // Only use last 50 transactions for analysis
    prompt += `Recent Transactions Summary:\n`;
    recentTransactions.forEach(t => {
      prompt += `- ${t.date}: ${t.description} (${t.type}): ${t.amount}\n`;
    });

    if (goals && goals.length > 0) {
      prompt += `\nFinancial Goals:\n`;
      goals.forEach(g => {
        prompt += `- ${g.title}: Target: ${g.target}, Current: ${g.current}\n`;
      });
    }

    if (userQuestion) {
      prompt += `\nUser Question: ${userQuestion}\n`;
      prompt += `Please provide a direct answer to the user's question based on the financial data above.`;
    } else {
      prompt += `\nPlease provide a comprehensive analysis including:\n`;
      prompt += `1. Immediate Insights\n2. Spending Patterns\n3. Category Analysis\n4. Savings Opportunities\n5. Recommendations\n6. Risk Factors\n7. Monthly Summary`;
    }

    // Estimate token count (rough estimate: 4 chars ≈ 1 token)
    const estimatedTokens = Math.ceil(prompt.length / 4);
    if (estimatedTokens > MAX_INPUT_TOKENS) {
      return "I apologize, but there's too much financial data to analyze at once. Try analyzing a smaller time period or asking a more specific question.";
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // If it's a direct question, return the response as is
    if (userQuestion) {
      return text;
    }

    // Parse the analysis into structured data
    const sections = text.split(/\d+\.\s+/).slice(1).reduce((acc, section, index) => {
      if (!section.trim()) return acc;
      
      const sectionKeys = [
        'immediateInsights',
        'spendingPatterns',
        'categoryAnalysis',
        'savingsOpportunities',
        'recommendations',
        'riskFactors',
        'monthlySummary'
      ];
      
      const key = sectionKeys[index] as keyof FinancialAnalysis;
      if (key) {
        acc[key] = section.trim();
      }
      
      return acc;
    }, {} as Partial<FinancialAnalysis>);

    return {
      immediateInsights: sections.immediateInsights || 'No immediate insights available.',
      spendingPatterns: sections.spendingPatterns || 'No spending patterns analyzed.',
      categoryAnalysis: sections.categoryAnalysis || 'No category analysis available.',
      savingsOpportunities: sections.savingsOpportunities || 'No savings opportunities identified.',
      recommendations: sections.recommendations || 'No specific recommendations available.',
      riskFactors: sections.riskFactors || 'No risk factors identified.',
      monthlySummary: sections.monthlySummary || 'No monthly summary available.'
    };
  } catch (error) {
    console.error('Error analyzing finances:', error);
    
    // Check if the error is related to API key or model access
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    if (errorMessage.includes('API key') || errorMessage.includes('not found')) {
      return "I'm having trouble accessing my AI capabilities right now. Please check if the API key is configured correctly.";
    }

    return "I apologize, but I encountered an error while analyzing your finances. Please try again in a moment.";
  }
}