let TestToken = artifacts.require("TestToken")

module.exports = function (cb) {
    // console.log("HDSAJKDHKJSAHDKJSAD")

    async function start() {
        let token = await TestToken.deployed()
        // console.log(token)
        await token.mint("0x25c8f358093629Ff6d7949F2b995E232Aa356357", "5000000000000000000")
        // await token.mint("0x50236416105e7556696B86BA097d42C509Bfe8D1", 500^18)
        console.log(await web3.eth.getAccounts())
        cb()
    }

    start()
}
