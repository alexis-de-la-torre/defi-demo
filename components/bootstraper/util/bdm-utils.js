const axios = require('axios')

const bdmAddr =
  process.env['DATA_MANAGER_ADDR'] || `http://localhost:8080/blockchain-data-manager`

async function post(path, body) {
    return axios.post(bdmAddr + path, body)
}

async function get(path) {
  return axios.get(bdmAddr + path)
}

async function getContract(name) {
  return get(`/contracts/${name}`)
}

async function getTokens() {
  return get('/contracts?abiName=token')
}

async function saveAbi(name, abi) {
  const res = await post('/abis', {name, value: JSON.stringify(abi)})
  return res.data.id
}

async function saveContract(name, {contract, address, abiId}) {

  if (!abiId) {
    abiId = await saveAbi(name, contract.abi)
  }

  if (!address) {
    return post('/contracts', {name, address: contract.address, abiId})
  } else {
    return post('/contracts', {name, address, abiId})
  }
}

module.exports = {saveAbi, saveContract, getTokens, getContract}
