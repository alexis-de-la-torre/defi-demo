require("@nomiclabs/hardhat-web3")

const hre = require("hardhat")
const axios = require('axios')

function getDataManagerAddr() {
    if (process.env['DATA_MANAGER_ADDR']) {
        return process.env['DATA_MANAGER_ADDR']
    } else {
        const host = process.env['DATA_MANAGER_HOST'] || 'localhost'
        const port = process.env['DATA_MANAGER_PORT'] || '8080'
        const path = process.env['DATA_MANAGER_PATH'] || '/blockchain-data-manager'
        return `http://${host}:${port}${path}`
    }
}

async function main() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contract with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    console.log("Deploying Club contract")

    const Club = await ethers.getContractFactory("Club")
    const club = await Club.deploy("Test Club", "CLUB")

    console.log("Contract address:", club.address)

    console.log("Contract address:", club.address)

    const clubsAddr = `${getDataManagerAddr()}/clubs`

    console.log('Deleting existing clubs')

    const allClubs = (await axios.get(clubsAddr)).data

    for (const club of allClubs) {
        await axios.delete(`${clubsAddr}/${club.name}`)
        console.log('Deleted', club.name)
    }

    console.log('Saving Club contract information')

    const clubAbi = (await hre.artifacts.readArtifact("Club")).abi

    const testBody = {name: 'test-club', displayName: 'Test Club', address: club.address, abi: JSON.stringify(clubAbi)}
    await axios.post(clubsAddr, testBody)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });
