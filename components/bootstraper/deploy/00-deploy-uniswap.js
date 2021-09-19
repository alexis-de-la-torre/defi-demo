const {utils} = require("ethers")

const {saveContract} = require("../util/bdm-utils.js")

module.exports = async function({deployments}) {
  const {deploy} = deployments;

  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)
  console.log("Account balance:", utils.formatEther(await deployer.getBalance()))

  const weth = await deploy('WETH9', {
    from: deployer.address,
    args: [],
    log: true,
  });

  const factory = await deploy('UniswapV2Factory', {
    from: deployer.address,
    args: [deployer.address],
    log: true,
  });

  const router = await deploy('UniswapV2Router02', {
    from: deployer.address,
    args: [factory.address, weth.address],
    log: true,
  });

  await saveContract('weth', {contract: weth})
  await saveContract('factory', {contract: factory})
  await saveContract('router', {contract: router})
}

module.exports.tags = ['uniswap']
