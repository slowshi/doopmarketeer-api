import { getBlockNumber } from '../utils/ethersUtils'
import { DOOPLICATION_BLOCK } from '../utils/constants'
import { cacheGet } from '../utils/cacheGet'
import { TransactionResponse } from '../interface/Etherscan'

const userTransactions = async (address: string, page = 1): Promise<TransactionResponse> => {
  const blockNumber = await getBlockNumber()
  const res = await cacheGet('https://api.etherscan.io/api', {
    module: 'account',
    action: 'txlist',
    address,
    startblock: DOOPLICATION_BLOCK,
    endblock: blockNumber,
    page,
    offset: 100,
    apikey: process.env.ETHERSCAN_API_KEY,
  })
  return res as TransactionResponse
}

const contractTransactions = async (
  address: string,
  clearCahce = false,
  page = 1,
  offset = 10000,
  startBlock = DOOPLICATION_BLOCK,
): Promise<TransactionResponse> => {
  const blockNumber = await getBlockNumber()
  const res = await cacheGet(
    'https://api.etherscan.io/api',
    {
      module: 'account',
      action: 'txlist',
      address,
      startblock: startBlock,
      endblock: blockNumber,
      page,
      offset,
      apikey: process.env.ETHERSCAN_API_KEY,
    },
    clearCahce,
  )
  return res as TransactionResponse
}

export { TransactionResponse, userTransactions, contractTransactions }
