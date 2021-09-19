const fs = require('fs')
const {saveContract} = require("../util/bdm-utils.js")
const {saveAbi} = require("../util/bdm-utils.js")

const tokens = JSON.parse(fs.readFileSync('resources/tokens.json'))

module.exports = async function({ethers, deployments}) {
  const {deploy, getArtifact} = deployments
  const {utils} = ethers

  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)
  console.log("Account balance:", utils.formatEther(await deployer.getBalance()))

  console.log('Deleting existing tokens')

  console.log(`Deploying Abi for Token contract`)

  const tokenArtifact = await getArtifact('Token')

  const abiId = await saveAbi('token', tokenArtifact.abi)

  console.log(`Deploying ${tokens.length} Token contracts`)

  for (const token of tokens) {
    console.log(`Deploying Contract for ${token.displayName}`)

    // const contract = await Token.deploy(token.displayName, token.symbol)
    const contract = await deploy('Token', {
      from: deployer.address,
      args: [token.displayName, token.symbol],
      log: true
    })

    await saveContract(token.name, {contract, abiId, isToken: true})

    console.log("Contract address:", contract.address)
  }
}

module.exports.tags = ['tokens']
