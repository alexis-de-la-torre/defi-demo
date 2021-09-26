const {saveContract} = require("../util/bdm-utils.js")
const {saveAbi} = require("../util/bdm-utils.js")
const {getContract} = require("../util/bdm-utils.js")
const {getTokens} = require("../util/bdm-utils.js")
const {getPrices} = require("../util/coingecko-utils.js")
const fs = require('fs')

const POOL_USD = 50_000_000

const tokens = JSON.parse(fs.readFileSync('resources/tokens.json'))

module.exports = async function({ethers, deployments}) {
  const {getArtifact} = deployments
  const {Contract} = ethers

  const [deployer] = await ethers.getSigners()

  const ethPrice = (await getPrices(['ethereum']))['ethereum'].usd
  const tokenPrices = await getPrices(tokens.map(t => t.name))

  const wethAmt = POOL_USD / 2 / ethPrice

  const factoryArtifact = await getArtifact('UniswapV2Factory')
  const routerArtifact = await getArtifact('UniswapV2Router02')
  const pairArtifact = await getArtifact('UniswapV2Pair')
  const wethArtifact = await getArtifact('WETH9')
  const tokenArtifact = await getArtifact('Token')

  const factoryAddr = (await getContract('factory')).data.address
  const routerAddr = (await getContract('router')).data.address
  const wethAddr = (await getContract('weth')).data.address
  const tokensDto = await getTokens()

  const factory = new Contract(factoryAddr, factoryArtifact.abi, deployer)
  const router = new Contract(routerAddr, routerArtifact.abi, deployer)
  const weth = new Contract(wethAddr, wethArtifact.abi, deployer)

  const abiId = await saveAbi('pair', pairArtifact.abi)

  console.log('Creating Pairs,', 'ETH price:', ethPrice)

  for (let i = 0; i < tokensDto.length; i++) {
    const tokenDto = tokensDto[i]

    const token = new Contract(tokenDto.address, tokenArtifact.abi, deployer)

    const tokenPrice = tokenPrices[tokenDto.name].usd
    const tokenAmt = POOL_USD / 2 / tokenPrice

    const name = await token.name()
    const symbol = await token.symbol()
    const pairName = `${symbol}-ETH`

    console.log('Creating Pair for', name)

    console.log('Minting',
      tokenAmt,
      symbol,
      'with value of',
      tokenAmt * tokenPrice, 'USD')

    await token.becomeMinter()
    await token.mint(deployer.address, ethers.utils.parseEther(tokenAmt.toString()))

    console.log(`Adding liquidity to pair:`, pairName)
    console.log('Pairing with:',
      wethAmt,
      'ETH with value of',
      wethAmt * ethPrice)

    await weth.approve(routerAddr, ethers.constants.MaxUint256)
    await token.approve(routerAddr, ethers.constants.MaxUint256)

    await router.addLiquidityETH(
      token.address,
      ethers.utils.parseEther(tokenAmt.toString()),
      ethers.utils.parseEther(tokenAmt.toString()),
      ethers.utils.parseEther(wethAmt.toString()),
      deployer.address,
      ethers.constants.MaxUint256,
      {value: ethers.utils.parseEther(wethAmt.toString())}
    )

    await saveContract(
      pairName.toLowerCase() + '-pair',
      {address: await factory.allPairs(i), abiId}
    )

    console.log(`Address for ${pairName}:`, await factory.allPairs(i))
  }
}

module.exports.tags = ['lp-pairs']
