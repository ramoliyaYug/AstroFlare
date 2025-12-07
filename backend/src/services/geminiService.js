/**
 * Gemini API Service
 * Handles interaction with Google Gemini API for price predictions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import technicalIndicators from './technicalIndicators.js';

dotenv.config();

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
    }
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.model = null;
    this.initializeModel();
  }

  async initializeModel() {
    if (!this.genAI) {
      console.warn('⚠️  Gemini API not initialized - API key missing');
      return;
    }
    try {
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      console.log('✅ Gemini API initialized');
    } catch (error) {
      console.error('❌ Error initializing Gemini API:', error);
    }
  }

  /**
   * Generate price prediction using Gemini API
   * @param {Object} formattedData - Formatted data from dataAggregator
   * @returns {Promise<Object>} Prediction results
   */
  async generatePrediction(formattedData) {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please set GEMINI_API_KEY in environment variables.');
    }

    try {
      const { asset, dataPoints, currentPrice, timeRange, technicalIndicators: indicators, priceChange24h } = formattedData;

      // Prepare prompt for Gemini with technical indicators
      const prompt = this.createPredictionPrompt(asset, dataPoints, currentPrice, timeRange, indicators, priceChange24h);

      // Generate prediction
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse prediction from response
      const prediction = this.parsePrediction(text, asset, currentPrice, indicators, priceChange24h);

      return {
        asset,
        timestamp: Date.now(),
        currentPrice,
        prediction,
        confidence: prediction.confidence || prediction.overallConfidence || 'medium',
        rawResponse: text,
        dataPointsUsed: dataPoints.length,
        technicalIndicators: indicators,
        priceChange24h,
      };
    } catch (error) {
      console.error('Error generating prediction:', error);
      throw error;
    }
  }

  /**
   * Create prediction prompt for Gemini with technical indicators
   */
  createPredictionPrompt(asset, dataPoints, currentPrice, timeRange, indicators, priceChange24h) {
    const recentPrices = dataPoints.slice(-50).map((dp) => dp.price).filter(Boolean);
    const sma7 = indicators?.sma7;
    const sma30 = indicators?.sma30;
    const ema12 = indicators?.ema12;
    const rsi = indicators?.rsi;
    const volatility = indicators?.volatility;
    const trend = indicators?.trend;

    return `You are an expert cryptocurrency technical analyst. Analyze the following ${asset} price data with technical indicators and provide a comprehensive prediction.

**CURRENT MARKET DATA:**
- Current Price: $${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- 24h Price Change: ${priceChange24h ? priceChange24h.toFixed(2) : '0.00'}%
- Data Range: ${timeRange.start ? new Date(timeRange.start).toLocaleDateString() : 'N/A'} to ${timeRange.end ? new Date(timeRange.end).toLocaleDateString() : 'N/A'}
- Total Data Points: ${dataPoints.length}

**TECHNICAL INDICATORS:**
${sma7 ? `- 7-Day SMA: $${sma7.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '- 7-Day SMA: N/A'}
${sma30 ? `- 30-Day SMA: $${sma30.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '- 30-Day SMA: N/A'}
${ema12 ? `- 12-Day EMA: $${ema12.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '- 12-Day EMA: N/A'}
${rsi ? `- RSI (14): ${rsi.toFixed(2)}` : '- RSI: N/A'}
${volatility ? `- Volatility: ${volatility.toFixed(2)}%` : '- Volatility: N/A'}
${trend ? `- Trend Direction: ${trend.direction}, Strength: ${trend.strength?.toFixed(2) || '0.00'}%, Price Change: ${trend.priceChange?.toFixed(2) || '0.00'}%` : '- Trend: N/A'}

**PRICE HISTORY (Last 30 Days):**
${recentPrices.slice(-30).map((p, i) => {
  const date = dataPoints[dataPoints.length - 30 + i]?.date;
  const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Day ${i + 1}`;
  return `${dateStr}: $${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}).join('\n')}

**ANALYSIS REQUIREMENTS:**

Provide a comprehensive technical analysis and prediction in JSON format:

1. **PREDICTION SUMMARY:**
   - Overall direction (UP/DOWN/NEUTRAL)
   - Price target for 24h
   - Confidence percentage (0-100)
   - Risk level (LOW/MEDIUM/HIGH)
   - Timeframe (24h)

2. **DETAILED ANALYSIS:**
   - Write a comprehensive 3-4 paragraph analysis explaining:
     * Current market condition (contradictions, trends, patterns)
     * Relationship between current price and moving averages
     * RSI interpretation and momentum analysis
     * Trend strength and potential reversals
     * Market sentiment and likely scenarios
   - Be specific, technical, and professional

3. **KEY FACTORS:**
   - List 3-5 key technical factors driving the prediction
   - Each factor should be detailed and specific

**CRITICAL:**
- Base predictions on actual technical indicators provided
- Be specific about moving average relationships
- Analyze RSI in context of overbought/oversold conditions
- Consider trend strength and potential reversals
- Provide realistic price targets based on volatility

**RESPONSE FORMAT (Strict JSON only):**
{
  "direction": "UP|DOWN|NEUTRAL",
  "priceTarget": number,
  "confidence": number (0-100),
  "riskLevel": "LOW|MEDIUM|HIGH",
  "timeframe": "24h",
  "analysis": "Detailed 3-4 paragraph technical analysis explaining current market conditions, moving average relationships, RSI interpretation, trend strength, and likely scenarios",
  "keyFactors": [
    "Detailed factor 1 explaining technical indicator relationship",
    "Detailed factor 2 about price action",
    "Detailed factor 3 about momentum/trend",
    "Detailed factor 4 about market conditions"
  ]
}`;
  }

  /**
   * Parse prediction from Gemini response
   */
  parsePrediction(responseText, asset, currentPrice, indicators, priceChange24h) {
    try {
      // Try to extract JSON from response
      let jsonText = responseText;
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Enhance with technical indicators
          return {
            direction: parsed.direction || 'NEUTRAL',
            priceTarget: parsed.priceTarget || currentPrice,
            confidence: parsed.confidence || 65,
            riskLevel: parsed.riskLevel || (indicators?.volatility > 20 ? 'HIGH' : indicators?.volatility > 10 ? 'MEDIUM' : 'LOW'),
            timeframe: parsed.timeframe || '24h',
            analysis: parsed.analysis || this.generateFallbackAnalysis(indicators, currentPrice, priceChange24h),
            keyFactors: parsed.keyFactors || this.generateFallbackFactors(indicators, currentPrice),
            technicalIndicators: {
              sma7: indicators?.sma7,
              sma30: indicators?.sma30,
              ema12: indicators?.ema12,
              rsi: indicators?.rsi,
              volatility: indicators?.volatility,
              trend: indicators?.trend,
            },
          };
        } catch (parseError) {
          console.warn('JSON parse error:', parseError);
        }
      }
      
      // Fallback if JSON parsing fails
      return this.generateFallbackPrediction(currentPrice, indicators, priceChange24h);
    } catch (error) {
      console.error('Error parsing prediction:', error);
      return this.generateFallbackPrediction(currentPrice, indicators, priceChange24h);
    }
  }

  generateFallbackPrediction(currentPrice, indicators, priceChange24h) {
    const rsi = indicators?.rsi || 50;
    const volatility = indicators?.volatility || 15;
    const trend = indicators?.trend;
    
    let direction = 'NEUTRAL';
    if (rsi > 60 || (trend && trend.direction === 'uptrend')) direction = 'UP';
    else if (rsi < 40 || (trend && trend.direction === 'downtrend')) direction = 'DOWN';
    
    return {
      direction,
      priceTarget: currentPrice * (1 + (priceChange24h || 0) / 100),
      confidence: 65,
      riskLevel: volatility > 20 ? 'HIGH' : volatility > 10 ? 'MEDIUM' : 'LOW',
      timeframe: '24h',
      analysis: this.generateFallbackAnalysis(indicators, currentPrice, priceChange24h),
      keyFactors: this.generateFallbackFactors(indicators, currentPrice),
      technicalIndicators: indicators,
    };
  }

  generateFallbackAnalysis(indicators, currentPrice, priceChange24h) {
    const sma7 = indicators?.sma7;
    const sma30 = indicators?.sma30;
    const ema12 = indicators?.ema12;
    const rsi = indicators?.rsi || 50;
    const trend = indicators?.trend;
    
    let analysis = `The ${indicators?.volatility ? 'market shows' : 'current market analysis indicates'} `;
    
    if (sma7 && sma30) {
      if (currentPrice > sma7 && sma7 > sma30) {
        analysis += `a bullish structure with current price above both short-term and long-term moving averages. `;
      } else if (currentPrice < sma7 && sma7 < sma30) {
        analysis += `a bearish structure with current price below moving averages. `;
      } else {
        analysis += `a mixed structure indicating potential consolidation. `;
      }
    }
    
    analysis += `RSI at ${rsi.toFixed(2)} suggests ${rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'} conditions. `;
    
    if (trend) {
      analysis += `The ${trend.direction} shows ${trend.strength?.toFixed(2) || 0}% strength, `;
      analysis += trend.strength < 50 ? 'making it vulnerable to reversals. ' : 'indicating a strong trend. ';
    }
    
    analysis += `Market conditions suggest ${priceChange24h > 0 ? 'continued upward momentum' : priceChange24h < 0 ? 'potential downward pressure' : 'consolidation'} in the near term.`;
    
    return analysis;
  }

  generateFallbackFactors(indicators, currentPrice) {
    const factors = [];
    const sma7 = indicators?.sma7;
    const sma30 = indicators?.sma30;
    const ema12 = indicators?.ema12;
    const rsi = indicators?.rsi;
    
    if (sma7 && sma30) {
      if (currentPrice > sma7 && sma7 > sma30) {
        factors.push(`Current price is above 7-Day SMA ($${sma7.toFixed(2)}) and 30-Day SMA ($${sma30.toFixed(2)}), indicating bullish alignment.`);
      } else if (currentPrice < sma7 && sma7 < sma30) {
        factors.push(`Current price is below 7-Day SMA ($${sma7.toFixed(2)}) and 30-Day SMA ($${sma30.toFixed(2)}), indicating bearish structure.`);
      } else {
        factors.push(`Mixed moving average alignment suggests potential trend reversal or consolidation phase.`);
      }
    }
    
    if (rsi) {
      factors.push(`RSI at ${rsi.toFixed(2)} indicates ${rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'} momentum conditions.`);
    }
    
    if (indicators?.trend) {
      factors.push(`Trend direction is ${indicators.trend.direction} with ${indicators.trend.strength?.toFixed(2) || 0}% strength, ${indicators.trend.strength < 50 ? 'making it susceptible to counter-trend moves' : 'indicating strong directional bias'}.`);
    }
    
    if (indicators?.volatility) {
      factors.push(`Volatility at ${indicators.volatility.toFixed(2)}% suggests ${indicators.volatility > 20 ? 'high risk' : indicators.volatility > 10 ? 'moderate risk' : 'lower risk'} trading conditions.`);
    }
    
    return factors;
  }
}

export default new GeminiService();
