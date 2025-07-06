#!/bin/bash

# Fi Money Assistant Setup Script
echo "🚀 Setting up Fi Money AI Financial Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 13+ for the database."
fi

echo "✅ Prerequisites check completed."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys and database configuration."
else
    echo "✅ .env file already exists."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

echo "✅ Setup completed successfully!"
echo ""
echo "🔧 Next Steps:"
echo "1. Edit .env file with your API keys and database URL"
echo "2. Set up PostgreSQL database"
echo "3. Run database migrations: npm run db:migrate"
echo "4. Start development servers: npm run dev"
echo ""
echo "📚 Documentation: README.md"
echo "🆘 Support: Create an issue on GitHub"
echo ""
echo "🎉 Happy coding with Fi Money Assistant!"