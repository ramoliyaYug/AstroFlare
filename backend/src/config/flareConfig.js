/**
 * Flare Network Configuration
 * Contains addresses and feed IDs for FTSO v2
 */

export const FLARE_CONFIG = {
  RPC_URL: process.env.RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc',
  FTSOV2_ADDRESS: process.env.FTSOV2_ADDRESS || '0x3d893C53D9e8056135C26C8c638B76C8b60Df726',
  
  // Feed IDs for supported cryptocurrencies
  FEED_IDS: {
    FLR_USD: '0x01464c522f55534400000000000000000000000000', // FLR/USD
    BTC_USD: '0x014254432f55534400000000000000000000000000', // BTC/USD
    ETH_USD: '0x014554482f55534400000000000000000000000000', // ETH/USD
  },
  
  // Feed names mapping
  FEED_NAMES: {
    '0x01464c522f55534400000000000000000000000000': 'FLR/USD',
    '0x014254432f55534400000000000000000000000000': 'BTC/USD',
    '0x014554482f55534400000000000000000000000000': 'ETH/USD',
  },
  
  // Asset symbols
  ASSETS: ['BTC', 'ETH', 'FLR'],
  
  // Historical data settings
  HISTORICAL_DAYS: parseInt(process.env.HISTORICAL_DATA_DAYS) || 30,
  LIVE_UPDATE_INTERVAL: parseInt(process.env.LIVE_UPDATE_INTERVAL) || 60000, // 1 minute
};

