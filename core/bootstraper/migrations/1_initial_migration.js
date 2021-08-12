const axios = require("axios")

const bip39 = require('bip39')
const {hdkey} = require('ethereumjs-wallet')
const wallet = require('ethereumjs-wallet')

const Migrations = artifacts.require("Migrations")
const TestToken = artifacts.require("TestToken")

module.exports = async function (deployer, network, accounts) {
    const mnemonic = process.env["MNEMONIC"]

    if (mnemonic === undefined) {
        console.log("MNEMONIC env var missing")
        return
    }

    const seed = await bip39.mnemonicToSeed(mnemonic)
    const hdk = hdkey.fromMasterSeed(seed)
    const node = hdk.derivePath("m/44'/60'/0'/0/0")
    const deployerAddr = node.getWallet().getAddressString()
    const deployerPrivateKey = '0x' +
        node.getWallet().getPrivateKey().toString('hex')

    await deployer.deploy(Migrations)

    const testToken = await deployer.deploy(TestToken)

    await testToken.mint(accounts[0], web3.utils.toWei('1000', 'ether'))

    // console.log(accounts[0])
    //
    // console.log("dshajkhdkjsahdkjsa===")

    const deploymentManagerHost = process.env["DEPLOYMENT_MANAGER_HOST"] || "localhost"
    const deploymentManagerPort = process.env["DEPLOYMENT_MANAGER_PORT"] || "8080"

    const deploymentManagerAddr = `http://${deploymentManagerHost}:${deploymentManagerPort}`

    await axios.post(
        `${deploymentManagerAddr}/users`,
        {name: "deployer", address: deployerAddr, privateKey: deployerPrivateKey}
    )
    await axios.post(
        `${deploymentManagerAddr}/contracts`,
        {name: "test-token-contract", address: testToken.address, abi: JSON.stringify(testToken.abi)}
    )
};
