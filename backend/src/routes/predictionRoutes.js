import express from 'express';
import dataAggregator from '../services/dataAggregator.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

/**
 * GET /api/predictions/:asset
 * Get price prediction for a specific asset
 */
router.get('/:asset', async (req, res) => {
  try {
    const { asset } = req.params;

    // Aggregate data from all sources
    const aggregatedData = await dataAggregator.aggregateAssetData(asset);

    // Format data for prediction
    const formattedData = dataAggregator.formatForPrediction(aggregatedData);

    // Generate prediction using Gemini API
    const predictionResult = await geminiService.generatePrediction(formattedData);

    res.json({
      asset,
      timestamp: Date.now(),
      dataPointsUsed: predictionResult.dataPointsUsed || formattedData.totalDataPoints || 0,
      currentPrice: predictionResult.currentPrice,
      priceChange24h: predictionResult.priceChange24h || formattedData.priceChange24h || 0,
      technicalIndicators: predictionResult.technicalIndicators || formattedData.technicalIndicators || {},
      prediction: {
        direction: predictionResult.prediction?.direction || 'NEUTRAL',
        priceTarget: predictionResult.prediction?.priceTarget || predictionResult.currentPrice,
        confidence: predictionResult.prediction?.confidence || 65,
        riskLevel: predictionResult.prediction?.riskLevel || 'MEDIUM',
        timeframe: predictionResult.prediction?.timeframe || '24h',
        analysis: predictionResult.prediction?.analysis || '',
        keyFactors: predictionResult.prediction?.keyFactors || [],
        technicalIndicators: predictionResult.prediction?.technicalIndicators || predictionResult.technicalIndicators || {},
      },
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      error: error.message,
      note: 'Make sure GEMINI_API_KEY is set in environment variables'
    });
  }
});

/**
 * GET /api/predictions
 * Get predictions for all supported assets
 */
router.get('/', async (req, res) => {
  try {
    const predictions = {};
    const assets = ['BTC', 'ETH', 'FLR'];

    for (const asset of assets) {
      try {
        const aggregatedData = await dataAggregator.aggregateAssetData(asset);
        const formattedData = dataAggregator.formatForPrediction(aggregatedData);
        predictions[asset] = await geminiService.generatePrediction(formattedData);
      } catch (error) {
        console.error(`Error predicting for ${asset}:`, error);
        predictions[asset] = { error: error.message };
      }
    }

    res.json({
      timestamp: Date.now(),
      predictions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

