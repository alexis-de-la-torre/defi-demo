const {saveContract} = require("../util/bdm-utils.js")
const {saveAbi} = require("../util/bdm-utils.js")
const {getContract} = require("../util/bdm-utils.js")
const {getTokens} = require("../util/bdm-utils.js")

module.exports = async function({ethers, deployments}) {
  const {getArtifact} = deployments
  const {Contract} = ethers

  const [deployer] = await ethers.getSigners()

  const wethAmt = ethers.utils.parseEther('100.0')
  const tokenAmt = ethers.utils.parseEther('100.0')

  const factoryArtifact = await getArtifact('UniswapV2Factory')
  const routerArtifact = await getArtifact('UniswapV2Router02')
  const pairArtifact = await getArtifact('UniswapV2Pair')
  const wethArtifact = await getArtifact('WETH9')
  const tokenArtifact = await getArtifact('Token')

  const factoryAddr = (await getContract('factory')).data.address
  const routerAddr = (await getContract('router')).data.address
  const wethAddr = (await getContract('weth')).data.address
  const tokenAddrs = (await getTokens()).data.map(x => x.address)

  const factory = new Contract(factoryAddr, factoryArtifact.abi, deployer)
  const router = new Contract(routerAddr, routerArtifact.abi, deployer)
  const weth = new Contract(wethAddr, wethArtifact.abi, deployer)

  const abiId = await saveAbi('pair', pairArtifact.abi)

  for (let i = 0; i < tokenAddrs.length; i++) {
    const token = new Contract(tokenAddrs[i], tokenArtifact.abi, deployer)

    const name = await token.name()
    const symbol = await token.symbol()
    const pairName = `${symbol}-ETH`

    console.log('Creating Pair for', name)

    console.log('Minting', ethers.utils.formatEther(tokenAmt), symbol)

    await token.becomeMinter()
    await token.mint(deployer.address, tokenAmt)

    console.log(`Adding liquidity to pair:`, pairName)

    await weth.approve(routerAddr, ethers.constants.MaxUint256)
    await token.approve(routerAddr, ethers.constants.MaxUint256)

    await router.addLiquidityETH(
      token.address,
      tokenAmt,
      tokenAmt,
      wethAmt,
      deployer.address,
      ethers.constants.MaxUint256,
      {value: wethAmt}
    )

    await saveContract(
      pairName.toLowerCase() + '-pair',
      {address: await factory.allPairs(i), abiId}
    )

    console.log(`Address for ${pairName}:`, await factory.allPairs(i))
  }
}

module.exports.tags = ['lp-pairs']
