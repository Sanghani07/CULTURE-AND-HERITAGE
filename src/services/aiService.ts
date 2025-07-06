/**
 * AI Service for Financial Intelligence
 * 
 * This service provides AI-powered financial analysis capabilities using OpenAI's GPT models.
 * It handles natural language understanding, query analysis, and intelligent response generation
 * for financial data and insights.
 * 
 * Core Capabilities:
 * - Natural language query analysis to determine data requirements
 * - Financial context understanding and reasoning
 * - Intelligent insight generation based on financial patterns
 * - Personalized recommendation engine
 * - Multi-modal AI support (can be extended for other AI providers)
 * 
 * Integration Points:
 * - OpenAI GPT-4 for advanced reasoning
 * - Financial domain expertise through prompt engineering
 * - Structured output formatting for consistent responses
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';

/**
 * Query Analysis Interface
 * 
 * Defines the structure for AI analysis of user queries to determine
 * what financial data needs to be retrieved.
 */
interface QueryAnalysis {
  needsAccountBalance: boolean;    // Requires account balance data
  needsTransactions: boolean;      // Requires transaction history
  needsSpendingAnalysis: boolean;  // Requires spending analysis
  needsInvestments: boolean;       // Requires investment portfolio data
  needsGoals: boolean;            // Requires financial goals data
  timeRange?: {                   // Optional date range filter
    start: string;                // Start date (YYYY-MM-DD)
    end: string;                  // End date (YYYY-MM-DD)
  };
  analysisPeriod?: string;        // Analysis period (month/quarter/year)
  transactionLimit?: number;      // Maximum transactions to retrieve
}

/**
 * AI Response Interface
 * 
 * Standardized structure for AI-generated responses to financial queries.
 */
interface AIResponse {
  answer: string;                 // Direct answer to user's question
  insights: string[];             // Key financial insights discovered
  recommendations: string[];      // Actionable financial recommendations
  dataUsed: string[];            // Types of data used in analysis
  confidence: number;             // AI confidence score (0-1)
}

/**
 * AI Service Class
 * 
 * Manages AI model interactions for financial analysis and natural language processing.
 */
export class AIService {
  private openai: OpenAI;                    // OpenAI client instance
  private initialized = false;               // Service initialization state
  private readonly MODEL_GPT4 = 'gpt-4';           // GPT-4 model for complex reasoning
  private readonly MODEL_GPT35 = 'gpt-3.5-turbo';  // GPT-3.5 for faster queries

