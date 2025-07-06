/**
 * Fi Money MCP Server Integration
 * 
 * This is the core integration layer that implements the Model Context Protocol (MCP)
 * to connect AI models with structured financial data from Fi Money's infrastructure.
 * 
 * Key Responsibilities:
 * - Register MCP tools for financial data access (accounts, transactions, investments, etc.)
 * - Coordinate between AI services and financial data providers
 * - Process natural language queries and route them to appropriate data sources
 * - Aggregate financial context for AI model consumption
 * 
 * MCP Flow:
 * User Query -> AI Analysis -> Data Requirements -> MCP Tools -> Financial APIs -> AI Response
 */

import { MCPServer } from '@modelcontextprotocol/server';
import { logger } from '../utils/logger';
import { FinancialDataProvider } from './financialDataProvider';
import { AIService } from './aiService';

/**
 * FiMoneyMCPServer Class
 * 
 * Main orchestrator for MCP-based financial data access and AI integration.
 * Implements the bridge between Fi Money's financial APIs and AI models.
 */
export class FiMoneyMCPServer {
  private server: MCPServer;                          // MCP protocol server instance
  private financialDataProvider: FinancialDataProvider; // Handles Fi Money API integration
  private aiService: AIService;                       // Manages AI model interactions
  private initialized = false;                        // Initialization state flag

  /**
   * Constructor - Initialize MCP Server Components
   * 
   * Sets up the MCP server instance and related services but doesn't start connections.
   * Actual initialization happens in the initialize() method.
   */
  constructor() {
    // Create MCP server instance with metadata
    this.server = new MCPServer({
      name: 'fi-money-assistant',           // Server identifier
      version: '1.0.0',                    // Version for compatibility tracking
      description: 'AI-powered personal finance assistant with Fi Money integration'
    });
    
    // Initialize service dependencies (but don't connect yet)
    this.financialDataProvider = new FinancialDataProvider(); // Fi Money API client
    this.aiService = new AIService();                         // OpenAI/Gemini integration
  }

