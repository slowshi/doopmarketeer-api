import { Request, Response } from 'express'
import { getDoopmarket } from '../models/DoopMarket'

const doopmarket = async (req: Request, res: Response) => {
  const response = await getDoopmarket()
  res.json(response)
}

export { doopmarket }
