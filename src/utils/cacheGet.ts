import fetch from 'node-fetch'
import { UserTransactionParams } from '../interface/Etherscan'
import { cacheServiceInstance } from './CacheService'
import { CacheValue } from '../interface/CacheService'

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

async function fetchWithRetry(url: string, retries = 5, timeout = 100): Promise<CacheValue | undefined | null> {
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
