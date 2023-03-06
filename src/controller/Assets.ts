import { Request, Response } from 'express'
import { getDoodle } from '../models/Doodle'

const assets = async (req: Request, res: Response) => {
  const tokenId: string = req.params['tokenId']?.toString() || ''
  if (tokenId === '') {
    res.json({ error: 'No tokenId found' })
    return
  }

  const response = await getDoodle(tokenId)
  res.json(response)
}

export { assets }
