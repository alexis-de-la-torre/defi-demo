import '../styles/index.less'
import 'tailwindcss/tailwind.css'

import {useWeb3React, Web3ReactProvider} from "@web3-react/core"
import {Web3Provider} from '@ethersproject/providers'
import {Alert, Button, Divider, Statistic} from "antd";
import {InjectedConnector} from "@web3-react/injected-connector";
import {useEffect, useState} from "react";
import Link from 'next/link'

function getLibrary(provider) {
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
}

function Layout({children}) {
    const {chainId, account, library, activate} = useWeb3React()

    const [blockNumber, setBlockNumber] = useState(0)

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

    return (
        <div className='flex flex-col h-screen'>
            <div className='border-b border-gray-100'>
                <div className='flex justify-between container mx-auto max-w-screen-xl py-4'>
                    <div className='flex items-center space-x-10'>
                        <div className='font-mono font-bold text-lg tracking-wider uppercase'>
                            <Link href='/'><a>💰⚽ Crypto Soccer</a></Link>
                        </div>
                        <Divider type='vertical'/>
                        <div className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'>
                            <Link href='/faucet'><a>Faucet</a></Link>
                        </div>
                    </div>
                    <div className='flex space-x-10 items-center'>
                        {account && <div>{account}</div>}
                        {!account && <Button onClick={connect} type='primary'>Connect</Button>}
                    </div>
                </div>
            </div>
            <div className='flex-1 flex justify-center items-center p-10'>
                <div className='flex-1 flex justify-center items-center p-10'>
                    <div className='container mx-auto max-w-2xl flex flex-col space-y-8'>
                        {!account && (
                            < Alert
                                message="Disconnected"
                                description="Please connect your wallet"
                                type="warning"
                                showIcon
                            />
                        )}
                        {account && children}
                    </div>
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

function MyApp({Component, pageProps}) {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </Web3ReactProvider>
    )
}

export default MyApp
