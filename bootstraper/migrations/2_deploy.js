let TestToken = artifacts.require("TestToken")

module.exports = async deployer => {
    await deployer.deploy(TestToken, "1000")
}
