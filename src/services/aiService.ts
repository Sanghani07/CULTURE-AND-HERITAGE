import OpenAI from 'openai';
import { logger } from '../utils/logger';

interface QueryAnalysis {
  needsAccountBalance: boolean;
  needsTransactions: boolean;
  needsSpendingAnalysis: boolean;
  needsInvestments: boolean;
  needsGoals: boolean;
  timeRange?: {
    start: string;
    end: string;
  };
  analysisPeriod?: string;
  transactionLimit?: number;
}

interface AIResponse {
  answer: string;
  insights: string[];
  recommendations: string[];
  dataUsed: string[];
  confidence: number;
}

export class AIService {
  private openai: OpenAI;
  private initialized = false;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test API connection
      await this.testConnection();
      this.initialized = true;
      logger.info('AI Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Service:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('AI API connection test failed');
      }
    } catch (error) {
      logger.error('AI API connection test failed:', error);
      throw error;
    }
  }

  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      const prompt = `
        Analyze the following financial query and determine what data is needed to answer it.
        Query: "${query}"

        Respond with a JSON object containing:
        {
          "needsAccountBalance": boolean,
          "needsTransactions": boolean,
          "needsSpendingAnalysis": boolean,
          "needsInvestments": boolean,
          "needsGoals": boolean,
          "timeRange": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"} (optional),
          "analysisPeriod": "month|quarter|year" (optional),
          "transactionLimit": number (optional)
        }

        Examples:
        - "What's my account balance?" -> {"needsAccountBalance": true}
        - "How much did I spend on food last month?" -> {"needsTransactions": true, "needsSpendingAnalysis": true, "analysisPeriod": "month"}
        - "How is my investment portfolio performing?" -> {"needsInvestments": true}
        - "Am I on track for my financial goals?" -> {"needsGoals": true}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        logger.error('Failed to parse AI response:', parseError);
        // Return a default analysis if parsing fails
        return this.getDefaultQueryAnalysis(query);
      }
    } catch (error) {
      logger.error('Error analyzing query:', error);
      // Return a default analysis if AI service fails
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