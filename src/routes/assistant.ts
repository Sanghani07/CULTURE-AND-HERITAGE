import express from 'express';
import { mcpServer } from '../services/mcpServer';
import { logger } from '../utils/logger';

const router = express.Router();

// Ask financial question
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    logger.info(`Processing financial query from user ${userId}: ${question}`);

    const response = await mcpServer.processFinancialQuery(userId, question);

    res.json({
      success: true,
      data: {
        question,
        response
      }
    });
  } catch (error) {
    logger.error('Error processing financial query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get financial insights
router.get('/insights', async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get recent insights for the user
    const insights = await mcpServer.processFinancialQuery(
      userId,
      'Provide me with key financial insights based on my current financial situation'
    );

    res.json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    logger.error('Error getting financial insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get financial recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const recommendations = await mcpServer.processFinancialQuery(
      userId,
      'Provide me with personalized financial recommendations based on my data'
    );

    res.json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    logger.error('Error getting financial recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get financial summary
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const summary = await mcpServer.processFinancialQuery(
      userId,
      'Provide me with a comprehensive financial summary including account balances, recent transactions, and goal progress'
    );

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    logger.error('Error getting financial summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as assistantRouter };