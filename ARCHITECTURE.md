# Architecture Documentation

## System Overview

The Vijeta application is a Web3 cryptocurrency price prediction platform that leverages Flare Network's data infrastructure and Google's Gemini AI for intelligent price forecasting.

## Architecture Layers

### 1. Data Collection Layer

#### FTSO (Flare Time Series Oracle) Service
- **Purpose**: Fetches live and real-time price data
- **Implementation**: `backend/src/services/ftsoService.js`
- **Features**:
  - Live price feeds for BTC/USD, ETH/USD, FLR/USD
  - Batch price fetching
  - Price formatting and normalization
- **Data Source**: Flare Network FTSO v2 contracts

#### FAssets Service
- **Purpose**: Retrieves latest week of aggregated historical data
- **Implementation**: `backend/src/services/fassetsService.js`
- **Features**:
  - Week-long price history
  - Aggregated data points
  - Volume and price metrics
- **Status**: Structure ready, integration pending

#### FDC (Flare Data Connector) Service
- **Purpose**: Provides historical tracking and additional data sources
- **Implementation**: `backend/src/services/fdcService.js`
- **Features**:
  - 30-day historical data
  - Live tracking metrics
  - Extended data points
- **Status**: Structure ready, integration pending

### 2. Data Processing Layer

#### Data Aggregator
- **Purpose**: Combines data from all sources
- **Implementation**: `backend/src/services/dataAggregator.js`
- **Features**:
  - Multi-source data aggregation
  - Data normalization
  - Format conversion for AI consumption
  - Summary statistics generation

### 3. Prediction Layer

#### Gemini AI Service
- **Purpose**: Generates price predictions using AI
- **Implementation**: `backend/src/services/geminiService.js`
- **Features**:
  - Short-term predictions (24 hours)
  - Medium-term predictions (7 days)
  - Trend analysis
  - Confidence scoring
  - Risk assessment

### 4. API Layer

#### REST API Endpoints
- **Base URL**: `http://localhost:3001/api`
- **Endpoints**:
  - `GET /prices/live` - All live prices
  - `GET /prices/live/:asset` - Specific asset price
  - `GET /prices/week/:asset` - Week data
  - `GET /prices/historical/:asset` - Historical data
  - `GET /prices/aggregated/:asset` - All data sources
  - `GET /predictions/:asset` - AI prediction
  - `GET /predictions` - All predictions

### 5. Frontend Layer

#### React Application
- **Framework**: React 18
- **Charts**: Chart.js with react-chartjs-2
- **Components**:
  - `AssetSelector` - Asset selection UI
  - `PriceDashboard` - Price charts and metrics
  - `PredictionCard` - AI prediction display

## Data Flow

```
┌─────────────┐
│  Flare FTSO │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌──────────────┐    ┌─────────────┐
│   FAssets   │──┼───▶│ Data         │───▶│   Gemini    │
└─────────────┘  │    │ Aggregator   │    │     AI      │
                 │    └──────────────┘    └─────────────┘
┌─────────────┐  │           │                    │
│     FDC     │──┘           │                    │
└─────────────┘              ▼                    ▼
                      ┌──────────────┐    ┌─────────────┐
                      │   Backend    │    │  Prediction │
                      │     API      │    │   Results   │
                      └──────────────┘    └─────────────┘
                              │                    │
                              └────────┬───────────┘
                                       ▼
                              ┌──────────────┐
                              │   Frontend   │
                              │   React App  │
                              └──────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Blockchain**: ethers.js v6
- **AI**: Google Generative AI SDK
- **Data Sources**: Flare Periphery Contracts

### Frontend
- **Framework**: React 18
- **Charts**: Chart.js 4.4
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern gradients

### Smart Contracts
- **Language**: Solidity 0.8.19
- **EVM Version**: Cancun
- **Network**: Flare Network (Coston2 testnet / Mainnet)

## Configuration

### Environment Variables

#### Backend
```env
RPC_URL=https://coston2-api.flare.network/ext/C/rpc
FTSOV2_ADDRESS=0x3d893C53D9e8056135C26C8c638B76C8b60Df726
GEMINI_API_KEY=your_key_here
PORT=3001
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:3001
```

## Future Enhancements

1. **Historical Data Integration**
   - Complete FAssets week data fetching
   - Complete FDC historical data integration
   - Blockchain event querying for historical prices

2. **Enhanced Predictions**
   - Multiple AI model support
   - Ensemble predictions
   - Confidence intervals
   - Risk scoring

3. **Real-time Updates**
   - WebSocket support for live price updates
   - Push notifications for price alerts
   - Real-time prediction updates

4. **Additional Features**
   - Portfolio tracking
   - Price alerts
   - Historical prediction accuracy tracking
   - Multi-asset comparison

## Security Considerations

1. **API Keys**: Store securely in environment variables
2. **Rate Limiting**: Implement for API endpoints
3. **Input Validation**: Validate all user inputs
4. **Error Handling**: Graceful error handling and logging
5. **CORS**: Configure appropriately for production

## Performance Optimization

1. **Caching**: Implement Redis for frequently accessed data
2. **Batch Requests**: Optimize FTSO queries
3. **Lazy Loading**: Frontend component lazy loading
4. **CDN**: Static asset delivery via CDN

## Deployment

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Smart Contracts
```bash
cd contracts
npx hardhat compile
npx hardhat deploy --network coston2
```

