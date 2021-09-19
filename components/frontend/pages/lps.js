import {Card, Divider, Spin} from "antd"
import {utils, Contract} from "ethers"
import {useEffect, useState} from "react"
import {useWeb3React} from "@web3-react/core"
import {getAbi, getContract, getContractsWithAbi} from "../utils/bdmUtil.js"
import Address from "../components/Address.js"

export async function getServerSideProps() {
    // TODO: Handle errors

    const pairsDto = await getContractsWithAbi('pair')
    const weth = await getContract('weth')
    const pairAbi = await getAbi('pair')
    const wethAbi = await getAbi('weth')
    const tokenAbi = await getAbi('token')

    return {
        props: {
            pairsDto,
            weth,
            pairAbi,
            tokenAbi,
            wethAbi
        }
    }
}

export default function Lps({pairsDto, weth, pairAbi, tokenAbi, wethAbi}) {
    const {chainId, account, library, blockNumber} = useWeb3React()

    const [pairs, setPairs] = useState()
    const [pairContracts, setPairContracts] = useState()
    const [tokenContracts, setTokenContracts] = useState()

    useEffect(() => {
        if (!library) return

        const setupContracts = async () => {
            let pairContractsAgg = {}
            let tokenContractsAgg = {}

            for (const pairDto of pairsDto) {
                const signer = library.getSigner()

                const pairContract =
                  new Contract(pairDto.address, pairAbi.value, signer)

                const tokenAddrs = [await pairContract.token0(), await pairContract.token1()]

                const tokenContracts = tokenAddrs.map(tokenAddr => {
                    const abi = tokenAddr === weth.address ? wethAbi.value : tokenAbi.value
                    return new Contract(tokenAddr, abi, signer)
                })

                pairContractsAgg[pairDto.name] = pairContract
                tokenContractsAgg[pairDto.name] = tokenContracts
            }

            setPairContracts(pairContractsAgg)
            setTokenContracts(tokenContractsAgg)
        }

        setupContracts()
    }, [library, pairsDto, pairAbi, tokenAbi, wethAbi, weth, account, chainId])

    useEffect(() => {
        if (!pairContracts || !tokenContracts) return

        const setupPairs = async () => {
            let pairsAgg = []

            for (const pairDto of pairsDto) {
                const symbols = [
                    await tokenContracts[pairDto.name][0].symbol(),
                    await tokenContracts[pairDto.name][1].symbol(),
                ]

                const reserves =
                  await pairContracts[pairDto.name].getReserves()

                const pair = {
                    name: pairDto.name,
                    address: pairDto.address,
                    tokens: [
                        {name: 'token0', symbol: symbols[0], reserves: reserves[0]},
                        {name: 'token1', symbol: symbols[1], reserves: reserves[1]},
                    ]
                }

                pairsAgg.push(pair)
            }

            setPairs(pairsAgg)
        }

        setupPairs()
    }, [pairContracts, pairsDto, tokenContracts, account, chainId, blockNumber])

    return (
      <div className='h-full p-10 bg-gray-50'>
          <div className='container mx-auto max-w-screen-xl grid grid-cols-3 gap-8'>
              {!pairs && pairsDto.map(pairDto => (
                <Card key={pairDto.name}>
                    <div className='flex justify-center items-center h-40'><Spin/></div>
                </Card>
              ))}
              {pairs && pairs.map(pair => (
                <Card title={pair.tokens.map(t => t.symbol).join('-')} key={pair.name}>
                    <div className='flex flex-col space-y-4'>
                        {pair.tokens.map(token =>
                          <div key={token.name}>{utils.formatEther(token.reserves)} {token.symbol}</div>)}
                        <Divider/>
                        <Address address={pair.address}/>
                    </div>
                </Card>
              ))}
          </div>
      </div>
    )
}
