import {useEffect, useState} from "react";

import {Button, Card, InputNumber, Modal, Select, Statistic} from 'antd'

import {useWeb3React} from "@web3-react/core"
import {InjectedConnector} from '@web3-react/injected-connector'
import {ethers, utils} from 'ethers'
import axios from 'axios'

const blockchainDataManagerAddr = process.env['BLOCKCHAIN_DATA_MANAGER_ADDR'] || 'http://localhost:8080'
const faucetAddr = process.env['FAUCET_ADDR'] || 'http://localhost:8081'

async function getFaucetContract() {
    try {
        const res = await fetch(`${blockchainDataManagerAddr}/clubs/faucet`)
        return await res.json()
    } catch (e) {
        console.log('Unable to get Token Contract')
        console.error(e)
        return null
    }
}

async function getTestContract() {
    try {
        const res = await fetch(`${blockchainDataManagerAddr}/clubs/test-club`)
        return await res.json()
    } catch (e) {
        console.log('Unable to get Token Contract')
        console.error(e)
        return null
    }
}

export async function getServerSideProps() {
    const testClub = await getTestContract()
    const faucet = await getFaucetContract()

    return {
        props: {
            testClub,
            faucet
        }
    }
}

export default function Home({testClub, faucet}) {
    const {activate, chainId, account, library} = useWeb3React()
    const [blockNumber, setBlockNumber] = useState(0)

    const [testClubContract, setTestClubContract] = useState()
    const [testClubSymbol, setTestClubSymbol] = useState("")
    const [testClubTotalSupply, setTestClubTotalSupply] = useState(0)

    const [faucetContract, setFaucetContract] = useState()

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [withdrawing, setWithdrawing] = useState(false)
    const [signature, setSignature] = useState(null)
    const [mintBurnQty, setMintBurnQty] = useState(0)
    const [faucetQty, setFaucetQty] = useState(0)

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
                const testClubContract = new ethers.Contract(testClub.address, testClub.abi, library.getSigner())
                setTestClubContract(testClubContract)
                setTestClubSymbol(await testClubContract.symbol())
                setTestClubTotalSupply(await testClubContract.totalSupply())

                const faucetContract = new ethers.Contract(faucet.address, faucet.abi, library.getSigner())
                setFaucetContract(faucetContract)

                console.log(faucetContract)
            }
        }
        setupTokens()
    }, [library])

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
        await testClubContract.mint(account, utils.parseEther(mintBurnQty.toString()))
    }

    const handleBurn = async () => {
        await testClubContract.burn(utils.parseEther(mintBurnQty.toString()))
    }

    const handleApprove = async () => {
        await testClubContract.becomeMinter()
    }

    const handleWithdraw = async () => {
        setWithdrawing(true)

        try {
            await axios.post(faucetAddr, {address: account, qty: faucetQty})
        } catch (e) {
            console.log('Unable to withdraw from Faucet')
            console.log(e.message)
            console.log(e.response.data)
        }

        setWithdrawing(false)
    }

    return (
        <div className='flex flex-col h-screen'>
            <div className='border-b border-gray-100'>
                <div className='flex container mx-auto max-w-screen-xl p-4'>
                    <div className='flex-1'/>
                    {account && <div>{account}</div>}
                    {!account && <Button onClick={connect}>Connect</Button>}
                </div>
            </div>
            <div className='flex-1 flex justify-center items-center p-10'>
                <div className='container mx-auto max-w-2xl flex flex-col space-y-8'>
                    {account && <>
                        <Card title='Information'>
                            <div className='flex space-x-10'>
                                <Statistic title='Chain ID' value={chainId}/>
                                <Statistic title='Block Number' value={blockNumber}/>
                            </div>
                        </Card>
                        <Card title='Faucet 🥛'>
                            <div className='flex space-x-4'>
                                <InputNumber value={faucetQty} onChange={setFaucetQty} min={0}/>
                                <Button onClick={handleWithdraw} loading={withdrawing}>Get Ether</Button>
                            </div>
                        </Card>
                        {testClub && <>
                            <Card title='Mint and Burn'>
                                <div className='flex justify-between items-center px-4'>
                                    <div className='flex flex-col space-y-4'>
                                        <div className='flex space-x-4 items-center'>
                                            <Select defaultValue={testClub.name}>
                                                <Select.Option value={testClub.name}>{testClub.displayName}</Select.Option>
                                            </Select>
                                            <InputNumber
                                                value={mintBurnQty}
                                                onChange={setMintBurnQty}
                                                min={0}
                                            />
                                            <div className='text-xs'>{testClubSymbol}</div>
                                        </div>
                                        <div className='flex space-x-4'>
                                            <Button onClick={handleApprove}>Approve</Button>
                                            <Button onClick={handleMint}>Mint</Button>
                                            <Button onClick={handleBurn}>Burn</Button>
                                        </div>
                                    </div>
                                    <div className='flex space-x-8'>
                                        <Statistic title='Token Name' value={testClub.displayName}/>
                                        <Statistic title='Total Supply' value={utils.formatEther(testClubTotalSupply)} suffix={testClubSymbol}/>
                                    </div>
                                </div>
                            </Card>
                        </>}
                        <Card title='Sign Message'>
                            <div className='flex flex-col space-y-4'>
                                <div className='text-lg'>Message: 👋👋</div>
                                <div><Button onClick={signMessage}>Sign</Button></div>
                            </div>
                        </Card>
                    </>}
                    {!account && <Card>Please connect your wallet</Card>}
                </div>
            </div>
            <Modal
                title='Signature'
                visible={isModalVisible}
                onOk={() => setIsModalVisible(false)}
            >
                {signature}
            </Modal>
        </div>
    )
}
