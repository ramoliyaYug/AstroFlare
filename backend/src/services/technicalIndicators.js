/**
 * Technical Indicators Service
 * Calculates various technical analysis indicators from price data
 */

class TechnicalIndicatorsService {
  /**
   * Calculate Simple Moving Average (SMA)
   * @param {Array} prices - Array of price values
   * @param {number} period - Number of periods
   * @returns {number} SMA value
   */
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const recent = prices.slice(-period);
    const sum = recent.reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   * @param {Array} prices - Array of price values
   * @param {number} period - Number of periods
   * @returns {number} EMA value
   */
  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   * @param {Array} prices - Array of price values
   * @param {number} period - Number of periods (default 14)
   * @returns {number} RSI value (0-100)
   */
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    
    let gains = 0;
    let losses = 0;
    
    for (let i = changes.length - period; i < changes.length; i++) {
      if (changes[i] > 0) gains += changes[i];
      else losses += Math.abs(changes[i]);
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
  }

  /**
   * Calculate volatility (standard deviation of returns)
   * @param {Array} prices - Array of price values
   * @returns {number} Volatility as percentage
   */
  calculateVolatility(prices) {
    if (prices.length < 2) return null;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      if (prices[i - 1] > 0) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      }
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Annualize and convert to percentage (assuming daily data)
    return (stdDev * Math.sqrt(365)) * 100;
  }

  /**
   * Calculate trend direction and strength
   * @param {Array} prices - Array of price values
   * @returns {Object} Trend information
   */
  calculateTrend(prices) {
    if (prices.length < 10) {
      return { direction: 'neutral', strength: 0, priceChange: 0 };
    }
    
    const first = prices[0];
    const last = prices[prices.length - 1];
    const priceChange = ((last - first) / first) * 100;
    
    // Calculate trend strength using linear regression
    const n = prices.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += prices[i];
      sumXY += i * prices[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgPrice = sumY / n;
    const strength = Math.abs((slope / avgPrice) * 100);
    
    let direction = 'neutral';
    if (priceChange > 1) direction = 'uptrend';
    else if (priceChange < -1) direction = 'downtrend';
    
    return {
      direction,
      strength: Math.min(100, Math.max(0, strength * 100)),
      priceChange,
    };
  }

  /**
   * Calculate all technical indicators for a price series
   * @param {Array} prices - Array of price values
   * @param {number} currentPrice - Current price
   * @returns {Object} All calculated indicators
   */
  calculateAllIndicators(prices, currentPrice) {
    const validPrices = prices.filter(p => p && p > 0);
    
    return {
      sma7: this.calculateSMA(validPrices, 7),
      sma30: this.calculateSMA(validPrices, 30),
      ema12: this.calculateEMA(validPrices, 12),
      rsi: this.calculateRSI(validPrices, 14),
      volatility: this.calculateVolatility(validPrices),
      trend: this.calculateTrend(validPrices),
      currentPrice,
    };
  }

  /**
   * Get risk level based on volatility
   * @param {number} volatility - Volatility percentage
   * @returns {string} Risk level
   */
  getRiskLevel(volatility) {
    if (!volatility) return 'Unknown';
    if (volatility > 30) return 'Very High';
    if (volatility > 20) return 'High';
    if (volatility > 10) return 'Medium';
    return 'Low';
  }

  /**
   * Get RSI interpretation
   * @param {number} rsi - RSI value
   * @returns {string} RSI interpretation
   */
  getRSIInterpretation(rsi) {
    if (!rsi) return 'Insufficient data';
    if (rsi > 70) return 'Overbought';
    if (rsi > 50) return 'Bullish';
    if (rsi > 30) return 'Neutral';
    return 'Oversold';
  }
}

export default new TechnicalIndicatorsService();

