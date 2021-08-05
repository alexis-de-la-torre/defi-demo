import {ethers, utils, BigNumber} from "ethers"
import {useEffect, useState} from "react";
import {formatEther} from "ethers/lib/utils";

export async function getStaticProps() {
    const testTokenContractRes = await fetch('http://172.25.61.33:8080/contracts/test-token-contract')
    const testTokenContract = await testTokenContractRes.json()

    const deployerAddrRes = await fetch('http://172.25.61.33:8080/contracts/deployer')
    const deployerAddr = (await deployerAddrRes.json()).address

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
    const [token, setToken] = useState(null)
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

    return <>
        <strong>Block Number: </strong> {blockNumber || "Error"} <br/>
        <strong>balance: </strong> {utils.formatEther(balance)} {symbol}
    </>
}
