import express from 'express';
import ftsoService from '../services/ftsoService.js';
import fassetsService from '../services/fassetsService.js';
import fdcService from '../services/fdcService.js';
import dataAggregator from '../services/dataAggregator.js';

const router = express.Router();

/**
 * GET /api/prices/live
 * Get live prices for all supported assets
 */
router.get('/live', async (req, res) => {
  try {
    const prices = await ftsoService.getAllLivePrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prices/live/:asset
 * Get live price for a specific asset
 */
router.get('/live/:asset', async (req, res) => {
  try {
    const { asset } = req.params;
    const feedId = ftsoService.getFeedIdFromAsset(asset);
    
    if (!feedId) {
      return res.status(400).json({ error: `Unsupported asset: ${asset}` });
    }

    const price = await ftsoService.getLivePrice(feedId);
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prices/week/:asset
 * Get latest week data for an asset from FAssets
 */
router.get('/week/:asset', async (req, res) => {
  try {
    const { asset } = req.params;
    const weekData = await fassetsService.getLatestWeekData(asset);
    res.json(weekData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prices/historical/:asset
 * Get historical data for an asset from FDC
 */
router.get('/historical/:asset', async (req, res) => {
  try {
    const { asset } = req.params;
    const days = parseInt(req.query.days) || 30;
    const historicalData = await fdcService.getHistoricalData(asset, days);
    res.json(historicalData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prices/aggregated/:asset
 * Get aggregated data from all sources for an asset
 */
router.get('/aggregated/:asset', async (req, res) => {
  try {
    const { asset } = req.params;
    const aggregated = await dataAggregator.aggregateAssetData(asset);
    res.json(aggregated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prices/aggregated
 * Get aggregated data for all supported assets
 */
router.get('/aggregated', async (req, res) => {
  try {
    const aggregated = await dataAggregator.aggregateAllAssetsData();
    res.json(aggregated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

