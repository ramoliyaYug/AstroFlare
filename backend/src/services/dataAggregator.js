/**
 * Data Aggregator Service
 * Aggregates data from FTSO, FAssets, and FDC
 * Prepares data for prediction analysis
 */

import ftsoService from './ftsoService.js';
import fassetsService from './fassetsService.js';
import fdcService from './fdcService.js';
import technicalIndicators from './technicalIndicators.js';
import { FLARE_CONFIG } from '../config/flareConfig.js';

class DataAggregator {
  /**
   * Aggregate all data sources for an asset
   * @param {string} asset - Asset symbol (BTC, ETH, FLR)
   * @returns {Promise<Object>} Aggregated data from all sources
   */
  async aggregateAssetData(asset) {
    try {
      console.log(`🔄 Aggregating data for ${asset}...`);

      const [liveData, weekData, historicalData] = await Promise.all([
        this.getLiveData(asset),
        this.getWeekData(asset),
        this.getHistoricalData(asset),
      ]);

      return {
        asset,
        timestamp: Date.now(),
        live: liveData,
        week: weekData,
        historical: historicalData,
        summary: this.createSummary(liveData, weekData, historicalData),
      };
    } catch (error) {
      console.error(`Error aggregating data for ${asset}:`, error);
      throw error;
    }
  }

  /**
   * Get live data from FTSO
   * @param {string} asset - Asset symbol
   * @returns {Promise<Object>} Live price data
   */
  async getLiveData(asset) {
    const feedId = ftsoService.getFeedIdFromAsset(asset);
    if (!feedId) {
      throw new Error(`Unsupported asset: ${asset}`);
    }
    return await ftsoService.getLivePrice(feedId);
  }

  /**
   * Get latest week data from FAssets
   * @param {string} asset - Asset symbol
   * @returns {Promise<Object>} Week data
   */
  async getWeekData(asset) {
    return await fassetsService.getLatestWeekData(asset);
  }

  /**
   * Get historical data from FDC
   * @param {string} asset - Asset symbol
   * @returns {Promise<Object>} Historical data
   */
  async getHistoricalData(asset) {
    return await fdcService.getHistoricalData(asset, FLARE_CONFIG.HISTORICAL_DAYS);
  }

  /**
   * Create summary from aggregated data
   * @param {Object} live - Live data
   * @param {Object} week - Week data
   * @param {Object} historical - Historical data
   * @returns {Object} Summary statistics
   */
  createSummary(live, week, historical) {
    return {
      currentPrice: live.price,
      currentTimestamp: live.timestamp,
      weekDataPoints: week.dataPoints?.length || 0,
      historicalDataPoints: historical.dataPoints?.length || 0,
      dataCompleteness: {
        live: !!live.price,
        week: week.dataPoints?.length > 0,
        historical: historical.dataPoints?.length > 0,
      },
    };
  }

  /**
   * Format data for Gemini API prediction
   * @param {Object} aggregatedData - Aggregated data from all sources
   * @returns {Object} Formatted data for AI prediction
   */
  formatForPrediction(aggregatedData) {
    const { asset, live, week, historical } = aggregatedData;

    // Extract price points from all sources
    const pricePoints = [];

    // Add historical data points
    if (historical.dataPoints) {
      historical.dataPoints.forEach((point) => {
        if (point.price) {
          pricePoints.push({
            timestamp: point.timestamp,
            date: point.date,
            price: point.price,
            source: 'historical',
          });
        }
      });
    }

    // Add week data points
    if (week.dataPoints) {
      week.dataPoints.forEach((point) => {
        if (point.price) {
          pricePoints.push({
            timestamp: point.timestamp,
            date: point.date,
            price: point.price,
            source: 'week',
          });
        }
      });
    }

    // Add live data point
    if (live.price) {
      pricePoints.push({
        timestamp: live.timestamp * 1000,
        date: live.date,
        price: live.price,
        source: 'live',
      });
    }

    // Sort by timestamp
    pricePoints.sort((a, b) => a.timestamp - b.timestamp);

    // Calculate technical indicators
    const prices = pricePoints.map(dp => dp.price).filter(p => p && p > 0);
    const indicators = technicalIndicators.calculateAllIndicators(prices, live.price);

    // Calculate 24h price change
    let priceChange24h = 0;
    if (pricePoints.length >= 2) {
      const prices24h = pricePoints.slice(-24).map(dp => dp.price).filter(p => p && p > 0);
      if (prices24h.length >= 2) {
        const oldest = prices24h[0];
        const newest = prices24h[prices24h.length - 1];
        priceChange24h = ((newest - oldest) / oldest) * 100;
      }
    }

    return {
      asset,
      dataPoints: pricePoints,
      currentPrice: live.price,
      currentTimestamp: live.timestamp * 1000,
      totalDataPoints: pricePoints.length,
      timeRange: {
        start: pricePoints[0]?.date,
        end: pricePoints[pricePoints.length - 1]?.date,
      },
      technicalIndicators: indicators,
      priceChange24h,
    };
  }

  /**
   * Aggregate data for all supported assets
   * @returns {Promise<Object>} Aggregated data for all assets
   */
  async aggregateAllAssetsData() {
    const assets = FLARE_CONFIG.ASSETS;
    const aggregated = {};

    for (const asset of assets) {
      aggregated[asset] = await this.aggregateAssetData(asset);
    }

    return {
      timestamp: Date.now(),
      assets: aggregated,
    };
  }
}

export default new DataAggregator();

