import React from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Coins, Sparkles } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import './AssetSelector.css';

const AssetSelector = ({ selectedAsset, onAssetChange, livePrices }) => {
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', icon: Bitcoin, color: '#f59e0b' },
    { symbol: 'ETH', name: 'Ethereum', icon: Coins, color: '#627eea' },
    { symbol: 'FLR', name: 'Flare', icon: Sparkles, color: '#f093fb' },
  ];

  const getAssetPrice = (asset) => {
    if (!livePrices?.prices?.[asset]) return null;
    return livePrices.prices[asset].price;
  };

  const formatPrice = (price) => {
    if (!price) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getPriceChange = (asset) => {
    // Calculate 24h change if available
    return null;
  };

  return (
    <GlassCard className="asset-selector-premium" glow>
      <div className="asset-selector-header">
        <h2 className="section-title">Select Asset</h2>
        <p className="section-subtitle">Choose a cryptocurrency to view predictions</p>
      </div>
      
      <div className="asset-grid">
        {assets.map((asset, index) => {
          const Icon = asset.icon;
          const isActive = selectedAsset === asset.symbol;
          const price = getAssetPrice(asset.symbol);
          
          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                className={`asset-card-premium ${isActive ? 'active' : ''}`}
                onClick={() => onAssetChange(asset.symbol)}
                style={{ '--asset-color': asset.color }}
              >
                <div className="asset-card-glow"></div>
                
                <div className="asset-card-content">
                  <div className="asset-icon-wrapper">
                    <Icon size={32} className="asset-icon" />
                  </div>
                  
                  <div className="asset-info-premium">
                    <div className="asset-symbol-premium">{asset.symbol}</div>
                    <div className="asset-name-premium">{asset.name}</div>
                  </div>
                  
                  <div className="asset-price-premium">
                    {price ? (
                      <>
                        <div className="price-value">{formatPrice(price)}</div>
                        <div className="price-label">Current</div>
                      </>
                    ) : (
                      <div className="price-loading">Loading...</div>
                    )}
                  </div>
                  
                  {isActive && (
                    <motion.div
                      className="active-indicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <div className="active-pulse"></div>
                    </motion.div>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default AssetSelector;
