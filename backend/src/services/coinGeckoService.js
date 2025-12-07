/**
 * CoinGecko Service
 * Fetches historical cryptocurrency price data from CoinGecko API
 */

import axios from 'axios';

class CoinGeckoService {
  constructor() {
    this.baseURL = 'https://api.coingecko.com/api/v3';
    this.assetMapping = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      FLR: 'flare-network',
    };
  }

  /**
   * Get CoinGecko asset ID from symbol
   * @param {string} asset - Asset symbol (BTC, ETH, FLR)
   * @returns {string} CoinGecko asset ID
   */
  getAssetId(asset) {
    return this.assetMapping[asset.toUpperCase()] || null;
  }

  /**
   * Fetch historical price data from CoinGecko
   * @param {string} asset - Asset symbol (BTC, ETH, FLR)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of price data points
   */
  async getHistoricalData(asset, startDate, endDate) {
    try {
      const assetId = this.getAssetId(asset);
      if (!assetId) {
        throw new Error(`Unsupported asset: ${asset}`);
      }

      // Convert dates to timestamps
      const fromTimestamp = Math.floor(startDate.getTime() / 1000);
      const toTimestamp = Math.floor(endDate.getTime() / 1000);

      console.log(`📊 Fetching CoinGecko data for ${asset} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // CoinGecko market chart range endpoint
      const response = await axios.get(`${this.baseURL}/coins/${assetId}/market_chart/range`, {
        params: {
          vs_currency: 'usd',
          from: fromTimestamp,
          to: toTimestamp,
        },
        timeout: 10000,
      });

      const { prices } = response.data;

      // Transform CoinGecko data to our format
      const dataPoints = prices.map(([timestamp, price]) => ({
        timestamp: timestamp,
        date: new Date(timestamp).toISOString(),
        price: price,
      }));

      console.log(`✅ Fetched ${dataPoints.length} data points from CoinGecko`);
      return dataPoints;
    } catch (error) {
      console.error(`Error fetching CoinGecko data for ${asset}:`, error.message);
      if (error.response) {
        console.error('CoinGecko API Error:', error.response.data);
      }
      throw new Error(`Failed to fetch CoinGecko data: ${error.message}`);
    }
  }

  /**
   * Get price data for a specific date
   * @param {string} asset - Asset symbol
   * @param {Date} date - Date to get price for
   * @returns {Promise<number>} Price on that date
   */
  async getPriceOnDate(asset, date) {
    try {
      // Get data for the date and surrounding days to find the closest price
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      endDate.setDate(endDate.getDate() + 1); // Include next day to ensure we get data

      const dataPoints = await this.getHistoricalData(asset, startDate, endDate);
      
      if (dataPoints.length === 0) {
        throw new Error(`No price data available for ${asset} on ${date.toISOString()}`);
      }

      // Find the closest data point to the requested date
      const targetTimestamp = date.getTime();
      const closestPoint = dataPoints.reduce((closest, current) => {
        const closestDiff = Math.abs(closest.timestamp - targetTimestamp);
        const currentDiff = Math.abs(current.timestamp - targetTimestamp);
        return currentDiff < closestDiff ? current : closest;
      });

      return closestPoint.price;
    } catch (error) {
      console.error(`Error getting price on date for ${asset}:`, error.message);
      throw error;
    }
  }

  /**
   * Get prices for multiple dates
   * @param {string} asset - Asset symbol
   * @param {Array<Date>} dates - Array of dates
   * @returns {Promise<Array>} Array of { date, price } objects
   */
  async getPricesForDates(asset, dates) {
    try {
      if (dates.length === 0) return [];

      const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
      endDate.setHours(23, 59, 59, 999);
      endDate.setDate(endDate.getDate() + 1);

      const dataPoints = await this.getHistoricalData(asset, startDate, endDate);

      // Map each requested date to the closest available price
      return dates.map(date => {
        const targetTimestamp = date.getTime();
        const closestPoint = dataPoints.reduce((closest, current) => {
          const closestDiff = Math.abs(closest.timestamp - targetTimestamp);
          const currentDiff = Math.abs(current.timestamp - targetTimestamp);
          return currentDiff < closestDiff ? current : closest;
        });

        return {
          date: date.toISOString(),
          price: closestPoint.price,
        };
      });
    } catch (error) {
      console.error(`Error getting prices for dates for ${asset}:`, error.message);
      throw error;
    }
  }

  /**
   * Get daily prices for a date range (one price per day)
   * @param {string} asset - Asset symbol
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of daily price data
   */
  async getDailyPrices(asset, startDate, endDate) {
    try {
      const allData = await this.getHistoricalData(asset, startDate, endDate);
      
      // Group by day and get the price closest to midnight UTC for each day
      const dailyPrices = {};
      
      allData.forEach(point => {
        const date = new Date(point.timestamp);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!dailyPrices[dayKey]) {
          dailyPrices[dayKey] = point;
        } else {
          // Use the point closest to midnight (00:00 UTC)
          const currentMidnight = new Date(dayKey + 'T00:00:00Z').getTime();
          const currentDiff = Math.abs(dailyPrices[dayKey].timestamp - currentMidnight);
          const newDiff = Math.abs(point.timestamp - currentMidnight);
          
          if (newDiff < currentDiff) {
            dailyPrices[dayKey] = point;
          }
        }
      });

      // Convert to array and sort by date
      return Object.values(dailyPrices)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(point => ({
          timestamp: point.timestamp,
          date: new Date(point.timestamp).toISOString().split('T')[0],
          price: point.price,
        }));
    } catch (error) {
      console.error(`Error getting daily prices for ${asset}:`, error.message);
      throw error;
    }
  }
}

export default new CoinGeckoService();

