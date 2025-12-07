import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestTube, Calendar, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import GradientButton from './ui/GradientButton';
import Chip from './ui/Chip';
import { apiService } from '../services/apiService';
import BacktestingResults from './BacktestingResults';
import './BacktestingPanel.css';

const BacktestingPanel = () => {
  const [asset, setAsset] = useState('BTC');
  const [testDate, setTestDate] = useState('');
  const [daysToPredict, setDaysToPredict] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Calculate max date (yesterday)
  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  // Calculate min date (30 days before max date)
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 60); // Allow 30 days before + buffer
    return date.toISOString().split('T')[0];
  };

  const validateDate = async (date) => {
    if (!date) {
      setValidationError(null);
      return;
    }

    try {
      const validation = await apiService.validateBacktest(asset, date);
      if (!validation.valid) {
        setValidationError(validation.error);
      } else {
        setValidationError(null);
      }
    } catch (err) {
      setValidationError('Unable to validate date');
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setTestDate(date);
    validateDate(date);
  };

  const handleRunBacktest = async () => {
    if (!testDate) {
      setError('Please select a test date');
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const backtestResults = await apiService.runBacktest(
        asset,
        testDate,
        daysToPredict
      );
      setResults(backtestResults);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to run backtest');
      console.error('Backtest error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="backtesting-panel" glow>
      <div className="backtesting-header">
        <div className="header-icon">
          <TestTube size={32} />
        </div>
        <div>
          <h2 className="section-title">AI Prediction Backtesting</h2>
          <p className="section-subtitle">
            Test Gemini AI predictions against historical data to measure accuracy
          </p>
        </div>
      </div>

      <div className="backtesting-form">
        <div className="form-group">
          <label htmlFor="asset-select">
            <TrendingUp size={18} />
            Asset
          </label>
          <select
            id="asset-select"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="form-select"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="FLR">Flare (FLR)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="test-date">
            <Calendar size={18} />
            Test Date (Past Date)
          </label>
          <input
            id="test-date"
            type="date"
            value={testDate}
            onChange={handleDateChange}
            min={getMinDate()}
            max={getMaxDate()}
            className="form-input"
          />
          <small className="form-hint">
            Select a date in the past. The system will use 30 days before this date for prediction.
          </small>
          {validationError && (
            <div className="validation-error">
              <AlertCircle size={16} />
              {validationError}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="days-predict">
            Days to Predict
          </label>
          <input
            id="days-predict"
            type="number"
            min="1"
            max="30"
            value={daysToPredict}
            onChange={(e) => setDaysToPredict(parseInt(e.target.value) || 1)}
            className="form-input"
          />
          <small className="form-hint">
            Number of days ahead to predict (1-30)
          </small>
        </div>

        <GradientButton
          onClick={handleRunBacktest}
          disabled={loading || !testDate || !!validationError}
          fullWidth
          size="lg"
          icon={loading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <TestTube size={20} />}
        >
          {loading ? 'Running Backtest...' : 'Run Backtest'}
        </GradientButton>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BacktestingResults results={results} />
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default BacktestingPanel;

