# 🔬 Gemini AI Backtesting System

## Overview

The backtesting system allows you to test how accurate Gemini AI's predictions are by comparing them against historical cryptocurrency price data. This helps measure the performance of the AI prediction model without training any models.

## Features

### ✅ What It Does

1. **Historical Data Fetching**: Fetches 30 days of historical data from CoinGecko before your test date
2. **AI Prediction**: Sends this data to Gemini AI to get a prediction
3. **Real Price Comparison**: Fetches actual prices for the predicted day(s)
4. **Accuracy Metrics**: Calculates comprehensive accuracy metrics

### 📊 Accuracy Metrics Calculated

- **Absolute Error**: Difference between predicted and actual price
- **Percentage Error**: Error as a percentage of actual price
- **MAE (Mean Absolute Error)**: Average of absolute errors
- **RMSE (Root Mean Squared Error)**: Measures prediction error magnitude
- **Directional Accuracy**: Whether the prediction correctly identified price direction (up/down)

## API Endpoints

### 1. Single Backtest

**POST** `/api/backtesting/test`

```json
{
  "asset": "BTC",
  "testDate": "2024-07-15",
  "daysToPredict": 1
}
```

**Response:**
```json
{
  "success": true,
  "asset": "BTC",
  "testDate": "2024-07-15",
  "currentPrice": 89566.99,
  "predictedPrice": 89800.00,
  "actualPrices": [
    {
      "date": "2024-07-16",
      "price": 89750.00
    }
  ],
  "metrics": {
    "mae": 50.00,
    "mape": 0.06,
    "rmse": 50.00,
    "directionalAccuracy": 1.0,
    "absoluteErrors": [50.00],
    "percentageErrors": [0.06]
  }
}
```

### 2. Multiple Backtests

**POST** `/api/backtesting/multiple`

```json
{
  "asset": "BTC",
  "startDate": "2024-01-01",
  "endDate": "2024-07-01",
  "stepDays": 7,
  "daysToPredict": 1
}
```

### 3. Validate Date

**GET** `/api/backtesting/validate?asset=BTC&testDate=2024-07-15`

## How It Works

### Step-by-Step Process

1. **Select Parameters**:
   - Asset (BTC, ETH, FLR)
   - Test Date (must be in the past)
   - Days to Predict (1-30)

2. **Data Collection**:
   - Fetches 30 days of historical data before test date from CoinGecko
   - Calculates technical indicators (SMA, EMA, RSI, volatility)

3. **AI Prediction**:
   - Formats data exactly like live predictions
   - Sends to Gemini AI
   - Gets prediction for next day(s)

4. **Comparison**:
   - Fetches actual prices for predicted dates
   - Compares predicted vs actual

5. **Metrics Calculation**:
   - Calculates all accuracy metrics
   - Determines directional accuracy

## Usage Examples

### Frontend Usage

```javascript
// Run a single backtest
const results = await apiService.runBacktest('BTC', '2024-07-15', 1);

// Run multiple backtests
const results = await apiService.runMultipleBacktests(
  'BTC',
  '2024-01-01',
  '2024-07-01',
  7, // Step every 7 days
  1  // Predict 1 day ahead
);
```

### Backend Usage

```javascript
import backtestingService from './services/backtestingService.js';

// Single backtest
const results = await backtestingService.runBacktest(
  'BTC',
  new Date('2024-07-15'),
  1
);

// Multiple backtests
const results = await backtestingService.runMultipleBacktests(
  'BTC',
  new Date('2024-01-01'),
  new Date('2024-07-01'),
  7, // Step days
  1  // Days to predict
);
```

## Metrics Explanation

### MAE (Mean Absolute Error)
- **Lower is better**
- Average of absolute differences between predicted and actual
- Example: If MAE is $50, predictions are off by $50 on average

### RMSE (Root Mean Squared Error)
- **Lower is better**
- Penalizes larger errors more heavily
- Example: If RMSE is $75, larger errors have more impact

### MAPE (Mean Absolute Percentage Error)
- **Lower is better**
- Error as percentage of actual price
- Example: 0.5% means predictions are off by 0.5% on average

### Directional Accuracy
- **Higher is better (0-1 scale)**
- Percentage of correct direction predictions
- Example: 0.75 means 75% of predictions correctly identified up/down

## Limitations

1. **CoinGecko Rate Limits**: Free tier has rate limits (10-50 calls/minute)
2. **Date Range**: Can only test dates with available historical data
3. **Single Prediction**: Currently compares one predicted price to actual (for multi-day predictions)
4. **No Model Training**: This only measures accuracy, doesn't improve the model

## Best Practices

1. **Start with Recent Dates**: Test dates closer to today first
2. **Multiple Tests**: Run multiple backtests to get average performance
3. **Different Time Periods**: Test across different market conditions
4. **Reasonable Expectations**: Crypto markets are highly volatile; 60-70% directional accuracy is good

## Troubleshooting

### "No historical data available"
- Date might be too early (before CoinGecko has data)
- CoinGecko API might be down
- Asset symbol might be incorrect

### "Test date must be in the past"
- Can't test future dates (we don't know actual prices yet)
- Ensure test date is before today

### "Failed to fetch CoinGecko data"
- Check internet connection
- CoinGecko API might be rate limited (wait a minute)
- Verify asset symbol is correct

## Future Enhancements

- [ ] Batch backtesting with progress tracking
- [ ] Export results to CSV/JSON
- [ ] Visual charts showing prediction accuracy over time
- [ ] Comparison with baseline models (random walk, moving average)
- [ ] Statistical significance testing

---

**Note**: This system is for measuring accuracy only. It does NOT train or improve the AI model. It simply tests how well Gemini's predictions match reality.

