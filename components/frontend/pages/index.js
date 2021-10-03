import {useContext, useEffect, useState} from "react";

import {Avatar, Button, Card, Divider, Input, Spin, message} from 'antd'

import {useWeb3React} from "@web3-react/core"
import {Contract, utils} from 'ethers'
import {Context} from "./_app";
import Address from "../components/Address.js"
import {getAbi, getContractsWithAbi} from "../utils/bdmUtil.js"
import TokenTitle from "../components/TokenTitle.js"

export async function getServerSideProps() {
    // TODO: Handle errors

    const tokensDto = await getContractsWithAbi('token')
    const tokenAbi = await getAbi('token')

    return {
        props: {
            tokensDto,
            tokenAbi,
        }
    }
}

function Balance({qty, symbol, text, stacked}) {
    if (!qty || !symbol) {
        return <Spin size='small'/>
    }

    const containerClass = !stacked
        ? 'flex space-x-1 p-2 font-mono text-xs text-gray-600'
        : 'flex flex-col p-1 font-mono text-xs text-gray-600'

    return (
        <div className={containerClass}>
            <div className='font-extrabold'>{text ? text + ":" : "Balance:"}</div>
            <div className='flex items-center space-x-1'>
                <div>{utils.formatEther(qty)}</div>
                <div>{symbol}</div>
            </div>
        </div>
    )
}

export default function Home({tokensDto, tokenAbi}) {
    const {blockNumber} = useContext(Context)

    const {chainId, account, library} = useWeb3React()

    const [tokens, setTokens] = useState()
    const [contracts, setContracts] = useState({})

    const [mintBurnQuantities, setMintBurnQuantities] = useState({})

    useEffect(() => {
        if (!library) return

        const setupContracts = async () => {
            for (const tokenDto of tokensDto) {
                const tokenContract = new Contract(tokenDto.address, tokenAbi.value, library.getSigner())
                setContracts(contracts => ({...contracts, [tokenDto.name]: tokenContract}))
                setMintBurnQuantities(mintBurnQty => ({...mintBurnQty, [tokenDto.name]: 0}))
            }
        }

        setupContracts()
    }, [library, tokensDto, tokenAbi, account, chainId])

    useEffect(() => {
        if (Object.keys(contracts).length === 0) return

        const setupTokens = async () => {
            const MINTER_ROLE = await contracts[tokensDto[0].name].MINTER_ROLE()

            let tokensAgg = []

            // May have performance issues with a big number of tokens
            // TODO: Use restrained parallel execution
            for (const tokenDto of tokensDto) {
                const tokenContract = contracts[tokenDto.name]

                const token = {
                    name: tokenDto.name,
                    address: tokenDto.address,
                    displayName: await tokenContract.name(),
                    symbol: await tokenContract.symbol(),
                    totalSupply: await tokenContract.totalSupply(),
                    balance: await tokenContract.balanceOf(account),
                    isMinter: await tokenContract.hasRole(MINTER_ROLE, account),
                }

                tokensAgg.push(token)
            }

            setTokens(tokensAgg)
        }

        setupTokens()
    }, [contracts, tokensDto, account, chainId, blockNumber])

    const handleMint = async token => {
        if (!mintBurnQuantities[token.name]) {
            message.error('Enter a valid quantity to Mint')
            return
        }

        await contracts[token.name]
            .mint(account, utils.parseEther(mintBurnQuantities[token.name].toString()))
    }

    const handleBurn = async token => {
        if (!mintBurnQuantities[token.name]) {
            message.error('Enter a valid quantity to Burn')
            return
        }

        await contracts[token.name]
            .burn(utils.parseEther(mintBurnQuantities[token.name].toString()))
    }

    const handleApprove = async token => {
        await contracts[token.name].becomeMinter()
    }

    return (
        <div className='h-full p-10 bg-gray-50'>
            <div className='container mx-auto max-w-screen-xl grid grid-cols-3 gap-8'>
                {!tokens && tokensDto.map(_ => (
                  <Card key={tokensDto.name}>
                      <div className='flex justify-center items-center h-48'><Spin/></div>
                  </Card>
                ))}
                {tokens && tokens.map(token => (
                    <Card
                        title={<TokenTitle name={token.name} displayName={token.displayName}/>}
                        extra={<Balance qty={token.totalSupply} symbol={token.symbol} text='Total Supply' stacked/>}
                        key={token.name}
                    >
                        <div className='flex flex-col space-y-4'>
                            <Input
                                value={mintBurnQuantities[token.name]}
                                onChange={e => {
                                    if (!e.target.value) setMintBurnQuantities({...mintBurnQuantities, [token.name]: null})
                                    else setMintBurnQuantities({...mintBurnQuantities, [token.name]: Number(e.target.value)} )
                                }}
                                min={0}
                                type='number'
                                suffix={<Balance qty={token.balance} symbol={token.symbol}/>}
                                disabled={!token.isMinter}
                            />
                            <div className='flex space-x-4'>
                                {!token.isMinter && (
                                    <Button
                                      onClick={() => handleApprove(token)}
                                      className='w-full' type='primary'
                                      ghost
                                    >
                                        Get Minter Permission
                                    </Button>
                                )}
                                {token.isMinter && (
                                    <div className='w-full flex space-x-2'>
                                        <Button onClick={() => handleMint(token)} type='primary' ghost className='w-full'>💎 Mint</Button>
                                        <Button onClick={() => handleBurn(token)} className='w-full' danger>🔥 Burn</Button>
                                    </div>
                                )}
                            </div>
                            <Divider/>
                            <Address address={token.address}/>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
