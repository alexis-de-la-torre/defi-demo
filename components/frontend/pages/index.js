import {useEffect, useState} from "react";

import {Avatar, Button, Card, DatePicker, Modal, Rate, Statistic} from 'antd'

import {useWeb3React, Web3ReactProvider} from "@web3-react/core"
import {InjectedConnector} from '@web3-react/injected-connector'

export default function Home() {
    const {activate, deactivate, chainId, account, library} = useWeb3React()
    const [blockNumber, setBlockNumber] = useState(0)
    const [signature, setSignature] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const [connector, setConnector] = useState()

    useEffect(() => {
        const setupBlockNumber = async () => {
            if (library) {
                setBlockNumber(await library.getBlockNumber())
            }
        }
        setupBlockNumber()
    }, [library, chainId])

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

    return (
        <div className='flex flex-col h-screen'>
            <div className='border-b border-gray-100'>
                <div className='flex container mx-auto max-w-screen-xl p-4'>
                    <div className='flex-1'/>
                    {account && <div>{account}</div>}
                    {!account && <Button onClick={connect}>Connect</Button>}
                </div>
            </div>
            <div className='flex-1 flex justify-center items-center'>
                <div className='container mx-auto max-w-2xl flex flex-col space-y-8'>
                    {account && <>
                        <Card>
                            <div className='flex space-x-10'>
                                <Statistic title='Chain ID' value={chainId}/>
                                <Statistic title='Block Number' value={blockNumber}/>
                            </div>
                        </Card>
                        <Card title='Sign Message'>
                            <p className='text-lg'>Message: 👋👋</p>
                            <Button onClick={signMessage} type='primary' size='large'>Sign</Button>
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
