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

export default function Home({clubs: clubsInfo}) {
    const {chainId, account, library} = useWeb3React()

    const [clubsLoaded, setClubsLoaded] = useState(false)
    const [clubs, setClubs] = useState([])

    const [mintBurnQty, setMintBurnQty] = useState(0)

    useEffect(() => {
        if (!library) return

        const setupContracts = async () => {
            let clubsAcc = []
            let mintBurnQtyAcc = {}

            for (const clubInfo of clubsInfo) {
                const contract = new ethers.Contract(clubInfo.address, clubInfo.abi, library.getSigner())

                const MINTER_ROLE = await contract.MINTER_ROLE()

                const club = {
                    ...clubInfo,
                    contract,
                    symbol: await contract.symbol(),
                    totalSupply: await contract.totalSupply(),
                    isMinter: await contract.hasRole(MINTER_ROLE, account),
                    balance: await contract.balanceOf(account),
                }

                delete club.id

                clubsAcc.push(club)
                mintBurnQtyAcc[club.name] = 0
            }

            setClubs(clubsAcc)
            setMintBurnQty(mintBurnQtyAcc)

            setClubsLoaded(true)
        }

        setupContracts()
    }, [library, chainId, account, clubsInfo])

    if (!clubsLoaded) {
        return (
            <div className='h-full flex justify-center items-center'>
                <Spin/>
            </div>
        )
    }

    const handleMint = async club => {
        if (!mintBurnQty[club.name]) {
            message.error('Enter a valid quantity to Mint')
            return
        }

        await club.contract
            .mint(account, utils.parseEther(mintBurnQty[club.name].toString()))
    }

    const handleBurn = async club => {
        if (!mintBurnQty[club.name]) {
            message.error('Enter a valid quantity to Burn')
            return
        }

        await club.contract.burn(utils.parseEther(mintBurnQty[club.name].toString()))
    }

    const handleApprove = async club => {
        await club.contract.becomeMinter()
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
                        extra={<Balance qty={club.totalSupply} symbol={club.symbol} text='Total Supply' stacked/>}
                        key={club.name}
                    >
                        <div className='flex flex-col space-y-4'>
                            <Input
                                value={mintBurnQty[club.name]}
                                onChange={e => {
                                    if (!e.target.value) setMintBurnQty({...mintBurnQty, [club.name]: null})
                                    else setMintBurnQty({...mintBurnQty, [club.name]: Number(e.target.value)} )
                                }}
                                min={0}
                                type='number'
                                suffix={<Balance qty={club.balance} symbol={club.symbol}/>}
                                disabled={!club.isMinter}
                            />
                            <div className='flex space-x-4'>
                                {!club.isMinter && (
                                    <Button onClick={() => handleApprove(club)} className='w-full' type='primary' ghost>Approve</Button>
                                )}
                                {club.isMinter && (
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
