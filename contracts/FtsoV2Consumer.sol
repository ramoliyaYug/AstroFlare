// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {FtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/FtsoV2Interface.sol";
import {IFeeCalculator} from "@flarenetwork/flare-periphery-contracts/coston2/IFeeCalculator.sol";

/**
 * @title FtsoV2Consumer
 * @dev Smart contract for consuming FTSO v2 price feeds on Flare Network.
 *      Uses a low-level staticcall to fetch feed metadata so it compiles
 *      regardless of how FeedMetadata is declared in the installed interface.
 */
contract FtsoV2Consumer {
    // Feed IDs for supported cryptocurrencies
    bytes21 public constant FLR_USD_ID = 0x01464c522f55534400000000000000000000000000; // "FLR/USD"
    bytes21 public constant BTC_USD_ID = 0x014254432f55534400000000000000000000000000; // "BTC/USD"
    bytes21 public constant ETH_USD_ID = 0x014554482f55534400000000000000000000000000; // "ETH/USD"

    // List of all feeds
    bytes21[] public feedIds = [
        FLR_USD_ID,
        BTC_USD_ID,
        ETH_USD_ID
    ];

    // FTSO V2 contract interface instance
    FtsoV2Interface internal ftsoV2;

    // Events
    event PriceUpdated(bytes21 indexed feedId, uint256 value, int8 decimals, uint64 timestamp);
    event PricesUpdated(uint256[] values, int8[] decimals, uint64 timestamp);

    /**
     * @dev Constructor - Initialize FTSO V2 interface via the registry
     */
    constructor() {
        ftsoV2 = ContractRegistry.getFtsoV2();
    }

    // ------------------------------------------------------------------------
    // SINGLE FEED GETTERS
    // ------------------------------------------------------------------------

    function getFlrUsdPrice() external payable returns (
        uint256 value,
        int8 decimals,
        uint64 timestamp
    ) {
        (value, decimals, timestamp) = ftsoV2.getFeedById(FLR_USD_ID);
        emit PriceUpdated(FLR_USD_ID, value, decimals, timestamp);
        return (value, decimals, timestamp);
    }

    function getFlrUsdPriceWei() external payable returns (
        uint256 value,
        uint64 timestamp
    ) {
        (value, timestamp) = ftsoV2.getFeedByIdInWei(FLR_USD_ID);
        return (value, timestamp);
    }

    function getBtcUsdPrice() external payable returns (
        uint256 value,
        int8 decimals,
        uint64 timestamp
    ) {
        (value, decimals, timestamp) = ftsoV2.getFeedById(BTC_USD_ID);
        emit PriceUpdated(BTC_USD_ID, value, decimals, timestamp);
        return (value, decimals, timestamp);
    }

    function getEthUsdPrice() external payable returns (
        uint256 value,
        int8 decimals,
        uint64 timestamp
    ) {
        (value, decimals, timestamp) = ftsoV2.getFeedById(ETH_USD_ID);
        emit PriceUpdated(ETH_USD_ID, value, decimals, timestamp);
        return (value, decimals, timestamp);
    }

    // ------------------------------------------------------------------------
    // MULTI-FEED GETTERS
    // ------------------------------------------------------------------------

    function getFtsoV2CurrentFeedValues() external payable returns (
        uint256[] memory values,
        int8[] memory decimals,
        uint64 timestamp
    ) {
        (values, decimals, timestamp) = ftsoV2.getFeedsById(feedIds);
        emit PricesUpdated(values, decimals, timestamp);
        return (values, decimals, timestamp);
    }

    function getFtsoV2CurrentFeedValuesInWei() external payable returns (
        uint256[] memory values,
        uint64 timestamp
    ) {
        (values, timestamp) = ftsoV2.getFeedsByIdInWei(feedIds);
        return (values, timestamp);
    }

    // ------------------------------------------------------------------------
    // GENERIC FEED BY ID
    // ------------------------------------------------------------------------

    function getPriceByFeedId(bytes21 feedId) external payable returns (
        uint256 value,
        int8 decimals,
        uint64 timestamp
    ) {
        (value, decimals, timestamp) = ftsoV2.getFeedById(feedId);
        emit PriceUpdated(feedId, value, decimals, timestamp);
        return (value, decimals, timestamp);
    }

    // ------------------------------------------------------------------------
    // FEE CALCULATION
    // ------------------------------------------------------------------------

    function calculateFee(bytes21[] calldata feedIdsList) public view returns (uint256 fee) {
        IFeeCalculator calculator = ContractRegistry.getFeeCalculator();
        fee = calculator.calculateFeeByIds(feedIdsList);
        return fee;
    }

    // ------------------------------------------------------------------------
    // METADATA: CATEGORY + NAME (ROBUST: uses low-level staticcall)
    // ------------------------------------------------------------------------

    /**
     * @dev Attempt to fetch feed metadata (category + name) from FTSO.
     *      Uses a low-level staticcall to avoid depending on how the interface
     *      defines a FeedMetadata struct. If the metadata call does not exist
     *      or fails, returns (0, "") as a safe default.
     *
     * Expected on-chain encoded return shape (common): (uint8 category, string name, int8 decimals)
     * We decode that full tuple and return the first two values. If the actual
     * on-chain return uses the same components but in a struct, the ABI encoding
     * will still match the tuple decoding here.
     */
    function getFeedCategoryAndName(bytes21 feedId)
        external
        view
        returns (uint8 category, string memory name)
    {
        // call getFeedMetadata(bytes21) on the ftsoV2 address using staticcall
        (bool ok, bytes memory data) = address(ftsoV2).staticcall(
            abi.encodeWithSignature("getFeedMetadata(bytes21)", feedId)
        );

        // If call failed or returned no data, return a safe default
        if (!ok || data.length == 0) {
            return (0, "");
        }

        // Decode the returned bytes. Most implementations return (uint8, string, int8)
        // as the ABI-encoding of the struct fields — decode accordingly and return.
        // If your installed FTSO returns a different tuple shape, paste the interface
        // here and I'll adapt the decode types exactly.
        (uint8 decodedCategory, string memory decodedName, /*int8 decodedDecimals*/ ) =
            abi.decode(data, (uint8, string, int8));

        return (decodedCategory, decodedName);
    }
}
