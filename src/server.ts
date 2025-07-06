import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth';
import { assistantRouter } from './routes/assistant';
import { financialRouter } from './routes/financial';
import { mcpServer } from './services/mcpServer';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/assistant', authenticate, assistantRouter);
app.use('/api/financial', authenticate, financialRouter);

// Error handling middleware
app.use(errorHandler);

// Initialize MCP Server
const initializeMCPServer = async () => {
  try {
    await mcpServer.initialize();
    logger.info('MCP Server initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize MCP Server:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await initializeMCPServer();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Financial AI Assistant API ready`);
      logger.info(`🔗 MCP Server connected to Fi Money`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch(error => {
  logger.error('Server startup error:', error);
  process.exit(1);
});

export { app, prisma };