  /**
   * Initialize MCP Server and All Dependencies
   * 
   * This method orchestrates the complete initialization process:
   * 1. Connect to Fi Money APIs
   * 2. Initialize AI services
   * 3. Register MCP tools for financial data access
   * 4. Start the MCP server
   * 
   * @throws {Error} If any initialization step fails
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🔧 Initializing Fi Money MCP Server...');

      // Step 1: Initialize financial data provider (connect to Fi Money APIs)
      logger.info('📊 Connecting to Fi Money financial data APIs...');
      await this.financialDataProvider.initialize();
      
      // Step 2: Initialize AI service (connect to OpenAI/Gemini)
      logger.info('🤖 Initializing AI services...');
      await this.aiService.initialize();
      
      // Step 3: Register MCP tools for financial data access
      logger.info('🔧 Registering MCP financial data tools...');
      this.registerTools();
      
      // Step 4: Start the MCP server
      logger.info('🚀 Starting MCP server...');
      await this.server.start();
      
      // Mark as initialized
      this.initialized = true;
      logger.info('✅ MCP Server initialized successfully');
      logger.info('🎯 Ready to process AI-powered financial queries');
    } catch (error) {
      logger.error('❌ Failed to initialize MCP Server:', error);
      throw error;
    }
  }

  /**
   * Register MCP Tools for Financial Data Access
   * 
   * This method registers all available MCP tools that AI models can use to access
   * structured financial data. Each tool has a specific purpose and defined input/output schema.
   * 
   * MCP Tools Architecture:
   * - Each tool represents a specific financial data query capability
   * - Tools have JSON schemas for input validation
   * - AI models can discover and use these tools dynamically
   * - All tools route through the Financial Data Provider
   */
  private registerTools(): void {
    logger.info('📋 Registering MCP tools for financial data access...');

    /**
     * TOOL: get_account_balance
     * 
     * Purpose: Retrieve account balances across all connected financial accounts
     * Use Cases: "What's my account balance?", "Show me my savings account balance"
     * Data Source: Fi Money account aggregation APIs
     */
    this.server.addTool({
      name: 'get_account_balance',
      description: 'Get current account balances across all connected accounts including checking, savings, investment accounts',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { 
            type: 'string',
            description: 'Unique identifier for the user requesting account data'
          },
          accountTypes: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Optional filter by account types (checking, savings, investment, credit, etc.)'
          }
        },
        required: ['userId'] // userId is mandatory for security and data isolation
      },
      handler: async (params: any) => {
        logger.info(`🏦 Fetching account balances for user: ${params.userId}`);
        return await this.financialDataProvider.getAccountBalances(params.userId, params.accountTypes);
      }
    });

    /**
     * TOOL: get_transactions
     * 
     * Purpose: Retrieve detailed transaction history with flexible filtering options
     * Use Cases: "Show me transactions from last month", "What did I spend on groceries?"
     * Data Source: Fi Money transaction aggregation APIs
     */
    this.server.addTool({
      name: 'get_transactions',
      description: 'Get detailed transaction history with optional date, category, and limit filters',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { 
            type: 'string',
            description: 'Unique identifier for the user requesting transaction data'
          },
          startDate: { 
            type: 'string',
            description: 'Start date for transaction filter (YYYY-MM-DD format)'
          },
          endDate: { 
            type: 'string',
            description: 'End date for transaction filter (YYYY-MM-DD format)'
          },
          category: { 
            type: 'string',
            description: 'Filter by transaction category (e.g., Food & Dining, Transportation)'
          },
          limit: { 
            type: 'number',
            description: 'Maximum number of transactions to return (default: 50)'
          }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        logger.info(`💳 Fetching transactions for user: ${params.userId}, filters: ${JSON.stringify(params)}`);
        return await this.financialDataProvider.getTransactions(params);
      }
    });

    /**
     * TOOL: get_spending_analysis
     * 
     * Purpose: Generate intelligent spending analysis with categorization and trends
     * Use Cases: "How much did I spend this month?", "What are my spending patterns?"
     * Data Source: Fi Money analytics APIs with AI-powered categorization
     */
    this.server.addTool({
      name: 'get_spending_analysis',
      description: 'Get detailed spending analysis including category breakdown, trends, and merchant analysis',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { 
            type: 'string',
            description: 'Unique identifier for the user requesting spending analysis'
          },
          period: { 
            type: 'string', 
            enum: ['month', 'quarter', 'year'],
            description: 'Time period for analysis (month, quarter, or year)'
          },
          categories: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Specific categories to analyze (optional filter)'
          }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        logger.info(`📊 Generating spending analysis for user: ${params.userId}, period: ${params.period}`);
        return await this.financialDataProvider.getSpendingAnalysis(params);
      }
    });

    /**
     * TOOL: get_investment_portfolio
     * 
     * Purpose: Retrieve investment portfolio data including holdings and performance metrics
     * Use Cases: "How is my portfolio performing?", "Show me my investment allocation"
     * Data Source: Fi Money investment aggregation APIs
     */
    this.server.addTool({
      name: 'get_investment_portfolio',
      description: 'Get investment portfolio data including holdings, performance, gains/losses, and allocation',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { 
            type: 'string',
            description: 'Unique identifier for the user requesting investment data'
          },
          includePerformance: { 
            type: 'boolean',
            description: 'Whether to include detailed performance metrics and historical data'
          }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        logger.info(`📈 Fetching investment portfolio for user: ${params.userId}, include performance: ${params.includePerformance}`);
        return await this.financialDataProvider.getInvestmentPortfolio(params.userId, params.includePerformance);
      }
    });

    /**
     * TOOL: get_financial_goals
     * 
     * Purpose: Retrieve user's financial goals and track progress towards targets
     * Use Cases: "Am I on track for my savings goal?", "Show me my financial goals"
     * Data Source: Fi Money goals tracking APIs
     */
    this.server.addTool({
      name: 'get_financial_goals',
      description: 'Get user financial goals including targets, current progress, and achievement timelines',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { 
            type: 'string',
            description: 'Unique identifier for the user requesting goals data'
          }
        },
        required: ['userId']
      },
      handler: async (params: any) => {
        logger.info(`🎯 Fetching financial goals for user: ${params.userId}`);
        return await this.financialDataProvider.getFinancialGoals(params.userId);
      }
    });

    logger.info('✅ All MCP financial data tools registered successfully');
    logger.info('🔧 Available tools: account_balance, transactions, spending_analysis, investments, goals');
  }

  /**
   * Process Natural Language Financial Query
   * 
   * This is the main entry point for AI-powered financial queries. It orchestrates
   * the complete flow from natural language understanding to structured data retrieval
   * and intelligent response generation.
   * 
   * Process Flow:
   * 1. Analyze user query to understand intent and data requirements
   * 2. Gather relevant financial data using MCP tools
   * 3. Generate AI-powered response with insights and recommendations
   * 
   * @param userId - Unique identifier for the user making the query
   * @param query - Natural language financial question or request
   * @returns AI-generated response with financial insights and recommendations
   * 
   * @example
   * processFinancialQuery("user123", "What's my spending this month?")
   * // Returns: Analysis of monthly spending with categories, trends, and recommendations
   */
  async processFinancialQuery(userId: string, query: string): Promise<any> {
    // Ensure MCP server is properly initialized before processing
    if (!this.initialized) {
      throw new Error('MCP Server not initialized - call initialize() first');
    }

    try {
      logger.info(`🔍 Processing financial query for user ${userId}: "${query}"`);

      // Step 1: AI Query Analysis
      // Use AI to understand what the user is asking and what data we need to fetch
      logger.info('🤖 Analyzing query intent and data requirements...');
      const queryAnalysis = await this.aiService.analyzeQuery(query);
      logger.info(`📋 Query analysis complete. Required data: ${JSON.stringify(queryAnalysis)}`);
      
      // Step 2: Financial Data Gathering
      // Fetch only the specific financial data needed for this query
      logger.info('📊 Gathering relevant financial data...');
      const financialData = await this.gatherFinancialData(userId, queryAnalysis);
      logger.info(`✅ Financial data retrieved successfully`);
      
      // Step 3: AI Response Generation
      // Generate intelligent response with insights and recommendations
      logger.info('🧠 Generating AI-powered response with insights...');
      const response = await this.aiService.generateResponse(query, financialData);
      logger.info(`✅ Financial query processed successfully`);
      
      return response;
    } catch (error) {
      logger.error(`❌ Error processing financial query for user ${userId}:`, error);
      logger.error(`💬 Failed query: "${query}"`);
      throw error;
    }
  }

  /**
   * Gather Specific Financial Data Based on Query Analysis
   * 
   * This method intelligently fetches only the financial data needed to answer
   * the user's specific query, avoiding unnecessary API calls and improving performance.
   * 
   * Data Collection Strategy:
   * - Only fetch data types identified by AI query analysis
   * - Use query-specific parameters (date ranges, limits, etc.)
   * - Parallel data fetching where possible for performance
   * 
   * @param userId - User identifier for data access control
   * @param analysis - AI analysis results indicating required data types
   * @returns Aggregated financial data object with only relevant information
   * 
   * @private
   */
  private async gatherFinancialData(userId: string, analysis: any): Promise<any> {
    const data: any = {};
    const dataFetchPromises: Promise<void>[] = [];

    logger.info(`📊 Gathering financial data based on analysis requirements...`);

    // ACCOUNT BALANCES - Current balances across all accounts
    if (analysis.needsAccountBalance) {
      logger.info('💰 Fetching account balances...');
      dataFetchPromises.push(
        this.financialDataProvider.getAccountBalances(userId).then(result => {
          data.accountBalances = result;
        })
      );
    }

    // TRANSACTION HISTORY - Detailed transaction records with filters
    if (analysis.needsTransactions) {
      logger.info('💳 Fetching transaction history...');
      dataFetchPromises.push(
        this.financialDataProvider.getTransactions({
          userId,
          startDate: analysis.timeRange?.start,
          endDate: analysis.timeRange?.end,
          limit: analysis.transactionLimit || 50
        }).then(result => {
          data.transactions = result;
        })
      );
    }

    // SPENDING ANALYSIS - Categorized spending patterns and trends
    if (analysis.needsSpendingAnalysis) {
      logger.info('📈 Fetching spending analysis...');
      dataFetchPromises.push(
        this.financialDataProvider.getSpendingAnalysis({
          userId,
          period: analysis.analysisPeriod || 'month'
        }).then(result => {
          data.spendingAnalysis = result;
        })
      );
    }

    // INVESTMENT PORTFOLIO - Holdings, performance, and allocation
    if (analysis.needsInvestments) {
      logger.info('📊 Fetching investment portfolio...');
      dataFetchPromises.push(
        this.financialDataProvider.getInvestmentPortfolio(userId, true).then(result => {
          data.investments = result;
        })
      );
    }

    // FINANCIAL GOALS - Progress tracking and targets
    if (analysis.needsGoals) {
      logger.info('🎯 Fetching financial goals...');
      dataFetchPromises.push(
        this.financialDataProvider.getFinancialGoals(userId).then(result => {
          data.goals = result;
        })
      );
    }

    // Execute all data fetching operations in parallel for better performance
    await Promise.all(dataFetchPromises);

    logger.info(`✅ Financial data gathering complete. Retrieved: ${Object.keys(data).join(', ')}`);
    return data;
  }

  /**
   * Check MCP Server Initialization Status
   * 
   * @returns true if the MCP server has been successfully initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Gracefully Shutdown MCP Server
   * 
   * Properly closes all connections and cleans up resources.
   * Should be called during application shutdown to prevent resource leaks.
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('🔄 Shutting down MCP Server...');
      
      if (this.server) {
        await this.server.stop();
        logger.info('✅ MCP Server stopped');
      }
      
      // Reset initialization state
      this.initialized = false;
      
      logger.info('🛑 MCP Server shutdown completed');
    } catch (error) {
      logger.error('❌ Error during MCP Server shutdown:', error);
      throw error;
    }
  }
}

/**
 * SINGLETON MCP SERVER INSTANCE
 * 
 * Export a single instance of the MCP server to be used throughout the application.
 * This ensures consistent state and avoids multiple server instances.
 */
export const mcpServer = new FiMoneyMCPServer();