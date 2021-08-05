const axios = require("axios")

const Migrations = artifacts.require("Migrations");
const TestToken = artifacts.require("TestToken")

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Migrations)
  const testToken = await deployer.deploy(TestToken)

  const deploymentManagerHost = process.env["DEPLOYMENT_MANAGER_HOST"] || "localhost"
  const deploymentManagerPort = process.env["DEPLOYMENT_MANAGER_PORT"] || "8080"

  const deploymentManagerAddr = `http://${deploymentManagerHost}:${deploymentManagerPort}`

  await axios.post(
      `${deploymentManagerAddr}/contracts`,
      { name: "deployer", address: accounts[0], abi: "" }
  )
  await axios.post(
      `${deploymentManagerAddr}/contracts`,
      { name: "test-token-contract", address: testToken.address, abi: JSON.stringify(testToken.abi) }
  )
};
