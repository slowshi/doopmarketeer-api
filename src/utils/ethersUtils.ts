import { JsonRpcProvider } from 'ethers'
import { ETHEREUM_RPC_URL } from './constants'

const resolveENS = async (name: string) => {
  const provider = new JsonRpcProvider(ETHEREUM_RPC_URL)
  return await provider.resolveName(name)
}

const getBlockNumber = async () => {
  const provider = new JsonRpcProvider(ETHEREUM_RPC_URL)
  return await provider.getBlockNumber()
}

export { resolveENS, getBlockNumber }
