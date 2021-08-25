require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    cryptoSoccer: {
      url: "http://localhost:8545/blockchain"
    }
  }
};
