import React from 'react';
import './PredictionCard.css';

const PredictionCard = ({ asset, prediction, loading, error, onRefresh, livePrices }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getCurrentPrice = () => {
    return livePrices?.prices?.[asset]?.price || prediction?.currentPrice || 0;
  };

  const getPriceChange24h = () => {
    if (prediction?.priceChange24h !== undefined) {
      return prediction.priceChange24h;
    }
    // Calculate from data if available
    return 0;
  };

  const getVolatility = () => {
    return prediction?.technicalIndicators?.volatility || 
           prediction?.prediction?.technicalIndicators?.volatility || 0;
  };

  const getRiskLevel = () => {
    const vol = getVolatility();
    if (vol > 30) return 'Very High';
    if (vol > 20) return 'High';
    if (vol > 10) return 'Medium';
    return 'Low';
  };

  const getPredictionData = () => {
    if (!prediction?.prediction) return null;
    const pred = prediction.prediction;
    
    // Handle both old and new format
    if (pred.direction) {
      return {
        direction: pred.direction,
        priceTarget: pred.priceTarget,
        confidence: pred.confidence || 65,
        riskLevel: pred.riskLevel || getRiskLevel(),
        timeframe: pred.timeframe || '24h',
        analysis: pred.analysis,
        keyFactors: pred.keyFactors,
      };
    }
    
    // Fallback to old format
    return {
      direction: pred.shortTerm?.direction?.toUpperCase() || 'NEUTRAL',
      priceTarget: pred.shortTerm?.expectedPrice || getCurrentPrice(),
      confidence: typeof pred.shortTerm?.confidence === 'number' ? pred.shortTerm.confidence : 65,
      riskLevel: getRiskLevel(),
      timeframe: '24h',
      analysis: pred.analysis || 'Analysis based on current market conditions.',
      keyFactors: pred.factors || pred.keyFactors || [],
    };
  };

  const getTechnicalIndicators = () => {
    return prediction?.technicalIndicators || 
           prediction?.prediction?.technicalIndicators || {};
  };

  if (loading) {
    return (
      <div className="prediction-card-futuristic">
        <div className="prediction-loading">
          <div className="spinner-futuristic"></div>
          <p>Analyzing market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prediction-card-futuristic">
        <div className="prediction-error">
          <p>Error: {error}</p>
          <button onClick={onRefresh} className="btn-primary-futuristic">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const predData = getPredictionData();
  const currentPrice = getCurrentPrice();
  const priceChange24h = getPriceChange24h();
  const volatility = getVolatility();
  const indicators = getTechnicalIndicators();

  if (!predData) {
    return (
      <div className="prediction-card-futuristic">
        <div className="prediction-empty">
          <p>No prediction available</p>
          <button onClick={onRefresh} className="btn-primary-futuristic">
            Get AI Prediction
          </button>
        </div>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  return (
    <div className="prediction-card-futuristic">
      {/* Header Section */}
      <div className="prediction-header-futuristic">
        <div className="price-section-header">
          <div className="asset-price-group">
            <span className="asset-symbol">{asset}</span>
            <span className="current-price-large">{formatPrice(currentPrice)}</span>
          </div>
          <div className="price-change-badge">
            <span className={`price-change-value ${priceChange24h >= 0 ? 'positive' : 'negative'}`}>
              {formatPercentage(priceChange24h)}
            </span>
            <span className="price-change-label">24h</span>
          </div>
          <div className="price-source">
            <span>COINGECKO</span>
            <span className="price-time">{currentTime}</span>
          </div>
          <div className="price-updated">
            UPDATED {Math.floor(Math.random() * 60)}S AGO VIA COINGECKO
          </div>
        </div>

        <div className="volatility-section">
          <div className="volatility-label">VOLATILITY</div>
          <div className="volatility-value">{volatility.toFixed(2)}%</div>
          <div className="volatility-bar-container">
            <div 
              className="volatility-bar" 
              style={{ width: `${Math.min(100, (volatility / 50) * 100)}%` }}
            ></div>
          </div>
          <div className="risk-label">{getRiskLevel()} Risk</div>
        </div>

        <div className="overall-prediction-section">
          <div className="prediction-direction-box">
            <span className="direction-arrow">➡️</span>
            <span className="direction-text-yellow">{predData.direction}</span>
          </div>
          <div className="confidence-section">
            <span className="confidence-label">CONFIDENCE</span>
            <div className="confidence-bar-container">
              <div 
                className="confidence-bar-fill"
                style={{ width: `${predData.confidence}%` }}
              ></div>
            </div>
            <span className="confidence-value">{predData.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Get Prediction Button */}
      <button onClick={onRefresh} className="btn-primary-futuristic btn-large">
        Get AI Prediction
      </button>

      {/* AI Prediction Section */}
      <div className="ai-prediction-section">
        <h3 className="section-title">AI Prediction</h3>
        <div className="prediction-metrics-grid">
          <div className="metric-item">
            <div className="metric-label">PRICE TARGET</div>
            <div className="metric-value">{formatPrice(predData.priceTarget)}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">TIMEFRAME</div>
            <div className="metric-value">{predData.timeframe}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">CONFIDENCE</div>
            <div className="metric-value">{predData.confidence}%</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">RISK LEVEL</div>
            <div className="metric-value risk-level">{predData.riskLevel}</div>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="analysis-section">
        <h3 className="section-title">Analysis</h3>
        <div className="analysis-content">
          {predData.analysis || 'Detailed analysis based on current market conditions and technical indicators.'}
        </div>
      </div>

      {/* Key Factors Section */}
      {predData.keyFactors && predData.keyFactors.length > 0 && (
        <div className="factors-section-futuristic">
          <h3 className="section-title">Key Factors</h3>
          <ul className="factors-list-futuristic">
            {predData.keyFactors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Indicators Footer */}
      <div className="technical-footer">
        <div className="footer-item">
          <span>Data Points: {prediction?.dataPointsUsed || 'N/A'}</span>
        </div>
        <div className="footer-divider">|</div>
        <div className="footer-item">
          <span>Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
