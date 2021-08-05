let TestToken = artifacts.require("TestToken")

module.exports = function (cb) {
    async function start() {
        let token = await TestToken.deployed()
        // await token.mint("0xA5c713F475BE55D4dC333d4683D3A2eA7504B725", web3.utils.toWei('100', 'ether'))
        // await token.approve("0xA5c713F475BE55D4dC333d4683D3A2eA7504B725", web3.utils.toWei('100', 'ether'))
        await token.burnFrom("0xA5c713F475BE55D4dC333d4683D3A2eA7504B725", web3.utils.toWei('5', 'ether'))
        cb()
    }

    start()
}
