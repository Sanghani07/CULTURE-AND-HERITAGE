import { logger } from '../utils/logger';
import axios from 'axios';

interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'debit' | 'credit';
  merchant?: string;
}

interface SpendingAnalysis {
  totalSpent: number;
  period: string;
  categories: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactions: number;
  }>;
  trends: {
    monthOverMonth: number;
    averageDaily: number;
    topMerchants: Array<{
      merchant: string;
      amount: number;
    }>;
  };
}

interface InvestmentPortfolio {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: Array<{
    symbol: string;
    name: string;
    quantity: number;
    currentPrice: number;
    marketValue: number;
    costBasis: number;
    gainLoss: number;
    gainLossPercent: number;
  }>;
}

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  progress: number;
}

export class FinancialDataProvider {
  private apiKey: string;
  private baseUrl: string;
  private initialized = false;

  constructor() {
    this.apiKey = process.env.FI_MONEY_API_KEY || '';
    this.baseUrl = process.env.FI_MONEY_API_URL || 'https://api.fimoney.com';
  }

  async initialize(): Promise<void> {
    try {
      // Test API connection
      await this.testConnection();
      this.initialized = true;
      logger.info('Financial Data Provider initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Financial Data Provider:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      
      if (response.status !== 200) {
        throw new Error('API connection test failed');
      }
    } catch (error) {
      logger.error('API connection test failed:', error);
      throw error;
    }
  }

  private async makeApiRequest(endpoint: string, params?: any): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        params
      });
      return response.data;
    } catch (error) {
      logger.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getAccountBalances(userId: string, accountTypes?: string[]): Promise<AccountBalance[]> {
    if (!this.initialized) {
      throw new Error('Financial Data Provider not initialized');
    }

    try {
      const params: any = { userId };
      if (accountTypes && accountTypes.length > 0) {
        params.accountTypes = accountTypes.join(',');
      }

      const data = await this.makeApiRequest('/accounts/balances', params);
      
      // Mock data for demonstration if API not available
      if (!data || data.length === 0) {
        return this.getMockAccountBalances();
      }

      return data.map((account: any) => ({
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        balance: account.balance,
        currency: account.currency || 'USD',
        lastUpdated: account.lastUpdated || new Date().toISOString()
      }));
    } catch (error) {
      logger.error('Error fetching account balances:', error);
      // Return mock data for demonstration
      return this.getMockAccountBalances();
    }
  }

  async getTransactions(params: {
    userId: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    if (!this.initialized) {
      throw new Error('Financial Data Provider not initialized');
    }

    try {
      const data = await this.makeApiRequest('/transactions', params);
      
      // Mock data for demonstration if API not available
      if (!data || data.length === 0) {
        return this.getMockTransactions();
      }

      return data.map((transaction: any) => ({
        id: transaction.id,
        accountId: transaction.accountId,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        type: transaction.amount > 0 ? 'credit' : 'debit',
        merchant: transaction.merchant
      }));
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      // Return mock data for demonstration
      return this.getMockTransactions();
    }
  }

  async getSpendingAnalysis(params: {
    userId: string;
    period?: string;
    categories?: string[];
  }): Promise<SpendingAnalysis> {
    if (!this.initialized) {
      throw new Error('Financial Data Provider not initialized');
    }

    try {
      const data = await this.makeApiRequest('/analytics/spending', params);
      
      // Mock data for demonstration if API not available
      if (!data) {
        return this.getMockSpendingAnalysis();
      }

      return data;
    } catch (error) {
      logger.error('Error fetching spending analysis:', error);
      // Return mock data for demonstration
      return this.getMockSpendingAnalysis();
    }
  }

  async getInvestmentPortfolio(userId: string, includePerformance: boolean = false): Promise<InvestmentPortfolio> {
    if (!this.initialized) {
      throw new Error('Financial Data Provider not initialized');
    }

    try {
      const params = { userId, includePerformance };
      const data = await this.makeApiRequest('/investments/portfolio', params);
      
      // Mock data for demonstration if API not available
      if (!data) {
        return this.getMockInvestmentPortfolio();
      }

      return data;
    } catch (error) {
      logger.error('Error fetching investment portfolio:', error);
      // Return mock data for demonstration
      return this.getMockInvestmentPortfolio();
    }
  }

  async getFinancialGoals(userId: string): Promise<FinancialGoal[]> {
    if (!this.initialized) {
      throw new Error('Financial Data Provider not initialized');
    }

    try {
      const data = await this.makeApiRequest('/goals', { userId });
      
      // Mock data for demonstration if API not available
      if (!data || data.length === 0) {
        return this.getMockFinancialGoals();
      }

      return data;
    } catch (error) {
      logger.error('Error fetching financial goals:', error);
      // Return mock data for demonstration
      return this.getMockFinancialGoals();
    }
  }

  // Mock data methods for demonstration
  private getMockAccountBalances(): AccountBalance[] {
    return [
      {
        accountId: '1',
        accountName: 'Checking Account',
        accountType: 'checking',
        balance: 5250.00,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      },
      {
        accountId: '2',
        accountName: 'Savings Account',
        accountType: 'savings',
        balance: 15000.00,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      },
      {
        accountId: '3',
        accountName: 'Investment Account',
        accountType: 'investment',
        balance: 42500.00,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  private getMockTransactions(): Transaction[] {
    const transactions = [
      {
        id: '1',
        accountId: '1',
        amount: -85.50,
        description: 'Grocery Store Purchase',
        category: 'Food & Dining',
        date: '2024-01-15',
        type: 'debit' as const,
        merchant: 'Whole Foods'
      },
      {
        id: '2',
        accountId: '1',
        amount: -1200.00,
        description: 'Monthly Rent',
        category: 'Bills & Utilities',
        date: '2024-01-01',
        type: 'debit' as const,
        merchant: 'Property Management'
      },
      {
        id: '3',
        accountId: '1',
        amount: 3500.00,
        description: 'Salary Deposit',
        category: 'Income',
        date: '2024-01-01',
        type: 'credit' as const
      }
    ];

    return transactions;
  }

  private getMockSpendingAnalysis(): SpendingAnalysis {
    return {
      totalSpent: 2850.00,
      period: 'month',
      categories: [
        { category: 'Food & Dining', amount: 450.00, percentage: 15.8, transactions: 12 },
        { category: 'Bills & Utilities', amount: 1200.00, percentage: 42.1, transactions: 3 },
        { category: 'Transportation', amount: 320.00, percentage: 11.2, transactions: 8 },
        { category: 'Entertainment', amount: 200.00, percentage: 7.0, transactions: 5 },
        { category: 'Shopping', amount: 680.00, percentage: 23.9, transactions: 7 }
      ],
      trends: {
        monthOverMonth: -5.2,
        averageDaily: 91.93,
        topMerchants: [
          { merchant: 'Property Management', amount: 1200.00 },
          { merchant: 'Amazon', amount: 245.00 },
          { merchant: 'Whole Foods', amount: 185.50 }
        ]
      }
    };
  }

  private getMockInvestmentPortfolio(): InvestmentPortfolio {
    return {
      totalValue: 42500.00,
      totalCost: 38000.00,
      totalGainLoss: 4500.00,
      totalGainLossPercent: 11.84,
      holdings: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 50,
          currentPrice: 185.00,
          marketValue: 9250.00,
          costBasis: 8500.00,
          gainLoss: 750.00,
          gainLossPercent: 8.82
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          quantity: 25,
          currentPrice: 142.50,
          marketValue: 3562.50,
          costBasis: 3200.00,
          gainLoss: 362.50,
          gainLossPercent: 11.33
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          quantity: 75,
          currentPrice: 395.00,
          marketValue: 29625.00,
          costBasis: 26300.00,
          gainLoss: 3325.00,
          gainLossPercent: 12.64
        }
      ]
    };
  }

  private getMockFinancialGoals(): FinancialGoal[] {
    return [
      {
        id: '1',
        name: 'Emergency Fund',
        targetAmount: 20000.00,
        currentAmount: 15000.00,
        targetDate: '2024-12-31',
        category: 'Emergency',
        progress: 75.0
      },
      {
        id: '2',
        name: 'House Down Payment',
        targetAmount: 100000.00,
        currentAmount: 35000.00,
        targetDate: '2026-06-30',
        category: 'Major Purchase',
        progress: 35.0
      },
      {
        id: '3',
        name: 'Retirement Savings',
        targetAmount: 500000.00,
        currentAmount: 42500.00,
        targetDate: '2040-12-31',
        category: 'Retirement',
        progress: 8.5
      }
    ];
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}