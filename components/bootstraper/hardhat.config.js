require('hardhat-deploy')
// require('hardhat-deploy-ethers')
require("@nomiclabs/hardhat-waffle")

module.exports = {
  solidity: {
    compilers: [
      {version: '0.8.0'}
    ]
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    enviroment: {
      // url: process.env['BLOCKCHAIN_ADDR']
      url: 'https://alexisdelatorre.com/blockchain'
    }
  },
  external: {
    contracts: [
      {
        artifacts: 'node_modules/@uniswap/v2-core/build',
      },
      {
        artifacts: 'node_modules/@uniswap/v2-periphery/build',
      },
    ],
  },
};
