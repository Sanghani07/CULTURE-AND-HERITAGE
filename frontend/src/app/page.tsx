/**
 * Fi Money Assistant - Main Dashboard Page
 * 
 * This is the primary user interface for the Fi Money AI Financial Assistant.
 * It provides a comprehensive financial dashboard with AI-powered insights
 * and natural language query capabilities.
 * 
 * Key Features:
 * - Multi-tab interface for different financial views
 * - Real-time financial data integration via React Query
 * - AI-powered financial assistant chat interface
 * - Responsive design with Tailwind CSS
 * - Authentication-protected content
 * 
 * Components Structure:
 * - OverviewTab: Main financial summary and insights
 * - AccountsTab: Detailed account balances and information
 * - TransactionsTab: Transaction history and analysis
 * - InvestmentsTab: Portfolio performance and holdings
 * - GoalsTab: Financial goals tracking and progress
 * - AssistantTab: AI-powered financial chat assistant
 */

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// Import Lucide React icons for UI elements
import { 
  DollarSign,        // Money/balance icons
  TrendingUp,        // Growth/investment icons
  Target,            // Goals icons
  CreditCard,        // Transaction icons
  MessageSquare,     // Chat/assistant icons
  Send,              // Action icons
  Brain,             // AI/intelligence icons
  PieChart,          // Analytics icons
  ArrowUpCircle,     // Status indicators
  ArrowDownCircle
} from 'lucide-react'

// Import financial dashboard components
import { FinancialOverview } from '@/components/FinancialOverview'
import { AIAssistant } from '@/components/AIAssistant'
import { TransactionsList } from '@/components/TransactionsList'
import { GoalsProgress } from '@/components/GoalsProgress'
import { InvestmentPortfolio } from '@/components/InvestmentPortfolio'
import { SpendingChart } from '@/components/SpendingChart'

// Import authentication hook
import { useAuth } from '@/hooks/useAuth'

/**
 * Main Dashboard Component
 * 
 * Renders the complete financial dashboard interface with tab-based navigation
 * and authentication protection.
 */
export default function Dashboard() {
  // Get authentication state and user information
  const { user, isAuthenticated } = useAuth()
  
  // Manage active tab state for navigation
  const [activeTab, setActiveTab] = useState('overview')

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 
        HEADER SECTION
        Main application header with branding and user info
      */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side: App branding and logo */}
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Fi Money Assistant</h1>
            </div>
            
            {/* Right side: User info and actions */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {user?.firstName}
              </span>
              <button className="btn btn-secondary">Settings</button>
            </div>
          </div>
        </div>
      </header>

      {/* 
        NAVIGATION SECTION
        Tab-based navigation for different financial views
        Uses consistent styling with active/inactive states
      */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {/* Overview Tab - Main dashboard summary */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'    // Active state
                  : 'border-transparent text-gray-500 hover:text-gray-700'  // Inactive state
              }`}
            >
              Overview
            </button>
            
            {/* Accounts Tab - Account balances and details */}
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Accounts
            </button>
            
            {/* Transactions Tab - Transaction history and analysis */}
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
            
            {/* Investments Tab - Portfolio and performance */}
            <button
              onClick={() => setActiveTab('investments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'investments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Investments
            </button>
            
            {/* Goals Tab - Financial goals tracking */}
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'goals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Goals
            </button>
            
            {/* AI Assistant Tab - Natural language financial queries */}
            <button
              onClick={() => setActiveTab('assistant')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assistant'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              AI Assistant
            </button>
          </div>
        </div>
      </nav>

      {/* 
        MAIN CONTENT SECTION
        Renders the active tab component based on navigation state
        Each tab provides a different view of financial data
      */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}        {/* Financial summary dashboard */}
        {activeTab === 'accounts' && <AccountsTab />}        {/* Account details and balances */}
        {activeTab === 'transactions' && <TransactionsTab />} {/* Transaction history */}
        {activeTab === 'investments' && <InvestmentsTab />}   {/* Investment portfolio */}
        {activeTab === 'goals' && <GoalsTab />}              {/* Financial goals tracking */}
        {activeTab === 'assistant' && <AssistantTab />}      {/* AI assistant interface */}
      </main>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <FinancialOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart />
        <div className="space-y-6">
          <GoalsProgress />
          <InvestmentPortfolio />
        </div>
      </div>
    </div>
  )
}

function AccountsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Account Balances</h2>
      <FinancialOverview />
    </div>
  )
}

function TransactionsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
      <TransactionsList />
    </div>
  )
}

function InvestmentsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Investment Portfolio</h2>
      <InvestmentPortfolio />
    </div>
  )
}

function GoalsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
      <GoalsProgress />
    </div>
  )
}

function AssistantTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">AI Financial Assistant</h2>
      <AIAssistant />
    </div>
  )
}

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Fi Money Assistant
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your AI-powered financial insights
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button className="w-full btn btn-primary h-12">
            Sign in with Google
          </button>
          <button className="w-full btn btn-secondary h-12">
            Sign in with Email
          </button>
        </div>
      </div>
    </div>
  )
}