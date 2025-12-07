/**
 * Backtesting Service
 * Tests Gemini AI predictions against historical data
 */

import coinGeckoService from './coinGeckoService.js';
import geminiService from './geminiService.js';
import technicalIndicators from './technicalIndicators.js';

class BacktestingService {
  /**
   * Run a backtest for a specific date and asset
   * @param {string} asset - Asset symbol (BTC, ETH, FLR)
   * @param {Date} testDate - Date to test (will use 30 days before this for prediction)
   * @param {number} daysToPredict - Number of days to predict (default: 1)
   * @returns {Promise<Object>} Backtest results with accuracy metrics
   */
  async runBacktest(asset, testDate, daysToPredict = 1) {
    try {
      console.log(`\n🔬 Starting backtest for ${asset} on ${testDate.toISOString().split('T')[0]}, predicting ${daysToPredict} day(s) ahead`);

      // Step 1: Calculate the date range for historical data (30 days before testDate)
      const historicalEndDate = new Date(testDate);
      historicalEndDate.setHours(0, 0, 0, 0);
      
      const historicalStartDate = new Date(historicalEndDate);
      historicalStartDate.setDate(historicalStartDate.getDate() - 30);

      // Step 2: Fetch 30 days of historical data from CoinGecko
      console.log(`📈 Fetching historical data from ${historicalStartDate.toISOString().split('T')[0]} to ${historicalEndDate.toISOString().split('T')[0]}`);
      const historicalData = await coinGeckoService.getHistoricalData(
        asset,
        historicalStartDate,
        historicalEndDate
      );

      if (historicalData.length === 0) {
        throw new Error('No historical data available for the specified date range');
      }

      // Get the "current" price (price on testDate)
      const currentPrice = historicalData[historicalData.length - 1].price;

      // Step 3: Calculate technical indicators for historical data
      const prices = historicalData.map(dp => dp.price).filter(p => p && p > 0);
      const indicators = technicalIndicators.calculateAllIndicators(prices, currentPrice);

      // Calculate 24h price change
      let priceChange24h = 0;
      if (historicalData.length >= 2) {
        const yesterdayPrice = historicalData[historicalData.length - 2].price;
        priceChange24h = ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;
      }

      // Step 4: Format data for Gemini (same format as live predictions)
      const formattedData = {
        asset,
        dataPoints: historicalData.map(dp => ({
          timestamp: dp.timestamp,
          date: dp.date,
          price: dp.price,
        })),
        currentPrice,
        currentTimestamp: historicalData[historicalData.length - 1].timestamp,
        totalDataPoints: historicalData.length,
        timeRange: {
          start: historicalData[0].date,
          end: historicalData[historicalData.length - 1].date,
        },
        technicalIndicators: indicators,
        priceChange24h,
      };

      // Step 5: Get Gemini prediction
      console.log(`🤖 Getting Gemini prediction...`);
      const predictionResult = await geminiService.generatePrediction(formattedData);
      const predictedPrice = predictionResult.prediction?.priceTarget || predictionResult.currentPrice;

      // Step 6: Calculate the dates we're predicting for
      const predictedDates = [];
      for (let i = 1; i <= daysToPredict; i++) {
        const date = new Date(testDate);
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0);
        predictedDates.push(date);
      }

      // Step 7: Fetch actual prices for predicted days
      console.log(`📊 Fetching actual prices for predicted dates...`);
      const actualPrices = await coinGeckoService.getPricesForDates(asset, predictedDates);

      if (actualPrices.length === 0) {
        throw new Error('No actual prices found for predicted dates');
      }

      // Step 8: For multiple days, we use the same predicted price for all days
      // (Alternatively, we could calculate a trend-based prediction for each day)
      // Create array of predicted prices (same price for all days, or calculate trend)
      const predictedPrices = [];
      if (daysToPredict === 1) {
        // Single day: use the predicted price directly
        predictedPrices.push(predictedPrice);
      } else {
        // Multiple days: use the predicted price as the target for the last day
        // For intermediate days, interpolate or use the same price
        // Simple approach: use predicted price for all days
        // (More sophisticated: calculate daily increments based on predicted change)
        const priceChange = predictedPrice - currentPrice;
        const dailyChange = priceChange / daysToPredict;
        
        for (let i = 1; i <= daysToPredict; i++) {
          // Linear interpolation: distribute the total change across days
          predictedPrices.push(currentPrice + (dailyChange * i));
        }
      }

      // Step 9: Calculate accuracy metrics
      const actualPriceArray = actualPrices.map(ap => ap.price).filter(p => p != null && !isNaN(p));
      
      if (predictedPrices.length !== actualPriceArray.length) {
        console.warn(`⚠️  Mismatch: ${predictedPrices.length} predicted prices vs ${actualPriceArray.length} actual prices`);
        // Adjust to match lengths
        const minLength = Math.min(predictedPrices.length, actualPriceArray.length);
        predictedPrices.splice(minLength);
        actualPriceArray.splice(minLength);
      }

      const metrics = this.calculateMetrics(
        predictedPrices,
        actualPriceArray,
        currentPrice
      );

      // Step 10: Prepare results
      const results = {
        asset,
        testDate: testDate.toISOString().split('T')[0],
        historicalDateRange: {
          start: historicalStartDate.toISOString().split('T')[0],
          end: historicalEndDate.toISOString().split('T')[0],
        },
        daysToPredict,
        currentPrice,
        predictedPrice: daysToPredict === 1 ? predictedPrice : predictedPrices[predictedPrices.length - 1], // Main target price
        predictedPrices: predictedPrices, // Array of predicted prices for each day
        actualPrices: actualPrices.map(ap => ({
          date: ap.date.split('T')[0],
          price: ap.price,
        })),
        prediction: {
          direction: predictionResult.prediction?.direction || 'NEUTRAL',
          priceTarget: predictedPrice,
          confidence: predictionResult.prediction?.confidence || 65,
          analysis: predictionResult.prediction?.analysis || '',
        },
        metrics,
        technicalIndicators: indicators,
        dataPointsUsed: historicalData.length,
      };

      console.log(`✅ Backtest completed! Accuracy: ${(metrics.directionalAccuracy * 100).toFixed(2)}%`);
      return results;
    } catch (error) {
      console.error(`❌ Backtest failed for ${asset}:`, error);
      throw error;
    }
  }

  /**
   * Calculate accuracy metrics
   * @param {number|Array} predictedPrices - Predicted price(s)
   * @param {Array} actualPrices - Actual prices
   * @param {number} currentPrice - Current/base price
   * @returns {Object} Accuracy metrics
   */
  calculateMetrics(predictedPrices, actualPrices, currentPrice) {
    // Handle single prediction or multiple predictions
    const predicted = Array.isArray(predictedPrices) ? predictedPrices : [predictedPrices];
    const actual = actualPrices;

    if (predicted.length !== actual.length) {
      throw new Error('Predicted and actual prices arrays must have the same length');
    }

    const errors = [];
    const percentageErrors = [];
    const directionalCorrect = [];

    for (let i = 0; i < predicted.length; i++) {
      const predictedPrice = predicted[i];
      const actualPrice = actual[i];
      const basePrice = i === 0 ? currentPrice : actual[i - 1];

      // Absolute Error
      const absoluteError = Math.abs(predictedPrice - actualPrice);
      errors.push(absoluteError);

      // Percentage Error
      const percentageError = Math.abs((predictedPrice - actualPrice) / actualPrice) * 100;
      percentageErrors.push(percentageError);

      // Directional Accuracy (did it predict up/down correctly?)
      const predictedDirection = predictedPrice > basePrice ? 'up' : 'down';
      const actualDirection = actualPrice > basePrice ? 'up' : 'down';
      directionalCorrect.push(predictedDirection === actualDirection);
    }

    // Calculate averages
    const mae = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    const mape = percentageErrors.reduce((sum, err) => sum + err, 0) / percentageErrors.length;
    
    // RMSE (Root Mean Squared Error)
    const mse = errors.reduce((sum, err) => sum + err * err, 0) / errors.length;
    const rmse = Math.sqrt(mse);

    // Directional Accuracy
    const directionalAccuracy = directionalCorrect.filter(Boolean).length / directionalCorrect.length;

    return {
      absoluteErrors: errors,
      percentageErrors: percentageErrors,
      mae: Number(mae.toFixed(4)),
      mape: Number(mape.toFixed(2)),
      rmse: Number(rmse.toFixed(4)),
      directionalAccuracy: Number(directionalAccuracy.toFixed(4)),
      directionalCorrect: directionalCorrect,
    };
  }

  /**
   * Run multiple backtests for a date range
   * @param {string} asset - Asset symbol
   * @param {Date} startDate - Start date for backtesting
   * @param {Date} endDate - End date for backtesting
   * @param {number} stepDays - Days between each test (default: 7)
   * @param {number} daysToPredict - Days to predict for each test (default: 1)
   * @returns {Promise<Object>} Aggregated backtest results
   */
  async runMultipleBacktests(asset, startDate, endDate, stepDays = 7, daysToPredict = 1) {
    try {
      const results = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        try {
          const result = await this.runBacktest(asset, new Date(currentDate), daysToPredict);
          results.push(result);
          
          // Wait a bit to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Backtest failed for ${currentDate.toISOString().split('T')[0]}:`, error.message);
        }

        currentDate.setDate(currentDate.getDate() + stepDays);
      }

      // Calculate aggregate metrics
      const aggregateMetrics = this.calculateAggregateMetrics(results);

      return {
        asset,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
        stepDays,
        daysToPredict,
        totalTests: results.length,
        results,
        aggregateMetrics,
      };
    } catch (error) {
      console.error(`Multiple backtests failed for ${asset}:`, error);
      throw error;
    }
  }

  /**
   * Calculate aggregate metrics from multiple backtest results
   * @param {Array} results - Array of backtest results
   * @returns {Object} Aggregate metrics
   */
  calculateAggregateMetrics(results) {
    if (results.length === 0) {
      return {
        averageMAE: 0,
        averageMAPE: 0,
        averageRMSE: 0,
        averageDirectionalAccuracy: 0,
      };
    }

    const totalMAE = results.reduce((sum, r) => sum + (r.metrics?.mae || 0), 0);
    const totalMAPE = results.reduce((sum, r) => sum + (r.metrics?.mape || 0), 0);
    const totalRMSE = results.reduce((sum, r) => sum + (r.metrics?.rmse || 0), 0);
    const totalDirAcc = results.reduce((sum, r) => sum + (r.metrics?.directionalAccuracy || 0), 0);

    return {
      averageMAE: Number((totalMAE / results.length).toFixed(4)),
      averageMAPE: Number((totalMAPE / results.length).toFixed(2)),
      averageRMSE: Number((totalRMSE / results.length).toFixed(4)),
      averageDirectionalAccuracy: Number((totalDirAcc / results.length).toFixed(4)),
    };
  }
}

export default new BacktestingService();

