import {ethers, utils, BigNumber} from 'ethers'
import {useEffect, useState} from 'react';

const deploymentManagerHost = process.env['DEPLOYMENT_MANAGER_HOST'] || 'localhost'
const deploymentManagerPort = process.env['DEPLOYMENT_MANAGER_PORT'] || 8080
const deploymentManagerAddr = `http://${deploymentManagerHost}:${deploymentManagerPort}`

async function getTestTokenContract() {
    try {
        const res = await fetch(`${deploymentManagerAddr}/contracts/test-token-contract`)
        return await res.json()
    } catch (e) {
        console.log('Unable to get Token Contract')
        console.error(e)
        return null
    }
}

async function getDeployer() {
    try {
        const res = await fetch(`${deploymentManagerAddr}/users/deployer`)
        return await res.json()
    } catch (e) {
        console.log('Unable to get Deployer')
        console.error(e);
        return null
    }
}

export async function getServerSideProps() {
    const testTokenContract = await getTestTokenContract()
    const deployerUser = await getDeployer()

    const blockchainUrl = process.env['BLOCKCHAIN_URL'] || 'http://localhost:8545'

    return {
        props: {
            deployerUser,
            testTokenContract,
            blockchainUrl,
        }
    }
}

export default function Home({ deployerUser, testTokenContract, blockchainUrl }) {
    const [provider, setProvider] = useState(null)
    const [blockNumber, setBlockNumber] = useState(null)
    const [token, setToken] = useState(null)
    const [symbol, setSymbol] = useState(null)
    const [balance, setBalance] = useState(BigNumber.from(0))

    useEffect(() => {
        async function setupWeb3() {
            if (testTokenContract && deployerUser) {
                const provider = new ethers.providers.JsonRpcProvider(blockchainUrl)
                setProvider(provider)

                const wallet = new ethers.Wallet(deployerUser.privateKey, provider)

                const token = new ethers.Contract(testTokenContract.address, testTokenContract.abi, wallet)
                setToken(token)

                setSymbol(await token.symbol())
                setBalance((await token.balanceOf(deployerUser.address)))
            }
        }

        setupWeb3()
    }, [testTokenContract, deployerUser])

    useEffect(() => {
        if (provider) {
            provider.getBlockNumber()
                .then(setBlockNumber)
                .catch(() => console.log('Unable to find block number'))
        }
    }, [provider])

    const mint = async () => {
        await token.mint(deployerUser.address, utils.parseEther('1000.00'))
        setBalance((await token.balanceOf(deployerUser.address)))
        setBlockNumber(await provider.getBlockNumber())
    }

    const burn = async () => {
        await token.burn(utils.parseEther('1000.00'))
        setBalance((await token.balanceOf(deployerUser.address)))
        setBlockNumber(await provider.getBlockNumber())
    }

    if (!testTokenContract || !deployerUser) {
        return <>loading...</>
    }

    return <>
        <div style={{padding: 40}}>
            <strong>Block Number: </strong> {blockNumber || "Error"} <br/><br/>
            <strong>Deployer Address: </strong> {deployerUser.address}<br/>
            <strong>Deployer Private Key: </strong> {deployerUser.privateKey}<br/><br/>
            <strong>Token Symbol: </strong> {symbol} <br/>
            <strong>Token Address: </strong> {testTokenContract.address} <br/>
            <strong>Token Balance: </strong> {utils.formatEther(balance)} {symbol}<br/><br/>

            <button style={{marginRight: 20, padding: 10}} onClick={mint}><strong>Mint</strong></button>
            <button style={{padding: 10}} onClick={burn}><strong>🔥 Burn Baby Burn! 🔥</strong></button>
        </div>
    </>
}
