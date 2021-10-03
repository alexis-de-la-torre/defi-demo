// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Oracle {
    address public tokenAddress;
    uint256 public price;
    uint256 public lastUpdated;

    constructor(address tokenAddress_, uint256 initialPrice, uint256 timestamp) {
        tokenAddress = tokenAddress_;
        price = initialPrice;
        lastUpdated = timestamp;
    }

    function updatePrice(uint256 newPrice, uint256 timestamp) public {
        price = newPrice;
        lastUpdated = timestamp;
    }
}
