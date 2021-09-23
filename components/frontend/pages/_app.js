import '../styles/index.less'
import 'tailwindcss/tailwind.css'

import {useWeb3React, Web3ReactProvider} from "@web3-react/core"
import {Web3Provider} from '@ethersproject/providers'
import {Alert, Button, Divider, Spin, Statistic} from "antd";
import {InjectedConnector} from "@web3-react/injected-connector";
import {createContext, useCallback, useContext, useEffect, useState} from "react";
import Link from 'next/link'
import CenteredContainer from "../components/CenteredContainer";

export const Context = createContext()

function getLibrary(provider) {
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
}

function Layout({children}) {
    const {blockNumber, setBlockNumber} = useContext(Context)

    const {chainId, account, library, activate, active} = useWeb3React()

    const connect = useCallback(() => {
        const connector = new InjectedConnector({})
        activate(connector)
    }, [activate])

    useEffect(() => connect(), [connect])

    useEffect(() => {
        if (library) {
            const interval = setInterval(() => {
                library.getBlockNumber()
                    .then(setBlockNumber)
            }, 5000);

            return () => {
                clearInterval(interval)
            }
        }
    }, [library, setBlockNumber])

    return (
        <div className='flex flex-col h-screen'>
            <div className='border-b border-gray-100'>
                <div className='flex justify-between container mx-auto max-w-screen-xl py-6'>
                    <div className='flex items-center space-x-10'>
                        <div className='font-mono font-bold text-lg tracking-wider uppercase'>
                            <Link href='/'><a>💰🧪 DeFi Demo</a></Link>
                        </div>
                        <div>
                            <Divider type='vertical'/>
                        </div>
                        <div className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'>
                            <Link href='/'><a>Mint</a></Link>
                        </div>
                        <div className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'>
                            <Link href='/swap'><a>Swap</a></Link>
                        </div>
                        <div className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'>
                            <Link href='/lps'><a>Liquidity Pools</a></Link>
                        </div>
                        <div className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'>
                            <Link href='/faucet'><a>Faucet</a></Link>
                        </div>
                    </div>
                    <div className='flex space-x-10 items-center'>
                        {account && <div className='text-gray-600 font-mono text-xs'>{account}</div>}
                        {!account && <Button onClick={connect} type='primary'>Connect</Button>}
                    </div>
                </div>
            </div>
            <div className='flex-1'>
                {!active && account && (
                    <div className='h-full flex items-center justify-center bg-gray-50'>
                        <Spin size='large'/>
                    </div>
                )}
                {!active && !account && (
                    <CenteredContainer>
                        < Alert
                            message="Disconnected"
                            description="Please connect your wallet"
                            type="warning"
                            showIcon
                        />
                    </CenteredContainer>
                )}
                {account && children}
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
    const [blockNumber, setBlockNumber] = useState(0)

    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <Context.Provider value={{blockNumber, setBlockNumber}}>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </Context.Provider>
        </Web3ReactProvider>
    )
}

export default MyApp
