import {useEffect, useState} from "react";

import {Button, Card, Divider, Input, Select, Spin, Statistic} from 'antd'

import {useWeb3React} from "@web3-react/core"
import {ethers, utils} from 'ethers'

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
    const blockchainDataManagerAddr = process.env['BLOCKCHAIN_DATA_MANAGER_ADDR'] || 'http://localhost:8080'

    const clubs = await getClubs(blockchainDataManagerAddr)

    return {
        props: {
            clubs,
        }
    }
}

export default function Home({clubs: rclubs, faucetAddr}) {
    const {chainId, account, library} = useWeb3React()

    const [clubs, setClubs] = useState([])
    const [selectedClub, setSelectedClub] = useState()
    const [mintBurnQty, setMintBurnQty] = useState(0)
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        const setupTokens = async () => {
            if (library) {
                let clubbs = []

                for (const club of rclubs) {
                    const contract = new ethers.Contract(club.address, club.abi, library.getSigner())

                    const MINTER_ROLE = await contract.MINTER_ROLE()

                    const clubb = {
                        meta: club,
                        contract,
                        symbol: await contract.symbol(),
                        totalSupply: await contract.totalSupply(),
                        isMinter: await contract.hasRole(MINTER_ROLE, account)
                    }

                    clubbs.push(clubb)
                }

                setClubs(clubbs)
                setSelectedClub(clubbs[0])

                setBalance(await clubbs[0].contract.balanceOf(account))
            }
        }
        setupTokens()
    }, [library, chainId, account])

    const handleMint = async () => {
        await selectedClub.contract.mint(account, utils.parseEther(mintBurnQty.toString()))
    }

    const handleBurn = async () => {
        await selectedClub.contract.burn(utils.parseEther(mintBurnQty.toString()))
    }

    const handleApprove = async () => {
        await selectedClub.contract.becomeMinter()
    }

    const handleChangeClub = async clubName => {
        const a = clubs.find(c => c.meta.name === clubName)
        await setSelectedClub(a)
        await setBalance(await a.contract.balanceOf(account))
    }

    if (!selectedClub) {
        return <Spin/>
    }

    return (
        <Card title='Mint and Burn'>
            <div className='flex justify-between items-center px-4'>
                <div className='flex flex-col space-y-4'>
                    <div className='flex space-x-4 items-center'>
                        <Select defaultValue={selectedClub.meta.name} onChange={handleChangeClub}>
                            {clubs.map(club => <>
                                <Select.Option value={club.meta.name} key={club.meta.name}>
                                    {club.meta.displayName}
                                </Select.Option>
                            </>)}
                        </Select>
                        <div>
                            <Input
                                value={mintBurnQty}
                                onChange={e => setMintBurnQty(e.target.value)}
                                min={0}
                                type='number'
                                suffix={selectedClub.symbol}
                            />
                        </div>
                    </div>
                    <div className='flex space-x-4'>
                        {!selectedClub.isMinter && <Button onClick={handleApprove}>Approve</Button>}
                        {selectedClub.isMinter && <>
                            <Button onClick={handleMint}>Mint</Button>
                            <Button onClick={handleBurn}>Burn</Button>
                        </>}
                    </div>
                    <Divider/>
                    <Statistic title='Token Address' value={selectedClub.meta.address}/>
                    <div className='flex space-x-8'>
                        <Statistic title='Token Name' value={selectedClub.meta.displayName}/>
                        <Statistic title='Current Balance' value={utils.formatEther(balance)}
                                   suffix={selectedClub.symbol}/>
                        <Statistic
                            title='Total Supply'
                            value={utils.formatEther(selectedClub.totalSupply)}
                            suffix={selectedClub.symbol}
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
