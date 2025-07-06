# Fi Money AI Financial Assistant

A comprehensive AI-powered personal finance assistant built with Fi Money's MCP (Model Context Protocol) Server infrastructure. This application provides intelligent financial insights, spending analysis, goal tracking, and investment monitoring through a modern web interface.

## 🚀 Features

### Core Capabilities
- **AI-Powered Financial Assistant**: Natural language queries about your finances
- **Complete Financial Overview**: Account balances, transactions, and spending patterns
- **Smart Investment Tracking**: Portfolio analysis and performance monitoring
- **Goal Management**: Track and monitor financial objectives
- **Spending Analysis**: AI-driven insights into spending patterns
- **Real-time Recommendations**: Personalized financial advice

### Technical Highlights
- **MCP Server Integration**: Connects to Fi Money's MCP infrastructure
- **Multi-AI Support**: Works with OpenAI GPT-4, Google Gemini, and other models
- **Secure Architecture**: JWT authentication, encrypted data transmission
- **Real-time Updates**: Live financial data synchronization
- **Modern UI**: Responsive React/Next.js frontend with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                    Backend API (Node.js)                    │
├─────────────────────────────────────────────────────────────┤
│                    MCP Server Layer                         │
├─────────────────────────────────────────────────────────────┤
│  AI Services (OpenAI/Gemini) | Financial Data (Fi Money)   │
├─────────────────────────────────────────────────────────────┤
│                    Database (PostgreSQL)                    │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Node.js** + **TypeScript** - Server runtime and type safety
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **OpenAI/Gemini APIs** - AI integration
- **MCP SDK** - Fi Money integration

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Infrastructure
- **Docker** - Containerization
- **Prisma Migrations** - Database schema management
- **Winston** - Logging
- **Helmet** - Security headers

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **PostgreSQL** 13.0 or higher
- **npm** or **yarn**
- **OpenAI API Key** (for AI features)
- **Fi Money API Key** (for financial data)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fi-money-assistant.git
cd fi-money-assistant
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fi_money_assistant"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# AI Services
OPENAI_API_KEY="your-openai-api-key-here"

# Fi Money API
FI_MONEY_API_KEY="your-fi-money-api-key-here"
FI_MONEY_API_URL="https://api.fimoney.com"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

Visit `http://localhost:3000` to access the application.

## 🔧 Configuration

### API Keys Setup

1. **OpenAI API Key**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Create an API key in your dashboard
   - Add to `.env` as `OPENAI_API_KEY`

2. **Fi Money API Key**
   - Contact Fi Money for API access
   - Add to `.env` as `FI_MONEY_API_KEY`

3. **Database Connection**
   - Set up PostgreSQL database
   - Update `DATABASE_URL` in `.env`

### MCP Server Configuration

The application integrates with Fi Money's MCP Server for financial data access:

```typescript
// MCP Server tools automatically registered:
- get_account_balance
- get_transactions
- get_spending_analysis
- get_investment_portfolio
- get_financial_goals
```

## 🔐 Security Features

- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: API protection
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Cross-origin security
- **Helmet Integration**: Security headers
- **Environment Variables**: Sensitive data protection

## 📱 Usage Examples

### AI Assistant Queries

```text
"What's my current financial situation?"
"How much did I spend on food last month?"
"Am I on track for my emergency fund goal?"
"How is my investment portfolio performing?"
"Should I increase my retirement savings?"
```

### API Endpoints

```bash
# Authentication
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me

# Financial Data
GET  /api/financial/accounts
GET  /api/financial/transactions
GET  /api/financial/spending-analysis
GET  /api/financial/investments
GET  /api/financial/goals

# AI Assistant
POST /api/assistant/ask
GET  /api/assistant/insights
GET  /api/assistant/recommendations
```

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd frontend
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individually
docker build -t fi-money-assistant .
docker run -p 3001:3001 fi-money-assistant
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
OPENAI_API_KEY="your-production-openai-key"
FI_MONEY_API_KEY="your-production-fi-money-key"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/fi-money-assistant/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/fi-money-assistant/issues)
- **Email**: support@fimoney-assistant.com

## 🔄 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI models integration
- [ ] Real-time notifications
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Integration with more financial institutions

## 📊 Performance

- **Response Time**: <100ms for API calls
- **AI Processing**: <3s for complex queries
- **Database Queries**: Optimized with indexes
- **Frontend Loading**: <1s initial load

## 🌟 Acknowledgments

- [Fi Money](https://fimoney.com) for MCP Server infrastructure
- [OpenAI](https://openai.com) for AI capabilities
- [Prisma](https://prisma.io) for database management
- [Next.js](https://nextjs.org) for the frontend framework

---

Built with ❤️ by the Fi Money Assistant team