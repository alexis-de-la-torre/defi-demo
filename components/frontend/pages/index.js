import {useEffect, useState} from "react";

import {Avatar, Button, Card, Divider, Input, Spin, message} from 'antd'

import {useWeb3React} from "@web3-react/core"
import {ethers, utils} from 'ethers'
import clipboard from 'copy-to-clipboard'

async function getClubs(addr) {
    try {
        const res = await fetch(`${addr}/clubs`)
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

    const clubs = await getClubs(blockchainDataManagerAddr)

    return {
        props: {
            clubs,
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

function ClubTitle({club}) {
    return (
        <div className='flex items-center space-x-3'>
            <div><Avatar src={`/crypto-soccer/images/${club.name}.png`}/></div>
            <div className='text-lg font-semibold'>{club.displayName}</div>
        </div>
    )
}

export default function Home({clubs}) {
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
            for (const club of clubs) {
                const contract = new ethers.Contract(club.address, club.abi, library.getSigner())

                setContracts(contracts => ({...contracts, [club.name]: contract}))

                contract.symbol()
                    .then(symbol => setSymbols(symbols => ({...symbols, [club.name]: symbol})))

                setMintBurnQuantities(mintBurnQty => ({...mintBurnQty, [club.name]: 0}))
            }
        }

        setupContracts()
    }, [library, clubs, account])

    useEffect(() => {
        if (Object.keys(contracts).length === 0) return

        const setupClubs = async () => {
            const MINTER_ROLE = await contracts[clubs[0].name].MINTER_ROLE()

            // Will have performance issues with a big number of clubs
            // TODO: Use restrained parallel execution
            for (const club of clubs) {
                const contract = contracts[club.name]

                contract.totalSupply()
                    .then(totalSupply => {
                        setTotalSupplies(totalSupplies => ({ ...totalSupplies, [club.name]: totalSupply }))
                    })

                contract.balanceOf(account)
                    .then(balance => {
                        setBalances(balances => ({...balances, [club.name]: balance}))
                    })

                contract.hasRole(MINTER_ROLE, account)
                    .then(isMinter => {
                        setIsMinterList(isMinterList => ({...isMinterList, [club.name]: isMinter}))
                    })
            }
        }

        setupClubs()
    }, [contracts, account])

    const handleMint = async club => {
        if (!mintBurnQuantities[club.name]) {
            message.error('Enter a valid quantity to Mint')
            return
        }

        await contracts[club.name]
            .mint(account, utils.parseEther(mintBurnQuantities[club.name].toString()))
    }

    const handleBurn = async club => {
        if (!mintBurnQuantities[club.name]) {
            message.error('Enter a valid quantity to Burn')
            return
        }

        await contracts[club.name]
            .burn(utils.parseEther(mintBurnQuantities[club.name].toString()))
    }

    const handleApprove = async club => {
        await contracts[club.name].becomeMinter()
    }

    const copyToClipboard = text => {
        clipboard(text)
        message.success('Address copied to keyboard')
    }

    return (
        <div className='h-full p-10 bg-gray-50'>
            <div className='container mx-auto max-w-screen-xl grid grid-cols-3 gap-8'>
                {clubs.map(club => (
                    <Card
                        title={<ClubTitle club={club}/>}
                        extra={<Balance qty={totalSupplies[club.name]} symbol={symbols[club.name]} text='Total Supply' stacked/>}
                        key={club.name}
                    >
                        <div className='flex flex-col space-y-4'>
                            <Input
                                value={mintBurnQuantities[club.name]}
                                onChange={e => {
                                    if (!e.target.value) setMintBurnQuantities({...mintBurnQuantities, [club.name]: null})
                                    else setMintBurnQuantities({...mintBurnQuantities, [club.name]: Number(e.target.value)} )
                                }}
                                min={0}
                                type='number'
                                suffix={<Balance qty={balances[club.name]} symbol={symbols[club.name]}/>}
                                disabled={!isMinterList[club.name]}
                            />
                            <div className='flex space-x-4'>
                                {isMinterList[club.name] === undefined && <div className='w-full text-center'><Spin/></div>}
                                {isMinterList[club.name] === false && (
                                    <Button onClick={() => handleApprove(club)} className='w-full' type='primary' ghost>Approve</Button>
                                )}
                                {isMinterList[club.name] === true && (
                                    <div className='w-full flex space-x-2'>
                                        <Button onClick={() => handleMint(club)} type='primary' ghost className='w-full'>💎 Mint</Button>
                                        <Button onClick={() => handleBurn(club)} className='w-full' danger>🔥 Burn</Button>
                                    </div>
                                )}
                            </div>
                            <Divider/>
                            <button
                                onClick={() => copyToClipboard(club.address)}
                                className='text-gray-600 font-mono text-xs text-left'
                            >
                                {club.address}
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
