import {ethers, utils, BigNumber} from "ethers"
import {useEffect, useState} from "react";

export async function getStaticProps() {
    const deploymentManagerHost = process.env['DEPLOYMENT_MANAGER_HOST'] || 'localhost'
    const deploymentManagerPort = process.env['DEPLOYMENT_MANAGER_PORT'] || 8080
    const deploymentManagerAddr = `http://${deploymentManagerHost}:${deploymentManagerPort}`

    const testTokenContractRes = await fetch(`${deploymentManagerAddr}/contracts/test-token-contract`)
    const testTokenContract = await testTokenContractRes.json()

    const deployerAddrRes = await fetch(`${deploymentManagerAddr}/contracts/deployer`)
    const deployerAddr = (await deployerAddrRes.json()).address

    console.log(process.env)

    return {
        props: {
            deployerAddr,
            testTokenContract
        }
    }
}

export default function Home({ deployerAddr, testTokenContract }) {
    const [provider, setProvider] = useState(null)
    const [blockNumber, setBlockNumber] = useState(null)
    const [symbol, setSymbol] = useState(null)
    const [balance, setBalance] = useState(BigNumber.from(0))

    useEffect(() => {
        async function setupWeb3() {
            if (testTokenContract && deployerAddr) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                setProvider(provider)

                const token = new ethers.Contract(testTokenContract.address, testTokenContract.abi, provider)

                setSymbol(await token.symbol())
                setBalance((await token.balanceOf(deployerAddr)))
            }
        }

        setupWeb3()
    }, [testTokenContract, deployerAddr])

    useEffect(() => {
        if (provider) {
            provider.getBlockNumber()
                .then(setBlockNumber)
                .catch(() => console.log('Unable to find block number'))
        }
    }, [provider])

    if (!testTokenContract || !deployerAddr) {
        return <>loading...</>
    }

    return <>
        <strong>Block Number: </strong> {blockNumber || "Error"} <br/><br/>
        <strong>Deployer Address: </strong> {deployerAddr}<br/><br/>
        <strong>Token Symbol: </strong> {symbol} <br/>
        <strong>Token Address: </strong> {testTokenContract.address} <br/>
        <strong>Token Balance: </strong> {utils.formatEther(balance)} {symbol}
    </>
}
