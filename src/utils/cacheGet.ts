import { TransactionResponse, UserTransactionParams } from '../models/Etherscan'
import fetch from 'node-fetch'
import { DoodleMetadata, DooplicatorWearables } from '../models/Doodle'

type CacheValue = TransactionResponse | DoodleMetadata | DooplicatorWearables | null | undefined
type CacheIntem = {
  value: CacheValue
  timestamp: number
}
class CacheService {
  private cache = new Map<string, CacheIntem>()

  public has(key: string): boolean {
    return this.cache.has(key)
  }

  public set(key: string, value: CacheValue): Map<string, CacheIntem> {
    const setObj = {
      value,
      timestamp: Date.now(),
    }
    return this.cache.set(key, setObj)
  }

  public get(key: string): CacheValue | null {
    const item = this.cache.get(key)
    if (typeof item === 'undefined') {
      return null
    }
    return item.value
  }

  public delete(key: string): boolean {
    return this.cache.delete(key)
  }

  public clear(): void {
    this.cache.clear()
  }

  public isExpired(key: string, seconds: number): boolean {
    const item = this.cache.get(key)
    if (typeof item === 'undefined') {
      return true
    }
    return (Date.now() - item.timestamp) / 1000 > seconds
  }
}

const cacheServiceInstance = new CacheService()
type ParamTypes = UserTransactionParams | undefined | null
async function cacheGet(url: string, params?: ParamTypes, clearCache = false): Promise<CacheValue> {
  let key = url
  if (typeof params !== 'undefined' && params !== null) {
    const paramsObject = Object.fromEntries(Array.from(Object.entries(params)))
    key = `${url}?${new URLSearchParams(paramsObject)}`
  }
  //we bust cache
  // clearCache = true;
  if (
    cacheServiceInstance.has(key) &&
    !cacheServiceInstance.isExpired(key, 300) &&
    !clearCache &&
    cacheServiceInstance.get(key)
  ) {
    return cacheServiceInstance.get(key)
  }
  const response = await fetchWithRetry(key)
  cacheServiceInstance.set(key, response)
  return response
}

async function fetchWithRetry(url: string, retries = 3, timeout = 50): Promise<CacheValue | undefined | null> {
  try {
    const response = await fetch(url)
    return await response.json()
  } catch (error: any) {
    if (retries > 0) {
      console.error(`Failed to fetch data: ${error.message}. Retrying...`)
      await new Promise((resolve) => setTimeout(resolve, timeout))
      return await fetchWithRetry(url, retries - 1)
    } else {
      throw error
    }
  }
}

export { cacheServiceInstance, cacheGet }
