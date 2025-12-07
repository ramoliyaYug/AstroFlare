import express from 'express';
import backtestingService from '../services/backtestingService.js';

const router = express.Router();

/**
 * POST /api/backtesting/test
 * Run a single backtest for a specific date
 * Body: { asset: 'BTC', testDate: '2024-07-15', daysToPredict: 1 }
 */
router.post('/test', async (req, res) => {
  try {
    const { asset, testDate, daysToPredict = 1 } = req.body;

    if (!asset || !testDate) {
      return res.status(400).json({
        error: 'Missing required parameters: asset and testDate are required',
      });
    }

    // Validate asset
    const validAssets = ['BTC', 'ETH', 'FLR'];
    if (!validAssets.includes(asset.toUpperCase())) {
      return res.status(400).json({
        error: `Invalid asset. Must be one of: ${validAssets.join(', ')}`,
      });
    }

    // Parse and validate date
    const testDateObj = new Date(testDate);
    if (isNaN(testDateObj.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD format',
      });
    }

    // Ensure date is in the past
    if (testDateObj >= new Date()) {
      return res.status(400).json({
        error: 'Test date must be in the past',
      });
    }

    // Validate daysToPredict
    const days = parseInt(daysToPredict, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      return res.status(400).json({
        error: 'daysToPredict must be between 1 and 30',
      });
    }

    console.log(`\n🔬 Backtest request: ${asset} on ${testDate}, predicting ${days} day(s) ahead`);

    // Run the backtest
    const results = await backtestingService.runBacktest(
      asset.toUpperCase(),
      testDateObj,
      days
    );

    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Backtest error:', error);
    res.status(500).json({
      error: error.message || 'Failed to run backtest',
      details: error.stack,
    });
  }
});

/**
 * POST /api/backtesting/multiple
 * Run multiple backtests for a date range
 * Body: { asset: 'BTC', startDate: '2024-01-01', endDate: '2024-07-01', stepDays: 7, daysToPredict: 1 }
 */
router.post('/multiple', async (req, res) => {
  try {
    const { asset, startDate, endDate, stepDays = 7, daysToPredict = 1 } = req.body;

    if (!asset || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: asset, startDate, and endDate are required',
      });
    }

    // Validate asset
    const validAssets = ['BTC', 'ETH', 'FLR'];
    if (!validAssets.includes(asset.toUpperCase())) {
      return res.status(400).json({
        error: `Invalid asset. Must be one of: ${validAssets.join(', ')}`,
      });
    }

    // Parse and validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD format',
      });
    }

    if (startDateObj >= endDateObj) {
      return res.status(400).json({
        error: 'startDate must be before endDate',
      });
    }

    // Validate stepDays
    const step = parseInt(stepDays, 10);
    if (isNaN(step) || step < 1 || step > 30) {
      return res.status(400).json({
        error: 'stepDays must be between 1 and 30',
      });
    }

    // Validate daysToPredict
    const days = parseInt(daysToPredict, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      return res.status(400).json({
        error: 'daysToPredict must be between 1 and 30',
      });
    }

    console.log(`\n🔬 Multiple backtests request: ${asset} from ${startDate} to ${endDate}, step: ${step} days`);

    // Run multiple backtests
    const results = await backtestingService.runMultipleBacktests(
      asset.toUpperCase(),
      startDateObj,
      endDateObj,
      step,
      days
    );

    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Multiple backtests error:', error);
    res.status(500).json({
      error: error.message || 'Failed to run multiple backtests',
      details: error.stack,
    });
  }
});

/**
 * GET /api/backtesting/validate
 * Validate if a backtest can be run for a given date
 * Query: ?asset=BTC&testDate=2024-07-15
 */
router.get('/validate', async (req, res) => {
  try {
    const { asset, testDate } = req.query;

    if (!asset || !testDate) {
      return res.status(400).json({
        error: 'Missing required parameters: asset and testDate',
      });
    }

    const testDateObj = new Date(testDate);
    if (isNaN(testDateObj.getTime())) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid date format',
      });
    }

    // Check if date is in the past
    if (testDateObj >= new Date()) {
      return res.json({
        valid: false,
        error: 'Test date must be in the past',
      });
    }

    // Check if we need at least 30 days before the test date
    const minDate = new Date(testDateObj);
    minDate.setDate(minDate.getDate() - 30);

    if (minDate < new Date('2013-04-28')) { // Bitcoin started trading around this time
      return res.json({
        valid: false,
        error: 'Test date too early - insufficient historical data available',
      });
    }

    res.json({
      valid: true,
      message: 'Backtest can be run for this date',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;

