import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import './App.css';
import PriceDashboard from './components/PriceDashboard';
import PredictionCard from './components/PredictionCard';
import AssetSelector from './components/AssetSelector';
import BacktestingPanel from './components/BacktestingPanel';
import { apiService } from './services/apiService';

function App() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [livePrices, setLivePrices] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPrediction();
  }, [selectedAsset]);

  const fetchLivePrices = async () => {
    try {
      const data = await apiService.getLivePrices();
      setLivePrices(data);
    } catch (err) {
      console.error('Error fetching live prices:', err);
    }
  };

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPrediction(selectedAsset);
      setPrediction(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Animated Background Elements */}
      <div className="app-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Header */}
      <motion.header 
        className="App-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <motion.div 
            className="logo-section"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Sparkles className="logo-icon" size={32} />
            <h1 className="app-title">
              <span className="title-gradient">AstroFlare</span>
            </h1>
          </motion.div>
          <p className="app-subtitle">
            Premium Crypto Predictions Powered by Flare Network & Gemini AI
          </p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="App-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAsset}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <AssetSelector
              selectedAsset={selectedAsset}
              onAssetChange={setSelectedAsset}
              livePrices={livePrices}
            />

            <div className="dashboard-grid">
              <PriceDashboard
                asset={selectedAsset}
                livePrices={livePrices}
              />

              <PredictionCard
                asset={selectedAsset}
                prediction={prediction}
                loading={loading}
                error={error}
                onRefresh={fetchPrediction}
                livePrices={livePrices}
              />
            </div>

            {/* Backtesting Section */}
            <BacktestingPanel />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer 
        className="App-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <p>
          <span className="footer-highlight">Data sourced from Flare Network</span>
          <span className="footer-divider">•</span>
          <span>Predictions by Google Gemini AI</span>
        </p>
      </motion.footer>
    </div>
  );
}

export default App;
