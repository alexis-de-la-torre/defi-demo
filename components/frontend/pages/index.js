import {useContext, useEffect, useState} from "react";

import {Avatar, Button, Card, Divider, Input, Spin, message} from 'antd'

import {useWeb3React} from "@web3-react/core"
import {ethers, utils} from 'ethers'
import clipboard from 'copy-to-clipboard'
import {Context} from "./_app";

async function getTokens(addr) {
    try {
        const res = await fetch(`${addr}/tokens`)
        return await res.json()
    } catch (e) {
        console.log('Unable to get Token Contract')
        console.error(e)
        return null
    }
}

export async function getServerSideProps() {
    const blockchainDataManagerAddr =
        process.env['BLOCKCHAIN_DATA_MANAGER_ADDR'] || 'http://localhost:8080'

    const tokens = await getTokens(blockchainDataManagerAddr)

    return {
        props: {
            tokens,
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

function TokenTitle({token}) {
    return (
        <div className='flex items-center space-x-3'>
            <div><Avatar src={`/defi-demo/images/${token.name}.webp`}/></div>
            <div className='text-lg font-semibold'>{token.displayName}</div>
        </div>
    )
}

export default function Home({tokens}) {
    const {blockNumber} = useContext(Context)

    const {chainId, account, library} = useWeb3React()

    const [contracts, setContracts] = useState({})
    const [symbols, setSymbols] = useState({})
    const [totalSupplies, setTotalSupplies] = useState({})
    const [isMinterList, setIsMinterList] = useState({})
    const [balances, setBalances] = useState({})

    const [mintBurnQuantities, setMintBurnQuantities] = useState({})

    useEffect(() => {
        if (!library) return

        const setupContracts = async () => {
            for (const token of tokens) {
                const contract = new ethers.Contract(token.address, token.abi, library.getSigner())

                setContracts(contracts => ({...contracts, [token.name]: contract}))

                contract.symbol()
                    .then(symbol => setSymbols(symbols => ({...symbols, [token.name]: symbol})))

                setMintBurnQuantities(mintBurnQty => ({...mintBurnQty, [token.name]: 0}))
            }
        }

        setupContracts()
    }, [library, tokens, account, chainId])

    useEffect(() => {
        if (Object.keys(contracts).length === 0) return

        const setupTokens = async () => {
            const MINTER_ROLE = await contracts[tokens[0].name].MINTER_ROLE()

            // Will have performance issues with a big number of tokens
            // TODO: Use restrained parallel execution
            for (const token of tokens) {
                const contract = contracts[token.name]

                contract.totalSupply()
                    .then(totalSupply => {
                        setTotalSupplies(totalSupplies => ({ ...totalSupplies, [token.name]: totalSupply }))
                    })

                contract.balanceOf(account)
                    .then(balance => {
                        setBalances(balances => ({...balances, [token.name]: balance}))
                    })

                contract.hasRole(MINTER_ROLE, account)
                    .then(isMinter => {
                        setIsMinterList(isMinterList => ({...isMinterList, [token.name]: isMinter}))
                    })
            }
        }

        setupTokens()
    }, [contracts, account, chainId, blockNumber])

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

    const copyToClipboard = text => {
        clipboard(text)
        message.success('Address copied to keyboard')
    }

    return (
        <div className='h-full p-10 bg-gray-50'>
            <div className='container mx-auto max-w-screen-xl grid grid-cols-3 gap-8'>
                {tokens.map(token => (
                    <Card
                        title={<TokenTitle token={token}/>}
                        extra={<Balance qty={totalSupplies[token.name]} symbol={symbols[token.name]} text='Total Supply' stacked/>}
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
                                suffix={<Balance qty={balances[token.name]} symbol={symbols[token.name]}/>}
                                disabled={!isMinterList[token.name]}
                            />
                            <div className='flex space-x-4'>
                                {isMinterList[token.name] === undefined && <div className='w-full text-center'><Spin/></div>}
                                {isMinterList[token.name] === false && (
                                    <Button onClick={() => handleApprove(token)} className='w-full' type='primary' ghost>Get Minter Permission</Button>
                                )}
                                {isMinterList[token.name] === true && (
                                    <div className='w-full flex space-x-2'>
                                        <Button onClick={() => handleMint(token)} type='primary' ghost className='w-full'>💎 Mint</Button>
                                        <Button onClick={() => handleBurn(token)} className='w-full' danger>🔥 Burn</Button>
                                    </div>
                                )}
                            </div>
                            <Divider/>
                            <button
                                onClick={() => copyToClipboard(token.address)}
                                className='text-gray-600 font-mono text-xs text-left'
                            >
                                {token.address}
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
