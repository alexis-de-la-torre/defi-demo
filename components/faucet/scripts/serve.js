require("@nomiclabs/hardhat-web3")

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const port = process.env['PORT'] || 8080

app.use(cors())
app.use(bodyParser.json())

app.post('/', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Faucet app listening at http://localhost:${port}`)
})
