const Migrations = artifacts.require("Migrations");
let TestToken = artifacts.require("TestToken")

module.exports = async function (deployer) {
  await deployer.deploy(Migrations);
  const instance = await deployer.deploy(TestToken)
  console.log(instance.address)
  console.log(instance.abi)
  console.log(instance.contractName)
};
