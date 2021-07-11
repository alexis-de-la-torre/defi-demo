import {ethers} from "ethers"
import {useEffect, useState} from "react";

export default function Home() {
    const [provider, setProvider] = useState(null)
    const [blockNumber, setBlockNumber] = useState(null)

    useEffect(() => {
        async function setupWeb3() {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            setProvider(provider)
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
        <strong>Block Number: </strong> {blockNumber}
    </>
}
