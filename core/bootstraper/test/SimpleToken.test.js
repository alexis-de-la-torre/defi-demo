let TestToken = artifacts.require("TestToken")

contract("TestToken", accounts => {
    it("should put 1000 TEST in account 1 and account 2", async () => {
        let token = await TestToken.deployed()

        await token.mint(accounts[0], 1000)
        await token.mint(accounts[1], 1000)

        assert.equal(await token.balanceOf(accounts[0]), 1000)
        assert.equal(await token.balanceOf(accounts[1]), 1000)
    })
})
