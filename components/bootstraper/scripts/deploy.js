require("@nomiclabs/hardhat-web3")

const axios = require('axios')

function getDataManagerAddr() {
    if (process.env['DATA_MANAGER_ADDR']) {
        return process.env['DATA_MANAGER_ADDR']
    } else {
        const host = process.env['DATA_MANAGER_HOST'] || 'localhost'
        const port = process.env['DATA_MANAGER_PORT'] || '8080'
        return `http://${host}:${port}`
    }
}

async function main() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contract with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    console.log("Deploying TEST contract")

    const Test = await ethers.getContractFactory("Test")
    const test = await Test.deploy()

    console.log("Contract address:", test.address)

    console.log(`Minting some TEST to`, deployer.address)

    await test.mint(deployer.address, ethers.utils.parseEther('5000.00'))

    console.log('Saving contract information')

    const dataManagerAddr = getDataManagerAddr()

    // TODO: Clear all before saving

    await axios.post(`${dataManagerAddr}/contracts`, {name: 'test', address: test.address})
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });
