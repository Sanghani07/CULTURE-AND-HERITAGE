import express from 'express';
import { mcpServer } from '../services/mcpServer';
import { logger } from '../utils/logger';

const router = express.Router();

// Get account balances
router.get('/accounts', async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const response = await mcpServer.processFinancialQuery(
      userId,
      'Show me all my account balances'
    );

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Error getting account balances:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate, category, limit } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let query = 'Show me my recent transactions';
    if (startDate || endDate || category || limit) {
      query += ' with filters:';
      if (startDate) query += ` from ${startDate}`;
      if (endDate) query += ` to ${endDate}`;
      if (category) query += ` in category ${category}`;
      if (limit) query += ` limited to ${limit} transactions`;
    }

    const response = await mcpServer.processFinancialQuery(userId, query);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get spending analysis
router.get('/spending-analysis', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { period } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const query = `Analyze my spending patterns for the ${period || 'current month'}`;
    const response = await mcpServer.processFinancialQuery(userId, query);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Error getting spending analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get investment portfolio
router.get('/investments', async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const response = await mcpServer.processFinancialQuery(
      userId,
      'Show me my investment portfolio performance and holdings'
    );

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Error getting investment portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get financial goals
router.get('/goals', async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const response = await mcpServer.processFinancialQuery(
      userId,
      'Show me my financial goals and progress'
    );

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Error getting financial goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create financial goal
router.post('/goals', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { name, targetAmount, targetDate, category } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ error: 'Name, target amount, and target date are required' });
    }

    const query = `Create a new financial goal: ${name} with target amount $${targetAmount} by ${targetDate} in category ${category || 'General'}`;
    const response = await mcpServer.processFinancialQuery(userId, query);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Error creating financial goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get financial health score
router.get('/health-score', async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const response = await mcpServer.processFinancialQuery(
      userId,
      'Calculate my financial health score based on my accounts, spending, savings, and goals'
    );

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Error getting financial health score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as financialRouter };