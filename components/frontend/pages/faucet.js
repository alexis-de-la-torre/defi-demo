import {Button, Card, InputNumber} from "antd";
import {useState} from "react";
import axios from "axios";
import {useWeb3React} from "@web3-react/core";
import CenteredContainer from "../components/CenteredContainer";

export async function getServerSideProps() {
    const faucetAddr = process.env['FAUCET_ADDR'] || 'http://localhost:8081'

    return {
        props: {
            faucetAddr,
        }
    }
}

export default function Faucet({faucetAddr}) {
    const {account} = useWeb3React()

    const [faucetQty, setFaucetQty] = useState(0)
    const [withdrawing, setWithdrawing] = useState(false)

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

    return (
        <CenteredContainer>
            <Card title='Faucet'>
                <div className='flex space-x-4'>
                    <InputNumber value={faucetQty} onChange={setFaucetQty} min={0}/>
                    <Button onClick={handleWithdraw} loading={withdrawing}>Get Ether</Button>
                </div>
            </Card>
        </CenteredContainer>
    )
}