  /**
   * Constructor - Initialize AI Service
   * 
   * Sets up OpenAI client with API key from environment variables.
   * Does not establish connection until initialize() is called.
   */
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    logger.info('🤖 AI Service instance created');
  }

  /**
   * Initialize AI Service
   * 
   * Establishes connection to OpenAI API and verifies functionality.
   * Must be called before using any AI capabilities.
   * 
   * @throws {Error} If OpenAI API connection fails or API key is invalid
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🔧 Initializing AI Service...');
      
      // Verify OpenAI API connection and credentials
      await this.testConnection();
      
      this.initialized = true;
      logger.info('✅ AI Service initialized successfully');
      logger.info('🧠 Ready for financial AI analysis');
    } catch (error) {
      logger.error('❌ Failed to initialize AI Service:', error);
      logger.error('💡 Check your OPENAI_API_KEY environment variable');
      throw error;
    }
  }

  /**
   * Test OpenAI API Connection
   * 
   * Sends a minimal test request to verify API connectivity and authentication.
   * Used during initialization to catch configuration issues early.
   * 
   * @private
   * @throws {Error} If API test fails
   */
  private async testConnection(): Promise<void> {
    try {
      logger.info('🔍 Testing OpenAI API connection...');
      
      const response = await this.openai.chat.completions.create({
        model: this.MODEL_GPT35,           // Use faster model for test
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5,                     // Minimal response to save tokens
        temperature: 0                     // Deterministic for testing
      });
      
      // Validate response structure
      if (!response.choices || response.choices.length === 0) {
        throw new Error('Invalid response from OpenAI API - no choices returned');
      }
      
      logger.info('✅ OpenAI API connection test successful');
    } catch (error) {
      logger.error('❌ OpenAI API connection test failed:', error);
      
      // Provide helpful error messages based on common issues
      if (error.message?.includes('401')) {
        throw new Error('Invalid OpenAI API key - check OPENAI_API_KEY environment variable');
      } else if (error.message?.includes('429')) {
        throw new Error('OpenAI API rate limit exceeded - try again later');
      } else if (error.message?.includes('network')) {
        throw new Error('Network connection to OpenAI API failed - check internet connection');
      }
      
      throw error;
    }
  }

  /**
   * Analyze Financial Query to Determine Data Requirements
   * 
   * This method uses AI to understand the user's natural language query and determine
   * exactly what financial data needs to be retrieved to provide a comprehensive answer.
   * 
   * AI Analysis Process:
   * 1. Parse natural language intent and context
   * 2. Identify required data types (accounts, transactions, investments, etc.)
   * 3. Extract parameters (date ranges, limits, categories)
   * 4. Return structured analysis for data gathering
   * 
   * @param query - Natural language financial question from user
   * @returns QueryAnalysis object specifying data requirements
   * 
   * @example
   * analyzeQuery("How much did I spend on food last month?")
   * // Returns: { needsTransactions: true, needsSpendingAnalysis: true, analysisPeriod: "month" }
   */
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    // Ensure AI service is ready
    if (!this.initialized) {
      throw new Error('AI Service not initialized - call initialize() first');
    }

    try {
      logger.info(`🔍 Analyzing financial query: "${query}"`);

      // Construct detailed prompt for query analysis
      const prompt = `
        You are a financial AI assistant. Analyze the following user query and determine what specific financial data is needed to provide a comprehensive answer.

        User Query: "${query}"

        Analyze the query and respond with a JSON object containing:
        {
          "needsAccountBalance": boolean,     // True if account balances are needed
          "needsTransactions": boolean,       // True if transaction history is needed
          "needsSpendingAnalysis": boolean,   // True if spending analysis is needed
          "needsInvestments": boolean,        // True if investment data is needed
          "needsGoals": boolean,             // True if financial goals data is needed
          "timeRange": {                     // Optional: specific date range
            "start": "YYYY-MM-DD",
            "end": "YYYY-MM-DD"
          },
          "analysisPeriod": "month|quarter|year",  // Optional: analysis period
          "transactionLimit": number              // Optional: max transactions to fetch
        }

        EXAMPLES:
        Query: "What's my account balance?" 
        Response: {"needsAccountBalance": true}

        Query: "How much did I spend on food last month?"
        Response: {"needsTransactions": true, "needsSpendingAnalysis": true, "analysisPeriod": "month"}

        Query: "How is my investment portfolio performing?"
        Response: {"needsInvestments": true}

        Query: "Am I on track for my financial goals?"
        Response: {"needsGoals": true}

        Query: "Show me my transactions from January 2024"
        Response: {"needsTransactions": true, "timeRange": {"start": "2024-01-01", "end": "2024-01-31"}}

        Be precise and only request data that's actually needed to answer the query.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.MODEL_GPT35,           // Use GPT-3.5 for faster analysis
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,                   // Sufficient for JSON response
        temperature: 0.1                   // Low temperature for consistent analysis
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from AI service during query analysis');
      }

      try {
        const analysis = JSON.parse(content);
        logger.info(`✅ Query analysis complete: ${JSON.stringify(analysis)}`);
        return analysis;
      } catch (parseError) {
        logger.error('❌ Failed to parse AI query analysis response:', parseError);
        logger.error(`Raw AI response: ${content}`);
        
        // Fallback to rule-based analysis if AI parsing fails
        logger.info('🔄 Falling back to rule-based query analysis...');
        return this.getDefaultQueryAnalysis(query);
      }
    } catch (error) {
      logger.error('❌ Error during AI query analysis:', error);
      
      // Fallback to rule-based analysis if AI service fails
      logger.info('🔄 Falling back to rule-based query analysis...');
      return this.getDefaultQueryAnalysis(query);
    }
  }

  async generateResponse(query: string, financialData: any): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const prompt = `
        You are a professional financial advisor AI assistant. Use the provided financial data to answer the user's query.
        
        User Query: "${query}"
        
        Financial Data:
        ${JSON.stringify(financialData, null, 2)}
        
        Please provide a comprehensive response that includes:
        1. A direct answer to the user's question
        2. Key insights based on the data
        3. Actionable recommendations
        4. Mention what data was used in your analysis
        
        Format your response as JSON:
        {
          "answer": "Direct answer to the question",
          "insights": ["Insight 1", "Insight 2", "Insight 3"],
          "recommendations": ["Recommendation 1", "Recommendation 2"],
          "dataUsed": ["Data type 1", "Data type 2"],
          "confidence": 0.95
        }
        
        Be professional, accurate, and helpful. If you notice any concerning patterns, mention them.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      try {
        const parsedResponse = JSON.parse(content);
        return {
          answer: parsedResponse.answer || 'Unable to generate response',
          insights: parsedResponse.insights || [],
          recommendations: parsedResponse.recommendations || [],
          dataUsed: parsedResponse.dataUsed || [],
          confidence: parsedResponse.confidence || 0.8
        };
      } catch (parseError) {
        logger.error('Failed to parse AI response:', parseError);
        // Return a structured response even if parsing fails
        return {
          answer: content.substring(0, 500) + '...',
          insights: ['Analysis based on your financial data'],
          recommendations: ['Please review your financial information'],
          dataUsed: ['Available financial data'],
          confidence: 0.7
        };
      }
    } catch (error) {
      logger.error('Error generating AI response:', error);
      // Return a fallback response
      return this.getFallbackResponse(query);
    }
  }

  private getDefaultQueryAnalysis(query: string): QueryAnalysis {
    const lowerQuery = query.toLowerCase();
    
    return {
      needsAccountBalance: lowerQuery.includes('balance') || lowerQuery.includes('account'),
      needsTransactions: lowerQuery.includes('transaction') || lowerQuery.includes('spend') || lowerQuery.includes('purchase'),
      needsSpendingAnalysis: lowerQuery.includes('spending') || lowerQuery.includes('expense') || lowerQuery.includes('budget'),
      needsInvestments: lowerQuery.includes('investment') || lowerQuery.includes('portfolio') || lowerQuery.includes('stock'),
      needsGoals: lowerQuery.includes('goal') || lowerQuery.includes('target') || lowerQuery.includes('saving'),
      analysisPeriod: lowerQuery.includes('month') ? 'month' : lowerQuery.includes('year') ? 'year' : 'month',
      transactionLimit: 50
    };
  }

  private getFallbackResponse(query: string): AIResponse {
    return {
      answer: 'I apologize, but I\'m currently unable to process your financial query due to a technical issue. Please try again later.',
      insights: ['AI service is temporarily unavailable'],
      recommendations: ['Please check back later for financial analysis'],
      dataUsed: ['None - service unavailable'],
      confidence: 0.0
    };
  }

  async generateFinancialInsights(financialData: any): Promise<string[]> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const prompt = `
        Analyze the following financial data and provide key insights:
        ${JSON.stringify(financialData, null, 2)}
        
        Provide 3-5 key insights as a JSON array of strings.
        Focus on patterns, trends, and important observations.
        
        Example: ["Your spending increased 15% this month", "You're 75% towards your emergency fund goal"]
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return ['Unable to generate insights at this time'];
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        logger.error('Failed to parse insights:', parseError);
        return ['Financial analysis completed', 'Review your data for trends'];
      }
    } catch (error) {
      logger.error('Error generating insights:', error);
      return ['Unable to generate insights at this time'];
    }
  }

  async generateRecommendations(financialData: any): Promise<string[]> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const prompt = `
        Based on the following financial data, provide 3-5 actionable recommendations:
        ${JSON.stringify(financialData, null, 2)}
        
        Provide recommendations as a JSON array of strings.
        Focus on practical, actionable advice.
        
        Example: ["Consider increasing your emergency fund", "Review your investment allocation"]
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return ['Unable to generate recommendations at this time'];
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        logger.error('Failed to parse recommendations:', parseError);
        return ['Continue monitoring your financial health', 'Consider consulting a financial advisor'];
      }
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      return ['Unable to generate recommendations at this time'];
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}