const addr = process.env['BLOCKCHAIN_DATA_MANAGER_ADDR']
  || 'http://localhost:8080/blockchain-data-manager'

async function get(route) {
    try {
        const res = await fetch(`${addr}${route}`)
        return await res.json()
    } catch (e) {
        console.log('Unable to get Contract')
        console.error(e)
        return null
    }
}

export async function getAbi(abi) {
    return get(`/abis/${abi}`)
}

export async function getContract(contract) {
    return get(`/contracts/${contract}`)
}

export async function getContractsWithAbi(abiName) {
    return get(`/contracts?abiName=${abiName}`)
}
