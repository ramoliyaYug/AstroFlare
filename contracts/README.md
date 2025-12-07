# Smart Contracts

This directory contains Solidity smart contracts for interacting with Flare Network's FTSO v2.

## Contracts

### FtsoV2Consumer.sol

A production-ready smart contract for consuming FTSO v2 price feeds. This contract:

- Queries live price feeds for BTC/USD, ETH/USD, and FLR/USD
- Supports fetching individual feed prices or all feeds at once
- Includes fee calculation functionality
- Emits events for price updates
- Uses production interfaces (not test interfaces)

## Compilation

### Using Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat compile
```

### Using Foundry

```bash
forge install
forge build
```

### Using Remix

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create a new file and paste the contract code
3. Set EVM version to **Cancun** in compiler settings
4. Compile the contract

## Deployment

### Prerequisites

- Flare Network RPC endpoint
- Account with FLR tokens for gas
- Contract registry address

### Deployment Steps

1. Set up your deployment script
2. Configure network settings
3. Deploy the contract
4. Verify the contract on Flare Explorer

## Usage

### Getting Prices

```solidity
// Get BTC/USD price
(uint256 value, int8 decimals, uint64 timestamp) = consumer.getBtcUsdPrice();

// Get all prices at once
(uint256[] memory values, int8[] memory decimals, uint64 timestamp) = 
    consumer.getFtsoV2CurrentFeedValues();
```

### Fee Calculation

```solidity
// Calculate fee for fetching feeds
bytes21[] memory feedIds = new bytes21[](3);
feedIds[0] = FLR_USD_ID;
feedIds[1] = BTC_USD_ID;
feedIds[2] = ETH_USD_ID;

uint256 fee = consumer.calculateFee(feedIds);
```

## Important Notes

- **EVM Version**: Must be set to **Cancun** for compatibility
- **Fees**: Some feed queries may require payment of fees
- **Production**: Uses `FtsoV2Interface`, not test interfaces
- **Gas Costs**: Consider gas optimization for frequent queries

## Network Addresses

### Flare Testnet (Coston2)
- FTSO v2: `0x3d893C53D9e8056135C26C8c638B76C8b60Df726`
- Contract Registry: Check Flare documentation

### Flare Mainnet
- Check [Flare Network Documentation](https://dev.flare.network) for mainnet addresses

