/**
 * Fi Money AI Financial Assistant - Main Server File
 * 
 * This is the core Express.js server that provides:
 * - RESTful API endpoints for financial data and AI assistant
 * - Integration with Fi Money's MCP (Model Context Protocol) Server
 * - Secure authentication and authorization
 * - Rate limiting and security middleware
 * - Database connectivity through Prisma ORM
 * 
 * Architecture:
 * Client -> Express API -> MCP Server -> Fi Money Data + AI Models
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import route handlers
import { authRouter } from './routes/auth';
import { assistantRouter } from './routes/assistant';
import { financialRouter } from './routes/financial';

// Import core services
import { mcpServer } from './services/mcpServer';
import { logger } from './utils/logger';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Initialize Prisma client for database operations
const prisma = new PrismaClient();

// Server configuration
const PORT = process.env.PORT || 3001;

/**
 * SECURITY MIDDLEWARE CONFIGURATION
 * Essential security measures for production deployment
 */

// Helmet: Sets various HTTP headers to secure the app
app.use(helmet());

// CORS: Configure Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow frontend domain
  credentials: true // Allow cookies and auth headers
}));

/**
 * RATE LIMITING
 * Prevent abuse and DoS attacks by limiting requests per IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes time window
  max: 100, // Maximum 100 requests per IP per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});
app.use(limiter);

/**
 * BODY PARSING MIDDLEWARE
 * Parse incoming request bodies in JSON and URL-encoded format
 */
app.use(express.json({ limit: '10mb' })); // Parse JSON payloads up to 10MB
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

/**
 * HEALTH CHECK ENDPOINT
 * Used by load balancers and monitoring systems to check server status
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'fi-money-assistant',
    version: '1.0.0'
  });
});

/**
 * API ROUTES CONFIGURATION
 * All routes are prefixed with /api for clear API versioning
 */
app.use('/api/auth', authRouter);                           // Public: Authentication routes
app.use('/api/assistant', authenticate, assistantRouter);   // Protected: AI assistant endpoints  
app.use('/api/financial', authenticate, financialRouter);   // Protected: Financial data endpoints

/**
 * GLOBAL ERROR HANDLING
 * Catch and process all errors in a consistent manner
 */
app.use(errorHandler);

/**
 * MCP SERVER INITIALIZATION
 * Initialize the Model Context Protocol server for Fi Money integration
 * This connects our application to Fi Money's financial data infrastructure
 */
const initializeMCPServer = async () => {
  try {
    // Initialize MCP connection and register financial data tools
    await mcpServer.initialize();
    logger.info('✅ MCP Server initialized successfully');
    logger.info('🔗 Connected to Fi Money financial data infrastructure');
  } catch (error) {
    logger.error('❌ Failed to initialize MCP Server:', error);
    logger.error('💡 Check your FI_MONEY_API_KEY and network connection');
    process.exit(1); // Exit if MCP server fails - it's critical for the app
  }
};

/**
 * SERVER STARTUP FUNCTION
 * Orchestrates the complete server initialization process
 */
const startServer = async () => {
  try {
    // Step 1: Initialize MCP Server connection to Fi Money
    await initializeMCPServer();
    
    // Step 2: Start the Express server
    app.listen(PORT, () => {
      logger.info(`🚀 Fi Money Assistant server running on port ${PORT}`);
      logger.info(`📊 Financial AI Assistant API ready at http://localhost:${PORT}`);
      logger.info(`🔗 MCP Server connected to Fi Money infrastructure`);
      logger.info(`🤖 AI-powered financial insights available`);
      logger.info(`📚 API documentation: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * GRACEFUL SHUTDOWN HANDLERS
 * Ensure clean shutdown of database connections and services
 */

// Handle SIGTERM (sent by process managers like PM2, Docker)
process.on('SIGTERM', async () => {
  logger.info('📋 SIGTERM received, initiating graceful shutdown...');
  try {
    await prisma.$disconnect(); // Close database connections
    await mcpServer.shutdown();  // Close MCP server connections
    logger.info('✅ Graceful shutdown completed');
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
  }
  process.exit(0);
});

// Handle SIGINT (Ctrl+C in terminal)
process.on('SIGINT', async () => {
  logger.info('📋 SIGINT received (Ctrl+C), initiating graceful shutdown...');
  try {
    await prisma.$disconnect(); // Close database connections
    await mcpServer.shutdown();  // Close MCP server connections
    logger.info('✅ Graceful shutdown completed');
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
  }
  process.exit(0);
});

/**
 * START THE APPLICATION
 * Begin server initialization and catch any startup errors
 */
startServer().catch(error => {
  logger.error('💥 Critical server startup error:', error);
  logger.error('💡 Check your environment variables and database connection');
  process.exit(1);
});

/**
 * EXPORT SERVER INSTANCES
 * Make app and database client available for testing and external use
 */
export { app, prisma };