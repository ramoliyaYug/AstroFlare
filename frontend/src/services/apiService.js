import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Get live prices for all assets
   */
  async getLivePrices() {
    const response = await api.get('/api/prices/live');
    return response.data;
  },

  /**
   * Get live price for a specific asset
   */
  async getLivePrice(asset) {
    const response = await api.get(`/api/prices/live/${asset}`);
    return response.data;
  },

  /**
   * Get latest week data for an asset
   */
  async getWeekData(asset) {
    const response = await api.get(`/api/prices/week/${asset}`);
    return response.data;
  },

  /**
   * Get historical data for an asset
   */
  async getHistoricalData(asset, days = 30) {
    const response = await api.get(`/api/prices/historical/${asset}`, {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get aggregated data for an asset
   */
  async getAggregatedData(asset) {
    const response = await api.get(`/api/prices/aggregated/${asset}`);
    return response.data;
  },

  /**
   * Get price prediction for an asset
   */
  async getPrediction(asset) {
    const response = await api.get(`/api/predictions/${asset}`);
    return response.data;
  },

  /**
   * Get predictions for all assets
   */
  async getAllPredictions() {
    const response = await api.get('/api/predictions');
    return response.data;
  },

  /**
   * Run a backtest for a specific date
   */
  async runBacktest(asset, testDate, daysToPredict = 1) {
    const response = await api.post('/api/backtesting/test', {
      asset,
      testDate,
      daysToPredict,
    });
    return response.data;
  },

  /**
   * Run multiple backtests for a date range
   */
  async runMultipleBacktests(asset, startDate, endDate, stepDays = 7, daysToPredict = 1) {
    const response = await api.post('/api/backtesting/multiple', {
      asset,
      startDate,
      endDate,
      stepDays,
      daysToPredict,
    });
    return response.data;
  },

  /**
   * Validate if a backtest can be run for a date
   */
  async validateBacktest(asset, testDate) {
    const response = await api.get('/api/backtesting/validate', {
      params: { asset, testDate },
    });
    return response.data;
  },
};

