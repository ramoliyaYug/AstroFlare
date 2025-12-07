/**
 * FTSO Service
 * Handles interaction with Flare Time Series Oracle (FTSO) v2
 * Fetches live and historical price data
 */

import { ethers } from 'ethers';
import { interfaceToAbi } from '@flarenetwork/flare-periphery-contract-artifacts';
import { FLARE_CONFIG } from '../config/flareConfig.js';

class FtsoService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(FLARE_CONFIG.RPC_URL);
    this.ftsoV2 = null;
    this.initializeContract();
  }

  async initializeContract() {
    try {
      const abi = interfaceToAbi('FtsoV2Interface', 'coston2');
      this.ftsoV2 = new ethers.Contract(
        FLARE_CONFIG.FTSOV2_ADDRESS,
        abi,
        this.provider
      );
      console.log('✅ FTSO v2 contract initialized');
    } catch (error) {
      console.error('❌ Error initializing FTSO contract:', error);
      throw error;
    }
  }

  /**
   * Get live price for a single feed
   * @param {string} feedId - The feed ID (e.g., BTC/USD)
   * @returns {Promise<Object>} Price data with value, decimals, and timestamp
   */
  async getLivePrice(feedId) {
    try {
      if (!this.ftsoV2) {
        await this.initializeContract();
      }

      const result = await this.ftsoV2.getFeedById.staticCall(feedId);
      const [value, decimals, timestamp] = result;

      const decimalsNum = Number(decimals);

      return {
        feedId,
        feedName: FLARE_CONFIG.FEED_NAMES[feedId] || 'Unknown',
        value: value.toString(),
        decimals: decimalsNum,
        timestamp: Number(timestamp),
        price: this.formatPrice(value, decimalsNum),
        date: new Date(Number(timestamp) * 1000).toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching live price for ${feedId}:`, error);
      throw error;
    }
  }

  /**
   * Get live prices for multiple feeds
   * @param {string[]} feedIds - Array of feed IDs
   * @returns {Promise<Object[]>} Array of price data
   */
  async getLivePrices(feedIds) {
    try {
      if (!this.ftsoV2) {
        await this.initializeContract();
      }

      const result = await this.ftsoV2.getFeedsById.staticCall(feedIds);
      const [values, decimals, timestamp] = result;

      return feedIds.map((feedId, index) => {
        const decimalsNum = Number(decimals[index]);
        return {
          feedId,
          feedName: FLARE_CONFIG.FEED_NAMES[feedId] || 'Unknown',
          value: values[index].toString(),
          decimals: decimalsNum,
          timestamp: Number(timestamp),
          price: this.formatPrice(values[index], decimalsNum),
          date: new Date(Number(timestamp) * 1000).toISOString(),
        };
      });
    } catch (error) {
      console.error('Error fetching live prices:', error);
      throw error;
    }
  }

  /**
   * Get all supported asset prices
   * @returns {Promise<Object>} Prices for all supported assets
   */
  async getAllLivePrices() {
    const feedIds = Object.values(FLARE_CONFIG.FEED_IDS);
    const prices = await this.getLivePrices(feedIds);
    
    return {
      timestamp: Date.now(),
      prices: prices.reduce((acc, price) => {
        const asset = this.getAssetFromFeedId(price.feedId);
        acc[asset] = price;
        return acc;
      }, {}),
    };
  }

  /**
   * Get historical price data (simulated - FTSO doesn't store historical data directly)
   * In production, you would query blockchain events or use FDC/FAssets
   * @param {string} feedId - The feed ID
   * @param {number} days - Number of days to fetch
   * @returns {Promise<Object[]>} Historical price data
   */
  async getHistoricalPrices(feedId, days = 30) {
    // Note: FTSO v2 doesn't store historical data on-chain
    // This would typically require:
    // 1. Querying blockchain events for past price updates
    // 2. Using FDC (Flare Data Connector) for historical data
    // 3. Using FAssets for aggregated historical data
    
    console.warn('⚠️  Historical data fetching requires event querying or FDC/FAssets integration');
    
    // For now, return current price as placeholder
    // In production, implement event querying or FDC integration
    const currentPrice = await this.getLivePrice(feedId);
    
    return {
      feedId,
      feedName: currentPrice.feedName,
      current: currentPrice,
      historical: [], // Would be populated with actual historical data
      note: 'Historical data requires FDC/FAssets integration or event querying',
    };
  }

  /**
   * Format price value based on decimals
   * @param {BigInt} value - Raw value
   * @param {number} decimals - Decimal places (must be a number, not BigInt)
   * @returns {number} Formatted price
   */
  formatPrice(value, decimals) {
    // Ensure decimals is a number
    const decimalsNum = typeof decimals === 'bigint' ? Number(decimals) : decimals;
    const absDecimals = Math.abs(decimalsNum);
    const divisor = BigInt(10 ** absDecimals);
    const wholePart = value / divisor;
    const fractionalPart = value % divisor;
    return Number(wholePart) + Number(fractionalPart) / Number(divisor);
  }

  /**
   * Get asset symbol from feed ID
   * @param {string} feedId - The feed ID
   * @returns {string} Asset symbol
   */
  getAssetFromFeedId(feedId) {
    const mapping = {
      [FLARE_CONFIG.FEED_IDS.FLR_USD]: 'FLR',
      [FLARE_CONFIG.FEED_IDS.BTC_USD]: 'BTC',
      [FLARE_CONFIG.FEED_IDS.ETH_USD]: 'ETH',
    };
    return mapping[feedId] || 'UNKNOWN';
  }

  /**
   * Get feed ID from asset symbol
   * @param {string} asset - Asset symbol (BTC, ETH, FLR)
   * @returns {string} Feed ID
   */
  getFeedIdFromAsset(asset) {
    const mapping = {
      BTC: FLARE_CONFIG.FEED_IDS.BTC_USD,
      ETH: FLARE_CONFIG.FEED_IDS.ETH_USD,
      FLR: FLARE_CONFIG.FEED_IDS.FLR_USD,
    };
    return mapping[asset.toUpperCase()];
  }
}

export default new FtsoService();

