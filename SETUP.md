# Setup Guide

Complete setup instructions for the Vijeta cryptocurrency price prediction application.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Flare Network Access**: RPC endpoint (testnet or mainnet)

## Step 1: Clone and Navigate

```bash
cd /home/mastermind/Desktop/WEB3/vijeta
```

## Step 2: Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Flare Network Configuration
RPC_URL=https://coston2-api.flare.network/ext/C/rpc
FTSOV2_ADDRESS=0x3d893C53D9e8056135C26C8c638B76C8b60Df726

# Google Gemini API (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Start Backend Server

```bash
npm run dev
```

The backend will start on `http://localhost:3001`

## Step 3: Frontend Setup

### Install Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### Configure Environment

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:3001
```

### Start Frontend Development Server

```bash
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Step 4: Smart Contracts (Optional)

### Install Hardhat

```bash
cd contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

### Compile Contracts

```bash
npx hardhat compile
```

### Deploy Contracts (Optional)

Create a deployment script and deploy to Flare Network:

```bash
npx hardhat deploy --network coston2
```

## Step 5: Verify Installation

### Test Backend API

```bash
# Health check
curl http://localhost:3001/api/health

# Get live prices
curl http://localhost:3001/api/prices/live

# Get prediction for BTC
curl http://localhost:3001/api/predictions/BTC
```

### Test Frontend

1. Open `http://localhost:3000` in your browser
2. Select an asset (BTC, ETH, or FLR)
3. View live prices and AI predictions

## Troubleshooting

### Backend Issues

**Error: GEMINI_API_KEY not found**
- Make sure `.env` file exists in `backend` directory
- Verify the API key is correctly set
- Restart the server after changing `.env`

**Error: Cannot connect to Flare RPC**
- Check your internet connection
- Verify the RPC URL is correct
- Try using a different RPC endpoint

**Error: Module not found**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

### Frontend Issues

**Error: Cannot connect to API**
- Verify backend is running on port 3001
- Check `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings in backend

**Error: Charts not displaying**
- Check browser console for errors
- Verify Chart.js is installed correctly

### Smart Contract Issues

**Error: EVM version mismatch**
- Ensure Hardhat config has `evmVersion: "cancun"`
- Check Solidity version compatibility

**Error: Import not found**
- Install Flare Periphery Contracts:
  ```bash
  npm install @flarenetwork/flare-periphery-contracts
  ```

## Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name vijeta-backend
   ```

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `build` folder to a static hosting service (Vercel, Netlify, etc.)

### Environment Variables for Production

- Use secure environment variable management
- Never commit `.env` files to version control
- Use different API keys for production
- Configure proper CORS origins

## Next Steps

1. **Get Gemini API Key**: Sign up at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Test FTSO Integration**: Verify live price feeds are working
3. **Complete FAssets/FDC Integration**: Implement actual data fetching (currently using placeholders)
4. **Add More Assets**: Extend support for additional cryptocurrencies
5. **Enhance Predictions**: Fine-tune Gemini prompts for better accuracy

## Support

For issues or questions:
- Check the [Architecture Documentation](./ARCHITECTURE.md)
- Review [Flare Network Documentation](https://dev.flare.network)
- Check [Gemini API Documentation](https://ai.google.dev/docs)

