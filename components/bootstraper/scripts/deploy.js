require("@nomiclabs/hardhat-web3")

const hre = require("hardhat")
const axios = require('axios')

const clubsAddr = `${getDataManagerAddr()}/clubs`

const clubs = [
    {name: 'bayer-munchen', displayName: 'FC Bayern München', symbol: 'BAY'},
    {name: 'manchester', displayName: 'Manchester City', symbol: 'MAN'},
    {name: 'barcelona', displayName: 'FC Barcelona', symbol: 'BAR'},
    {name: 'real-madrid', displayName: 'Real Madrid', symbol: 'RMD'},
    {name: 'liverpool', displayName: 'Liverpool', symbol: 'LVP'},
    {name: 'atletico-madrid', displayName: 'Atletico Madrid', symbol: 'AMD'},
    {name: 'chelsea', displayName: 'Chelsea', symbol: 'CHL'},
    {name: 'paris-saint-germain', displayName: 'Paris Saint-Germain', symbol: 'PSG'},
    {name: 'manchester-united', displayName: 'Manchester United', symbol: 'MCH'},
    {name: 'sevilla', displayName: 'Sevilla FC', symbol: 'SEV'},
]

let contracts = {}

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

    const Club = await ethers.getContractFactory("Club")

    console.log(`Deploying ${clubs.length} Club contracts`)

    for (const club of clubs) {
        console.log(`Deploying Contract for ${club.displayName}`)

        const contract = await Club.deploy(club.displayName, club.symbol)

        contracts[club.name] = contract.address

        console.log("Contract address:", contract.address)
    }

    console.log('Deleting existing clubs')

    const allClubs = (await axios.get(clubsAddr)).data

    for (const club of allClubs) {
        await axios.delete(`${clubsAddr}/${club.name}`)
        console.log('Deleted', club.displayName)
    }

    console.log(`Saving Club contract information for ${clubs.length} clubs`)

    const clubAbi = (await hre.artifacts.readArtifact("Club")).abi

    for (const club of clubs) {
        const body = {
            name: club.name,
            displayName: club.displayName,
            address: contracts[club.name],
            abi: JSON.stringify(clubAbi)
        }

        await axios.post(clubsAddr, body)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });
