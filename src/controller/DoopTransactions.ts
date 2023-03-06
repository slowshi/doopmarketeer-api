import { Request, Response } from 'express'
import { getDoops, getFeed, getHistory, getLeaderboard } from '../models/DoopTransactions'
import { DOOPLICATION_BLOCK } from '../utils/constants'
import { resolveENS } from '../utils/ethersUtils'

const doops = async (req: Request, res: Response) => {
  const address: string = req.query['address']?.toString() || ''
  if (address === '') {
    res.json({ error: 'No address found' })
    return
  }
  if (address.includes('.eth')) {
    const fullAddress: string | null = await resolveENS(address)
    if (fullAddress === null) {
      res.json({ error: 'No address found' })
      return
    }
    const results = await getDoops(fullAddress)
    res.json(results.transactions)
  } else {
    const results = await getDoops(address)
    res.json(results.transactions)
  }
}

const history = async (req: Request, res: Response) => {
  const limit: number = Number(req.query['limit']) || 5
  let page: number = Number(req.query['page']) || 1
  if (page < 1) {
    page = 1
  }
  const response = await getHistory()
  const results = response.transactions.slice((page - 1) * limit, limit * page)
  res.json(results)
}

const feed = async (req: Request, res: Response) => {
  const startBlock: number = Number(req.query['startBlock']) || DOOPLICATION_BLOCK
  const response = await getFeed(startBlock)
  const results = response.transactions
  res.json(results)
}

const leaderboard = async (req: Request, res: Response) => {
  const response = await getLeaderboard()
  res.json(response)
}

export { doops, history, feed, leaderboard }
