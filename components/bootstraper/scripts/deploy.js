require("@nomiclabs/hardhat-web3")

const hre = require("hardhat")
const axios = require('axios')
const fs = require('fs')

const tokens = JSON.parse(fs.readFileSync('resources/tokens.json'))

async function main() {
    const tokensAddr = process.env['DATA_MANAGER_ADDR'] + '/tokens'
        || `http://localhost:8080/blockchain-data-manager/tokens`

    const [deployer] = await ethers.getSigners()

    let contracts = {}

    console.log("Deploying contract with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Token = await ethers.getContractFactory("Token")

    console.log(`Deploying ${tokens.length} Token contracts`)

    for (const token of tokens) {
        console.log(`Deploying Contract for ${token.displayName}`)

        const contract = await Token.deploy(token.displayName, token.symbol)

        contracts[token.name] = contract.address

        console.log("Contract address:", contract.address)
    }

    console.log('Deleting existing tokens')

    const existingTokens = (await axios.get(tokensAddr)).data

    for (const existingToken of existingTokens) {
        await axios.delete(`${tokensAddr}/${existingToken.name}`)
        console.log('Deleted', existingToken.displayName)
    }

    console.log(`Saving Token contract information for ${tokens.length} tokens`)

    const tokenAbi = (await hre.artifacts.readArtifact("Token")).abi

    for (const token of tokens) {
        const body = {
            name: token.name,
            displayName: token.displayName,
            address: contracts[token.name],
            abi: JSON.stringify(tokenAbi)
        }

        await axios.post(tokensAddr, body)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });
