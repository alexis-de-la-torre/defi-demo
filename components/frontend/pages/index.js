import {useEffect, useState} from "react";

import {Button, Card, Divider, Input, InputNumber, Modal, Select, Statistic} from 'antd'

import {useWeb3React} from "@web3-react/core"
import {InjectedConnector} from '@web3-react/injected-connector'
import {ethers, utils} from 'ethers'
import axios from 'axios'

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
    const faucetAddr = process.env['FAUCET_ADDR'] || 'http://localhost:8081'

    const clubs = await getClubs(blockchainDataManagerAddr)

    return {
        props: {
            clubs,
            faucetAddr,
        }
    }
}

export default function Home({clubs: rclubs, faucetAddr}) {
    const {activate, chainId, account, library} = useWeb3React()
    const [blockNumber, setBlockNumber] = useState(0)

    const [clubs, setClubs] = useState([])
    const [selectedClub, setSelectedClub] = useState()

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [withdrawing, setWithdrawing] = useState(false)
    const [signature, setSignature] = useState(null)
    const [mintBurnQty, setMintBurnQty] = useState(0)
    const [faucetQty, setFaucetQty] = useState(0)
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        const setupBlockNumber = async () => {
            if (library) {
                setBlockNumber(await library.getBlockNumber())
            }
        }
        setupBlockNumber()
    }, [library, chainId])

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

    const connect = () => {
        const connector = new InjectedConnector({})
        activate(connector)
    }

    const signMessage = async () => {
        setSignature(null)

        const signature = await library.getSigner(account)
            .signMessage("👋👋")

        setSignature(signature)
        setIsModalVisible(true)
    }

    const handleMint = async () => {
        await selectedClub.contract.mint(account, utils.parseEther(mintBurnQty.toString()))
    }

    const handleBurn = async () => {
        await selectedClub.contract.burn(utils.parseEther(mintBurnQty.toString()))
    }

    const handleApprove = async () => {
        await selectedClub.contract.becomeMinter()
    }

    const handleWithdraw = async () => {
        setWithdrawing(true)

        try {
            await axios.post(`${faucetAddr}/withdrawals`, {address: account, qty: faucetQty})
        } catch (e) {
            console.log('Unable to withdraw from Faucet')
            console.log(e.message)
            console.log(e.response.data)
        }

        setWithdrawing(false)
    }

    const handleChangeClub = async clubName => {
        const a = clubs.find(c => c.meta.name === clubName)
        await setSelectedClub(a)
        await setBalance(await a.contract.balanceOf(account))
    }

    return (
        <div className='flex flex-col h-screen'>
            <div className='border-b border-gray-100'>
                <div className='flex container mx-auto max-w-screen-xl p-4'>
                    <div className='flex-1'/>
                        <div className='flex space-x-10 items-center'>
                            {account && <div>{account}</div>}
                            {!account && <Button onClick={connect} type='primary' size='large'>Connect</Button>}
                        </div>
                </div>
            </div>
            <div className='flex-1 flex justify-center items-center p-10'>
                <div className='container mx-auto max-w-2xl flex flex-col space-y-8'>
                    {account && <>
                        <Card title='Faucet 🥛'>
                            <div className='flex space-x-4'>
                                <InputNumber value={faucetQty} onChange={setFaucetQty} min={0}/>
                                <Button onClick={handleWithdraw} loading={withdrawing}>Get Ether</Button>
                            </div>
                        </Card>
                        {clubs && <>
                            <Card title='Mint and Burn'>
                                {selectedClub && (
                                    <div className='flex justify-between items-center px-4'>
                                        <div className='flex flex-col space-y-4'>
                                            <div className='flex space-x-4 items-center'>
                                                <Select defaultValue={selectedClub.meta.name} onChange={handleChangeClub}>
                                                    {clubs.map(club => <>
                                                        <Select.Option value={club.meta.name} key={club.meta.name}>{club.meta.displayName}</Select.Option>
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
                                                <Statistic title='Current Balance' value={utils.formatEther(balance)} suffix={selectedClub.symbol}/>
                                                <Statistic
                                                    title='Total Supply'
                                                    value={utils.formatEther(selectedClub.totalSupply)}
                                                    suffix={selectedClub.symbol}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </>}
                    </>}
                    {!account && <Card>Please connect your wallet</Card>}
                </div>
            </div>
            <div className='border-t border-gray-100'>
                <div className='flex container mx-auto max-w-screen-xl p-4'>
                    <div className='flex-1'/>
                    <div className='flex space-x-10 items-center'>
                        <Statistic title='Chain ID' value={chainId} prefix='#' groupSeparator=''/>
                        <Statistic title='Block Number' value={blockNumber}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
