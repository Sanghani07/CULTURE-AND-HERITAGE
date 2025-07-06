/**
 * AI Financial Assistant Component
 * 
 * This component provides a chat-based interface for users to interact with the AI-powered
 * financial assistant. It enables natural language queries about financial data and provides
 * intelligent responses with insights and recommendations.
 * 
 * Key Features:
 * - Real-time chat interface with message history
 * - Natural language processing for financial queries
 * - Structured AI responses with insights and recommendations
 * - Quick question shortcuts for common queries
 * - Loading states and error handling
 * - Integration with MCP Server via API
 * 
 * User Experience:
 * - Users can ask questions like "What's my spending this month?"
 * - AI analyzes the query and fetches relevant financial data
 * - Responses include direct answers, insights, and actionable recommendations
 * - Chat history is maintained for context and reference
 */

'use client'

import { useState } from 'react'
import { Send, Bot, User, TrendingUp, DollarSign, Target, PieChart } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

/**
 * Message Interface
 * 
 * Defines the structure for chat messages between user and AI assistant.
 * Includes optional fields for structured AI responses.
 */
interface Message {
  id: string                      // Unique message identifier
  type: 'user' | 'assistant'      // Message sender type
  content: string                 // Main message content
  timestamp: Date                 // When the message was sent
  insights?: string[]            // AI-generated insights (assistant only)
  recommendations?: string[]      // AI-generated recommendations (assistant only)
}

/**
 * AI Assistant Component
 * 
 * Main component that renders the chat interface and handles user interactions
 * with the AI financial assistant.
 */
export function AIAssistant() {
  // Message state management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI financial assistant. I can help you analyze your finances, answer questions about your spending, investments, and goals. What would you like to know?',
      timestamp: new Date(),
    }
  ])
  
  // Input and loading state
  const [input, setInput] = useState('')              // Current user input
  const [isLoading, setIsLoading] = useState(false)   // Loading state for AI responses
  
  // React Query client for cache management
  const queryClient = useQueryClient()

  const sendMessage = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiClient.post('/assistant/ask', { question })
      return response.data
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response.answer,
        timestamp: new Date(),
        insights: data.response.insights,
        recommendations: data.response.recommendations
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    },
    onError: (error) => {
      console.error('Error sending message:', error)
      setIsLoading(false)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    sendMessage.mutate(input)
  }

  const quickQuestions = [
    { icon: DollarSign, text: "What's my current financial situation?" },
    { icon: TrendingUp, text: "How did I spend money this month?" },
    { icon: Target, text: "Am I on track for my financial goals?" },
    { icon: PieChart, text: "How is my investment portfolio performing?" },
  ]

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    sendMessage.mutate(question)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">AI Financial Assistant</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'assistant' && (
                  <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{message.content}</p>
                  
                  {message.insights && message.insights.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Key Insights:</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {message.insights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-medium text-green-900 mb-2">Recommendations:</h4>
                      <ul className="text-xs text-green-800 space-y-1">
                        {message.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <User className="h-5 w-5 text-white mt-0.5" />
                )}
              </div>
              <p className="text-xs opacity-75 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg max-w-xs">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Questions:</h4>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question.text)}
                className="flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <question.icon className="h-4 w-4" />
                <span>{question.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your finances..."
            className="flex-1 input"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn btn-primary px-4 py-2"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}