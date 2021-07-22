import {ethers, utils, BigNumber} from "ethers"
import {useEffect, useState} from "react";
import abi from "../abis/TestToken.json"
import {formatEther} from "ethers/lib/utils";

export default function Home() {
    const [provider, setProvider] = useState(null)
    const [blockNumber, setBlockNumber] = useState(null)
    const [token, setToken] = useState(null)
    const [balance, setBalance] = useState(BigNumber.from(0))

    useEffect(() => {
        async function setupWeb3() {
            const testTokenAddr = "0x90E2484C1cF3480a12EEf6c7753496f2501345D2"
            const accountAddr = "0x25c8f358093629Ff6d7949F2b995E232Aa356357"

            const provider = new ethers.providers.Web3Provider(window.ethereum)
            setProvider(provider)

            const token = new ethers.Contract(testTokenAddr, abi.abi, provider)
            console.log(await token.symbol())
            setBalance((await token.balanceOf(accountAddr)))
        }

        setupWeb3()
    }, [])

    useEffect(() => {
        if (provider) {
            provider.getBlockNumber()
                .then(setBlockNumber)
                .catch(() => console.log('Unable to find block number'))
        }
    }, [provider])

    return <>
        <strong>Block Number: </strong> {blockNumber || "Error"} <br/>
        <strong>balance: </strong> {utils.formatEther(balance)} TEST
    </>
}
