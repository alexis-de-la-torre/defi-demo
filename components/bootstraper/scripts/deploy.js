require("@nomiclabs/hardhat-web3")

const axios = require('axios')

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

    const dataManagerHost = process.env['DATA_MANAGER_HOST'] || 'localhost'
    const dataManagerPort = process.env['DATA_MANAGER_PORT'] || '8080'

    const dataManagerAddr = `http://${dataManagerHost}:${dataManagerPort}`

    await axios.post(`${dataManagerAddr}/contracts`, {name: 'test', address: test.address})
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });
