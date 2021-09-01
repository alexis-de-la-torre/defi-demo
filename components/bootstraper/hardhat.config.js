require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    enviroment: {
      url: process.env['BLOCKCHAIN_ADDR']
    }
  }
};
