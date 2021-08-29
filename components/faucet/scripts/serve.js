require("@nomiclabs/hardhat-web3")

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const actuator = require('express-actuator')

const app = express()
const router = express.Router()

const port = process.env['PORT'] || 8080
const basePath = process.env['BASE_PATH'] || '/faucet'

app.use(cors())
app.use(bodyParser.json())

router.use(actuator())

router.post('/withdrawals', async (req, res) => {
    const {address, qty} = req.body

    if (qty > 10) {
        res.status(422)
        res.send('Can withdraw up to 10 ETH')
        return
    }

    const [deployer] = await ethers.getSigners()

    console.log(`Sending ${qty} ETH to ${address}`)

    deployer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther(qty.toString())
    }).then(() => {
        console.log(`Sucesfully Sent ${qty} ETH to ${address}`)
    })

    res.send(`Sending ${qty} ETH to ${address}`)
})

app.use(basePath, router)

app.listen(port, () => {
    console.log(`Faucet app listening at http://localhost:${port}${basePath}`)
})
