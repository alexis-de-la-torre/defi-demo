import {Button, Card, Divider, Input, Spin} from "antd";
import {getAbi, getContractsWithAbi} from "../utils/bdmUtil.js"
import {useContext, useEffect, useState} from "react"
import {Contract, ethers} from "ethers"
import {useWeb3React} from "@web3-react/core"
import {Context} from "./_app.js"
import TokenTitle from "../components/TokenTitle.js"
import Image from 'next/image'

import coingeckoLogo from '../public/images/coingecko.png'

export async function getServerSideProps() {
    const oraclesDto = await getContractsWithAbi('oracle')
    const oracleAbi = await getAbi('oracle')

    const tokensDto = await getContractsWithAbi('token')
    const tokenAbi = await getAbi('token')

    return {
        props: {
            oraclesDto,
            oracleAbi,
            tokensDto,
            tokenAbi
        }
    }
}

export default function Faucet({oraclesDto, oracleAbi, tokensDto, tokenAbi}) {
    const {blockNumber} = useContext(Context)

    const {chainId, account, library} = useWeb3React()

    const [oracles, setOracles] = useState()
    const [oracleContracts, setOracleContracts] = useState()
    const [tokenContracts, setTokenContracts] = useState()

    const [lastUpdated, setLastUpdated] = useState()

    useEffect(() => {
        if (!library) return

        const setupOracleContracts = async () => {
            let contractsAgg = {}

            for (const oracleDto of oraclesDto) {
                contractsAgg[oracleDto.name] =
                  new Contract(oracleDto.address, oracleAbi.value, library.getSigner())
            }

            setOracleContracts(contractsAgg)
        }

        setupOracleContracts()
    }, [oraclesDto, oracleAbi, library, account, chainId])

    useEffect(() => {
        if (!library) return

        const setupTokenContracts = async () => {
            let contractsAgg = {}

            for (const tokenDto of tokensDto) {
                contractsAgg[tokenDto.address] =
                  new Contract(tokenDto.address, tokenAbi.value, library.getSigner())
            }

            setTokenContracts(contractsAgg)
        }

        setupTokenContracts()
    }, [tokensDto, tokenAbi, library, account, chainId])

    useEffect(() => {
        if (!oracleContracts || !tokenContracts) return

        const setupOracles = async () => {
            let oraclesAgg = []

            let lastUpdatedFilled = false

            for (const oracleDto of oraclesDto) {
                const oracleContract = oracleContracts[oracleDto.name]

                if (!lastUpdatedFilled) {
                    setLastUpdated(new Date((await oracleContract.lastUpdated()).toNumber() * 1000))
                }

                lastUpdatedFilled = true

                const tokenAddress = await oracleContract.tokenAddress()
                const tokenDto = tokensDto.find(tdto => tdto.address === tokenAddress)
                const tokenContract = tokenContracts[tokenAddress]

                const oracle = {
                    name: oracleDto.name,
                    address: oracleDto.address,
                    contract: oracleContract,
                    token: {
                        name: tokenDto.name,
                        address: tokenAddress,
                        displayName: await tokenContract.name(),
                    },
                    price: ethers.utils.formatEther(await oracleContract.price())
                }

                oraclesAgg.push(oracle)
            }

            setOracles(oraclesAgg)
            console.log(oraclesAgg)
            console.log(oraclesAgg[0])
        }

        setupOracles()
    }, [oraclesDto, oracleContracts, tokenContracts, account, chainId, blockNumber])

    return (
        <div className='h-full p-10 bg-gray-50'>
            <div className='container mx-auto max-w-screen-xl'>
                <div className='flex flex-col space-y-6'>
                    <div className='flex items-center justify-between'>
                        {lastUpdated && <div className='text-lg'>last updated {lastUpdated.toString()}</div>}
                        <div className='flex items-center space-x-4'>
                            <div className='text-lg'>Prices sourced from </div>
                            <img src='/defi-demo/images/coingecko.png' width={150}/>
                        </div>
                    </div>
                    <div className='grid grid-cols-3 gap-8'>
                        {!oracles && oraclesDto.map(_ => (
                          <Card key={oraclesDto.name}>
                              <div className='flex justify-center items-center h-48'><Spin/></div>
                          </Card>
                        ))}
                        {oracles && oracles.map(oracle => (
                          <Card title={<TokenTitle name={oracle.token.name} displayName={oracle.token.displayName}/>} key={oracle.name}>
                              ${oracle.price} USD
                          </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
