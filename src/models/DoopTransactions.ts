import { doopContracts, DOOPLICATOR_ADDRESS, DOOPMARKET_ADDRESS } from '../utils/constants'
import { Decoder } from 'ts-abi-decoder'
import { userTransactions, contractTransactions } from './Etherscan'
import { Transaction } from '../interface/Etherscan'
import {
  DecodedInfo,
  DoopTransactionInfo,
  DoopResponse,
  LeaderboardUser,
  LeaderboardMap,
} from '../interface/DoopTransactions'

const blockSortDesc = (a: { blockNumber: number }, b: { blockNumber: number }) => {
  if (a['blockNumber'] > b['blockNumber']) {
    return -1
  }
  if (a['blockNumber'] < b['blockNumber']) {
    return 1
  }
  return 0
}

const formatTransactionResponse = (transactions: Transaction[]): DoopTransactionInfo[] => {
  return transactions
    .filter((transaction: Transaction) => {
      return (
        [DOOPMARKET_ADDRESS, DOOPLICATOR_ADDRESS].indexOf(transaction.to) > -1 &&
        transaction.functionName.substring(0, 10) === 'dooplicate' &&
        transaction.isError === '0'
      )
    })
    .map((transaction) => {
      Decoder.addABI(doopContracts[transaction.to])
      const decodedData = Decoder.decodeData(transaction.input)
      const info = [...decodedData.params].reduce((acc, param): DecodedInfo => {
        const names = ['tokenId', 'dooplicatorId', 'addressOnTheOtherSide']
        if (names.indexOf(param.name) > -1) {
          acc = {
            ...acc,
            [param.name]: param.value,
          }
        }
        return acc
      }, {} as DecodedInfo)

      return {
        blockNumber: Number(transaction.blockNumber),
        timeStamp: Number(transaction.timeStamp),
        from: transaction.from,
        hash: transaction.hash,
        value: transaction.value,
        gas: transaction.gas,
        to: transaction.to,
        gasPrice: transaction.gasPrice,
        cumulativeGasUsed: transaction.cumulativeGasUsed,
        functionName: decodedData?.name,
        tokenId: info.tokenId,
        dooplicatorId: info.dooplicatorId,
        addressOnTheOtherSide: info.addressOnTheOtherSide,
      }
    })
    .sort(blockSortDesc)
}

const formatLeaderboard = (transactions: Transaction[]): LeaderboardUser[] => {
  const leaderboard: LeaderboardMap = transactions.reduce((acc: LeaderboardMap, item: Transaction) => {
    let user: LeaderboardUser = {
      timeStamp: 0,
      address: '',
      dooplicate: 0,
      dooplicateItem: 0,
      value: 0,
    }
    if (typeof acc[item.from] === 'undefined') {
      user = {
        timeStamp: Number(item.timeStamp),
        address: item.from,
        dooplicate: item.functionName.substring(0, 10) === 'dooplicate' ? 1 : 0,
        dooplicateItem: item.functionName.substring(0, 10) === 'dooplicateItem' ? 1 : 0,
        value: Number(item.value),
      }
    } else {
      const existingUser: LeaderboardUser = acc[item.from]
      const itemTimestamp = Number(item.timeStamp)
      user = {
        ...existingUser,
        timeStamp: existingUser.timeStamp >= itemTimestamp ? existingUser.timeStamp : itemTimestamp,
        value: Number(existingUser.value) + Number(item.value),
        dooplicate:
          item.functionName.substring(0, 10) === 'dooplicate' ? existingUser.dooplicate + 1 : existingUser.dooplicate,
        dooplicateItem:
          item.functionName.substring(0, 10) === 'dooplicateItem'
            ? existingUser.dooplicateItem + 1
            : existingUser.dooplicateItem,
      }
    }
    acc = {
      ...acc,
      [item.from]: user,
    }
    return acc
  }, {} as LeaderboardMap)

  return Object.values(leaderboard)
}

const getDoops = async (address: string): Promise<DoopResponse> => {
  let allResults: Transaction[] = []
  let newResults: Transaction[] = []
  let page = 1
  while (newResults.length > 0 || page === 1) {
    const res = await userTransactions(address, page)
    newResults = res.result
    allResults = [...allResults, ...newResults]
    page++
  }
  const transactions: DoopTransactionInfo[] = formatTransactionResponse(allResults)

  return { transactions }
}

const getHistory = async (): Promise<DoopResponse> => {
  const doopResponse = await contractTransactions(DOOPLICATOR_ADDRESS)
  const marketResponse = await contractTransactions(DOOPMARKET_ADDRESS)
  const doopResults: Transaction[] = doopResponse.result
  const marketResults: Transaction[] = marketResponse.result
  const transactions: DoopTransactionInfo[] = formatTransactionResponse([...doopResults, ...marketResults])
  return { transactions }
}

const getFeed = async (startBlock: number): Promise<DoopResponse> => {
  const doopResponse = await contractTransactions(DOOPLICATOR_ADDRESS, true, 1, 100, startBlock + 1)
  const marketResponse = await contractTransactions(DOOPMARKET_ADDRESS, true, 1, 100, startBlock + 1)
  const doopResults: Transaction[] = doopResponse.result
  const marketResults: Transaction[] = marketResponse.result
  const transactions: DoopTransactionInfo[] = formatTransactionResponse([...doopResults, ...marketResults])
  return { transactions }
}

const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const doopResponse = await contractTransactions(DOOPLICATOR_ADDRESS, true)
  const marketResponse = await contractTransactions(DOOPMARKET_ADDRESS, true)
  const doopResults: Transaction[] = doopResponse.result
  const marketResults: Transaction[] = marketResponse.result
  const transactions: LeaderboardUser[] = formatLeaderboard([...doopResults, ...marketResults])
  return transactions
}

export { getDoops, getHistory, getFeed, getLeaderboard }
