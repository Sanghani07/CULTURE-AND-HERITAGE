import { MCPServer } from '@modelcontextprotocol/server';
import { logger } from '../utils/logger';
import { FinancialDataProvider } from './financialDataProvider';
import { AIService } from './aiService';

export class FiMoneyMCPServer {
  private server: MCPServer;
  private financialDataProvider: FinancialDataProvider;
  private aiService: AIService;
  private initialized = false;

  constructor() {
    this.server = new MCPServer({
      name: 'fi-money-assistant',
      version: '1.0.0',
      description: 'AI-powered personal finance assistant'
    });
    
    this.financialDataProvider = new FinancialDataProvider();
    this.aiService = new AIService();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize financial data provider
      await this.financialDataProvider.initialize();
      
      // Initialize AI service
      await this.aiService.initialize();
      
      // Register MCP tools
      this.registerTools();
      
      // Start MCP server
      await this.server.start();
      
      this.initialized = true;
      logger.info('MCP Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize MCP Server:', error);
      throw error;
    }
  }

  private registerTools(): void {
    // Register financial data retrieval tools
    this.server.addTool({
      name: 'get_account_balance',
      description: 'Get current account balances across all connected accounts',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          accountTypes: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Optional filter by account types (checking, savings, investment, etc.)'
          }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        return await this.financialDataProvider.getAccountBalances(params.userId, params.accountTypes);
      }
    });

    this.server.addTool({
      name: 'get_transactions',
      description: 'Get transaction history with optional filters',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          category: { type: 'string' },
          limit: { type: 'number' }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        return await this.financialDataProvider.getTransactions(params);
      }
    });

    this.server.addTool({
      name: 'get_spending_analysis',
      description: 'Get detailed spending analysis and patterns',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          period: { type: 'string', enum: ['month', 'quarter', 'year'] },
          categories: { type: 'array', items: { type: 'string' } }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        return await this.financialDataProvider.getSpendingAnalysis(params);
      }
    });

    this.server.addTool({
      name: 'get_investment_portfolio',
      description: 'Get investment portfolio data and performance',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          includePerformance: { type: 'boolean' }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        return await this.financialDataProvider.getInvestmentPortfolio(params.userId, params.includePerformance);
      }
    });

    this.server.addTool({
      name: 'get_financial_goals',
      description: 'Get user financial goals and progress',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        return await this.financialDataProvider.getFinancialGoals(params.userId);
      }
    });

    logger.info('MCP tools registered successfully');
  }

  async processFinancialQuery(userId: string, query: string): Promise<any> {
    if (!this.initialized) {
      throw new Error('MCP Server not initialized');
    }

    try {
      // Use AI service to understand the query and determine what data is needed
      const queryAnalysis = await this.aiService.analyzeQuery(query);
      
      // Fetch relevant financial data based on query analysis
      const financialData = await this.gatherFinancialData(userId, queryAnalysis);
      
      // Generate AI response with financial context
      const response = await this.aiService.generateResponse(query, financialData);
      
      return response;
    } catch (error) {
      logger.error('Error processing financial query:', error);
      throw error;
    }
  }

  private async gatherFinancialData(userId: string, analysis: any): Promise<any> {
    const data: any = {};

    // Gather data based on query analysis
    if (analysis.needsAccountBalance) {
      data.accountBalances = await this.financialDataProvider.getAccountBalances(userId);
    }

    if (analysis.needsTransactions) {
      data.transactions = await this.financialDataProvider.getTransactions({
        userId,
        startDate: analysis.timeRange?.start,
        endDate: analysis.timeRange?.end,
        limit: analysis.transactionLimit || 50
      });
    }

    if (analysis.needsSpendingAnalysis) {
      data.spendingAnalysis = await this.financialDataProvider.getSpendingAnalysis({
        userId,
        period: analysis.analysisPeriod || 'month'
      });
    }

    if (analysis.needsInvestments) {
      data.investments = await this.financialDataProvider.getInvestmentPortfolio(userId, true);
    }

    if (analysis.needsGoals) {
      data.goals = await this.financialDataProvider.getFinancialGoals(userId);
    }

    return data;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async shutdown(): Promise<void> {
    if (this.server) {
      await this.server.stop();
    }
    logger.info('MCP Server shut down');
  }
}

export const mcpServer = new FiMoneyMCPServer();