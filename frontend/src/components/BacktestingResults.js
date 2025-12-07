import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import GlassCard from './ui/GlassCard';
import StatCard from './ui/StatCard';
import Chip from './ui/Chip';
import './BacktestingResults.css';

const BacktestingResults = ({ results }) => {
  if (!results) return null;

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    return `${Number(value).toFixed(2)}%`;
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.7) return 'success';
    if (accuracy >= 0.5) return 'warning';
    return 'error';
  };

  const getDirectionIcon = (direction) => {
    if (!direction) return <AlertCircle size={24} />;
    if (direction.toUpperCase() === 'UP') return <TrendingUp size={24} />;
    if (direction.toUpperCase() === 'DOWN') return <TrendingDown size={24} />;
    return <AlertCircle size={24} />;
  };

  const metrics = results.metrics || {};
  const prediction = results.prediction || {};
  const actualPrices = results.actualPrices || [];

  return (
    <div className="backtesting-results">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="results-header"
      >
        <h3 className="results-title">Backtest Results</h3>
        <div className="results-meta">
          <Chip variant="info">{String(results.asset || 'N/A')}</Chip>
          <Chip>{String(results.testDate || 'N/A')}</Chip>
          <Chip>{String(results.daysToPredict || 0)} day(s)</Chip>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <StatCard
          label="Directional Accuracy"
          value={`${((metrics.directionalAccuracy || 0) * 100).toFixed(1)}%`}
          icon={getDirectionIcon(prediction.direction)}
          trend={(metrics.directionalAccuracy || 0) >= 0.5 ? 'up' : 'down'}
          variant={getAccuracyColor(metrics.directionalAccuracy || 0)}
        />
        
        <StatCard
          label="Mean Absolute Error (MAE)"
          value={formatPrice(metrics.mae)}
          icon={<BarChart3 size={24} />}
        />
        
        <StatCard
          label="Root Mean Squared Error (RMSE)"
          value={formatPrice(metrics.rmse)}
          icon={<BarChart3 size={24} />}
        />
        
        <StatCard
          label="Mean Absolute % Error (MAPE)"
          value={formatPercentage(metrics.mape)}
          icon={<Percent size={24} />}
        />
      </div>

      {/* Prediction vs Actual */}
      <GlassCard className="comparison-card">
        <h4 className="comparison-title">Prediction vs Actual</h4>
        
        <div className="comparison-grid">
          <div className="comparison-item">
            <div className="comparison-label">Current Price</div>
            <div className="comparison-value">{formatPrice(results.currentPrice)}</div>
          </div>

          <div className="comparison-item predicted">
            <div className="comparison-label">
              <Target size={18} />
              Predicted Price
            </div>
            <div className="comparison-value">{formatPrice(results.predictedPrice)}</div>
            <div className="comparison-direction">
              <Chip variant={prediction.direction === 'UP' ? 'success' : prediction.direction === 'DOWN' ? 'error' : 'info'}>
                {String(prediction.direction || 'NEUTRAL')}
              </Chip>
              {prediction.confidence && (
                <span className="confidence-badge">{prediction.confidence}% confidence</span>
              )}
            </div>
          </div>

          {Array.isArray(actualPrices) && actualPrices.map((actual, index) => {
            if (!actual || typeof actual.price !== 'number') return null;
            const error = Math.abs((results.predictedPrice || 0) - actual.price);
            const percentageError = actual.price > 0 ? ((error / actual.price) * 100) : 0;
            const isCorrectDirection = Array.isArray(metrics.directionalCorrect) ? metrics.directionalCorrect[index] : false;

            return (
              <div key={index} className="comparison-item actual">
                <div className="comparison-label">
                  <DollarSign size={18} />
                  Actual Price ({actual.date})
                </div>
                <div className="comparison-value">{formatPrice(actual.price)}</div>
                <div className="comparison-stats">
                  <div className="stat-item">
                    <span className="stat-label">Error:</span>
                    <span className="stat-value">{formatPrice(error)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">% Error:</span>
                    <span className="stat-value">{formatPercentage(percentageError)}</span>
                  </div>
                  <div className="direction-check">
                    {isCorrectDirection ? (
                      <Chip variant="success" size="sm" icon={<CheckCircle size={14} />}>
                        Direction Correct
                      </Chip>
                    ) : (
                      <Chip variant="error" size="sm" icon={<XCircle size={14} />}>
                        Direction Wrong
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Detailed Metrics */}
      <GlassCard className="detailed-metrics">
        <h4 className="metrics-title">Detailed Metrics</h4>
        
        <div className="metrics-list">
          {Array.isArray(metrics.absoluteErrors) && metrics.absoluteErrors.map((error, index) => {
            const errorValue = typeof error === 'number' ? error : 0;
            return (
              <div key={index} className="metric-row">
                <div className="metric-label">Day {index + 1} Absolute Error</div>
                <div className="metric-value">{formatPrice(errorValue)}</div>
              </div>
            );
          })}
          
          {Array.isArray(metrics.percentageErrors) && metrics.percentageErrors.map((error, index) => {
            const errorValue = typeof error === 'number' ? error : 0;
            return (
              <div key={index} className="metric-row">
                <div className="metric-label">Day {index + 1} Percentage Error</div>
                <div className="metric-value">{formatPercentage(errorValue)}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Prediction Analysis */}
      {prediction.analysis && (
        <GlassCard className="prediction-analysis">
          <h4 className="analysis-title">AI Analysis</h4>
          <p className="analysis-text">{prediction.analysis}</p>
        </GlassCard>
      )}

      {/* Historical Data Range */}
      <div className="data-range-info">
        <small>
          Historical data used: {String(results.historicalDateRange?.start || 'N/A')} to {String(results.historicalDateRange?.end || 'N/A')}
          {' • '}
          {String(results.dataPointsUsed || 0)} data points
        </small>
      </div>
    </div>
  );
};

export default BacktestingResults;

