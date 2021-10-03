const fs = require("fs")
const {getPrices} = require("../util/coingecko-utils.js")
const {saveAbi} = require("../util/bdm-utils.js")
const {saveContract} = require("../util/bdm-utils.js")
const {getTokens} = require("../util/bdm-utils.js")

const tokens = JSON.parse(fs.readFileSync('resources/tokens.json'))

module.exports = async function({ethers, deployments}) {
    const {deploy, getArtifact} = deployments
    const [deployer] = await ethers.getSigners()

    const tokenPrices = await getPrices(tokens.map(t => t.name))

    const oracleArtifact = await getArtifact('Oracle')

    const abiId = await saveAbi('oracle', oracleArtifact.abi)

    const tokensDto = await getTokens()

    for (let i = 0; i < tokensDto.length; i++) {
        const tokenDto = tokensDto[i]

        console.log('Creating Oracle for', tokenDto.name)

        const contract = await deploy('Oracle', {
            from: deployer.address,
            args: [tokenDto.address,
                ethers.utils.parseEther(tokenPrices[tokenDto.name].usd.toString()),
                Math.floor(new Date().getTime() / 1000)],
            log: true
        })

        await saveContract(
          tokenDto.name + '-oracle',
          {contract , abiId}
        )
    }
}

module.exports.tags = ['oracles']
