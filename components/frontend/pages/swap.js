import {getAbi, getContract, getContractsWithAbi} from "../utils/bdmUtil.js"
import {Avatar, Button, Card, Divider, Input, InputNumber, Select, Spin} from "antd"
import CenteredContainer from "../components/CenteredContainer.js"
import {useWeb3React} from "@web3-react/core"
import {BigNumber, constants, Contract, utils} from "ethers"
import {Context} from "./_app.js"
import {useContext, useEffect, useState} from "react"

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

function SwapItem({tokens, title, selectedToken, qty, onChange}) {
    return (
      <div className='flex flex-col'>
          <div className='text-lg mb-2'>{title}</div>
          <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-4 border px-4'>
                  <div><Avatar src={`/defi-demo/images/${selectedToken.name}.webp`}/></div>
                  <div className='w-40'>
                      <Select
                        defaultValue={selectedToken.name}
                        onChange={value => onChange({token: tokens.find(t => t.name === value), qty})}
                        size='large'
                        bordered={false}
                      >
                          {tokens.map(token => (
                            <Select.Option value={token.name} key={token.name}>
                                <div className='flex flex-col'>
                                    <div className=''>{token.symbol}</div>
                                    <div className='text-xs'>{token.displayName}</div>
                                </div>
                            </Select.Option>
                          ))}
                      </Select>
                  </div>
              </div>
              <InputNumber
                value={qty}
                onChange={value =>
                  onChange({token: selectedToken, qty: value})}
                size='large'
              />
          </div>
          <div className='ml-auto'>
              <button onClick={() =>
                onChange({token: selectedToken, qty: Number(utils.formatEther(selectedToken.balance))})}>
                  <Balance qty={selectedToken.balance} symbol={selectedToken.symbol}/>
              </button>
          </div>
      </div>
    )
}

export async function getServerSideProps() {
    // TODO: Handle errors

    const tokensDto = await getContractsWithAbi('token')
    const tokenAbi = await getAbi('token')
    const routerDto = await getContract('router')
    const routerAbi = await getAbi('router')
    const wethDto = await getContract('weth')

    return {
        props: {
            tokensDto,
            tokenAbi,
            routerDto,
            routerAbi,
            wethDto,
        }
    }
}

export default function Lps({tokensDto, tokenAbi, routerDto, routerAbi, wethDto}) {
    const {blockNumber} = useContext(Context)

    const {chainId, account, library} = useWeb3React()

    const [tokens, setTokens] = useState()
    const [tokenContracts, setTokenContracts] = useState()

    const [routerContract, setRouterContract] = useState()

    const [fromToken, setFromToken] = useState()
    const [toToken, setToToken] = useState()
    const [fromQty, setFromQty] = useState(0)
    const [toQty, setToQty] = useState(0)

    useEffect(() => {
        if (!library) return

        const setupTokenContracts = async () => {
            let contractsAgg = {}

            for (const tokenDto of tokensDto) {
                contractsAgg[tokenDto.name] =
                  new Contract(tokenDto.address, tokenAbi.value, library.getSigner())
            }

            setTokenContracts(contractsAgg)
        }

        setupTokenContracts()
    }, [tokensDto, tokenAbi, library, account, chainId])

    useEffect(() => {
        if (!library) return

        const setupRouterContract = async () => {
            setRouterContract(
              new Contract(routerDto.address, routerAbi.value, library.getSigner()))
        }

        setupRouterContract()
    }, [routerDto, routerAbi, library, account, chainId])

    useEffect(() => {
        if (!tokenContracts) return

        const setupTokens = async () => {
            let tokensAgg = []

            for (const tokenDto of tokensDto) {
                const tokenContract = tokenContracts[tokenDto.name]

                const isApproved = (await tokenContract.allowance(account, routerDto.address))
                  .gt(BigNumber.from(0))

                const token = {
                    name: tokenDto.name,
                    address: tokenDto.address,
                    displayName: await tokenContract.name(),
                    symbol: await tokenContract.symbol(),
                    balance: await tokenContract.balanceOf(account),
                    isApproved
                }

                tokensAgg.push(token)
            }

            setFromToken(tokensAgg[0])
            setToToken(tokensAgg[1])
            setTokens(tokensAgg)
        }

        setupTokens()
    }, [tokensDto, tokenContracts, account, chainId, blockNumber])

    useEffect(() => {

    }, [fromToken, fromQty])

    const handleSwap = async () => {
        await routerContract.swapExactTokensForTokens(
            utils.parseEther(fromQty.toString()),
            0,
            [fromToken.address, wethDto.address, toToken.address],
            account,
            constants.MaxUint256
        )
    }

    const handleApprove = async () => {
        await tokenContracts[fromToken.name].approve(
          routerDto.address, constants.MaxUint256)
    }

    const handleFromChange = async ({qty, token}) => {
        if (qty === null) return

        setFromQty(qty)
        setFromToken(token)

        if (qty > 0) {
            const amtOut = await routerContract.getAmountsOut(
              await utils.parseEther(qty.toString()),
              [fromToken.address, wethDto.address, toToken.address])

            setToQty(utils.formatEther(amtOut[2]))
        } else {
            setToQty(0)
        }

    }

    const handleToChange = async ({qty, token}) => {
        if (qty === null) return

        setToQty(qty)
        setToToken(token)

        if (qty > 0) {
            const amtOut = await routerContract.getAmountsOut(
              await utils.parseEther(qty.toString()),
              [toToken.address, wethDto.address, fromToken.address])

            setFromQty(utils.formatEther(amtOut[2]))
        } else {
            setFromQty(0)
        }
    }

    return (
      <CenteredContainer>
          {tokens && (
            <Card>
                <div className='flex flex-col space-y-6'>
                    <SwapItem title='Swap From:' tokens={tokens} selectedToken={fromToken} qty={fromQty} onChange={handleFromChange}/>
                    <Divider><div className='text-2xl'>👇</div></Divider>
                    <SwapItem title='Swap to (est.):' tokens={tokens} selectedToken={toToken} qty={toQty} onChange={handleToChange}/>
                    {fromToken && fromToken.isApproved && fromToken.balance.lt(utils.parseEther(fromQty.toString())) &&
                        <Button type='primary' size='large' disabled>Not Enough Balance</Button>}
                    {fromToken && fromToken.isApproved && fromToken.balance.gte(utils.parseEther(fromQty.toString())) &&
                        <Button type='primary' size='large' onClick={handleSwap}>Swap</Button>}
                    {fromToken && !fromToken.isApproved &&
                        <Button type='primary' size='large' onClick={handleApprove}>Approve {fromToken.symbol}</Button>}
                </div>
            </Card>
          )}
      </CenteredContainer>
    )
}
