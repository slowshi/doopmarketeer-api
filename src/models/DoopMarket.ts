import { DOOPMARKET_ADDRESS, DOOPLICATOR_ADDRESS, DOODLE_ADDRESS } from '../utils/constants'
import { abi as DoopmarketABI } from '../abis/DoopmarketABI.json'
import { getContrat } from '../utils/ethersUtils'

interface DoopmarketListing {
  tokenId: string
  value: number
  timeStamp: number
  from: string
  dooplicatorId: string
  to: string
  functionName: string
}
type Listing = [string, [string, string, string], boolean]

const getDoopmarket = async (): Promise<DoopmarketListing[]> => {
  const doopmarketContract = await getContrat(DOOPMARKET_ADDRESS, DoopmarketABI)
  const listing = await doopmarketContract.getListings(DOOPLICATOR_ADDRESS, DOODLE_ADDRESS)
  const jsonStringify = JSON.stringify(listing, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
  const jsonParse = JSON.parse(jsonStringify)

  const result = jsonParse
    .filter((item: Listing) => item[2] === true)
    .map((item: Listing) => {
      return {
        tokenId: item[0],
        value: Number(item[1][0]),
        timeStamp: Number(item[1][1]),
        from: '',
        dooplicatorId: '',
        to: item[1][2],
        functionName: 'dooplicateItem',
      }
    })
    .sort((a: DoopmarketListing, b: DoopmarketListing) => {
      if (a['value'] < b['value']) {
        return -1
      }
      if (a['value'] > b['value']) {
        return 1
      }
      return 0
    })
  return result
}

export { getDoopmarket }
