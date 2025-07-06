'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  CreditCard, 
  MessageSquare,
  Send,
  Brain,
  PieChart,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react'
import { FinancialOverview } from '@/components/FinancialOverview'
import { AIAssistant } from '@/components/AIAssistant'
import { TransactionsList } from '@/components/TransactionsList'
import { GoalsProgress } from '@/components/GoalsProgress'
import { InvestmentPortfolio } from '@/components/InvestmentPortfolio'
import { SpendingChart } from '@/components/SpendingChart'
import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Fi Money Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back, {user?.firstName}</span>
              <button className="btn btn-secondary">Settings</button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'accounts' && <AccountsTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'investments' && <InvestmentsTab />}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'assistant' && <AssistantTab />}
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