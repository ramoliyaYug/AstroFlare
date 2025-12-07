# Web3 Cryptocurrency Price Prediction App

A comprehensive application that uses Flare Network's FAssets, FTSO (Flare Time Series Oracle), and FDC (Flare Data Connector) to collect cryptocurrency price data, then leverages Google's Gemini API to predict future price movements.

## Architecture Overview

### Data Collection Layer
- **FAssets**: Fetches latest week of cryptocurrency data
- **FTSO (Flare Time Series Oracle)**: Retrieves historical data (month-old) and live price feeds
- **FDC (Flare Data Connector)**: Additional data source for historical and live tracking

### Data Processing Layer
- Aggregates data from all sources
- Formats time series data for ML/AI consumption
- Handles data normalization and cleaning

### Prediction Layer
- **Gemini API**: Processes historical and live data to generate price predictions
- Analyzes trends and patterns to forecast future price movements

### Application Layer
- **Backend**: Node.js/Express API server
- **Frontend**: React-based UI for visualization
- **Smart Contracts**: Solidity contracts for on-chain FTSO data consumption

## Project Structure

```
vijeta/
├── backend/              # Node.js backend API
│   ├── src/
│   │   ├── services/     # Data collection services
│   │   ├── controllers/ # API controllers
│   │   ├── models/       # Data models
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/         # Utilities
│   └── package.json
├── contracts/            # Solidity smart contracts
│   └── FtsoV2Consumer.sol
└── README.md
```

## Features

1. **Multi-Source Data Collection**
   - Latest week data from FAssets
   - Historical month data from FTSO/FDC
   - Real-time live data from FTSO

2. **AI-Powered Predictions**
   - Uses Gemini API for price trend analysis
   - Provides short-term and medium-term forecasts
   - Visualizes predictions with historical data

3. **Supported Cryptocurrencies**
   - Bitcoin (BTC/USD)
   - Ethereum (ETH/USD)
   - Flare (FLR/USD)
   - Extensible to other assets

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Setup

1. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your GEMINI_API_KEY
   npm run dev
   ```

2. **Frontend** (new terminal):
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm start
   ```

3. **Access**: Open `http://localhost:3000` in your browser

## Environment Variables

### Backend (.env)
```
RPC_URL=https://coston2-api.flare.network/ext/C/rpc
FTSOV2_ADDRESS=0x3d893C53D9e8056135C26C8c638B76C8b60Df726
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

## API Endpoints

- `GET /api/prices/live` - Get live prices for all supported assets
- `GET /api/prices/historical/:asset` - Get historical data for an asset
- `GET /api/predictions/:asset` - Get price predictions for an asset
- `GET /api/prices/week/:asset` - Get latest week data for an asset

## Technology Stack

- **Backend**: Node.js, Express, ethers.js
- **Frontend**: React, Chart.js, Axios
- **Blockchain**: Flare Network, Solidity
- **AI/ML**: Google Gemini API
- **Data Sources**: FTSO, FAssets, FDC

## License

MIT

