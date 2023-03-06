import * as dotenv from 'dotenv'
dotenv.config()
import fetch, { HeadersInit } from 'node-fetch'
import { BodyFilter, GemResponse } from '../interface/Gem'

const getGemAssets = async (filters: BodyFilter, page = 1, limit = 5): Promise<GemResponse[]> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    origin: 'https://www.gem.xyz',
    referer: 'https://www.gem.xyz/',
    'x-api-key': process.env.GEM_API_KEY || '',
  }
  const body = {
    filters: filters,
    sort: {
      currentEthPrice: 'asc',
    },
    fields: {
      id: 1,
      tokenId: 1,
      priceInfo: 1,
      currentBasePrice: 1,
      paymentToken: 1,
      marketUrl: 1,
      supportsWyvern: 1,
    },
    offset: (page - 1) * limit,
    limit: limit,
    status: ['buy_now'],
  }

  const response = await fetch('https://api-v2-1.gemlabs.xyz/assets', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: headers,
  })
  const responseJSON = await response.json()
  return responseJSON.data
}

export { getGemAssets }
