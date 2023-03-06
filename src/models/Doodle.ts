import { gql, request } from 'graphql-request'
import { cacheGet } from '../utils/cacheGet'
import {
  DOODLE_METADATA_URL,
  DOOPLICATOR_WEARABLES_URL,
  assumedWearablesMap,
  AssumedWearableInfo,
} from '../utils/constants'
interface DoodleAttribute {
  trait_type: string
  value: string
}
interface DoodleMetadata {
  image: string
  name: string
  description: string
  attributes: DoodleAttribute[]
}
interface Wearable {
  wearable_id?: string
  ipfs_hash?: string
  name?: string
  trim?: string
  set?: string
  hidden?: boolean
  position?: string
  plurality?: boolean
  ipfs_hash_svg?: string
  image_uri: string
}
interface DooplicatorWearables {
  wearables: Wearable[]
}
interface Doodle {
  image: string
  name: string
  description: string
  attributes: {
    trait_type: string
    value: string
  }[]
  wearables: Wearable[]
  costs: {
    editionID: string
    name: string
    description: string
    activeListing: {
      vaultType: string
      price: number
    }
  }[]
}
const getDoodle = async (tokenId: string): Promise<Doodle> => {
  const doodleResponse = (await cacheGet(`${DOODLE_METADATA_URL}/${tokenId}`)) as DoodleMetadata
  const wearablesResponse = (await cacheGet(`${DOOPLICATOR_WEARABLES_URL}/${tokenId}`)) as DooplicatorWearables
  const assumed = doodleResponse.attributes.reduce((acc: AssumedWearableInfo[], item: DoodleAttribute) => {
    let ids = assumedWearablesMap[item.value]
    if (typeof ids === 'undefined') ids = []
    return [...acc, ...ids]
  }, [])
  let assumedIndex = 0
  const wearables = wearablesResponse.wearables.map((wearable: Wearable) => {
    if (typeof wearable.wearable_id === 'undefined') {
      if (assumedIndex < assumed.length) {
        const assumedWearable = assumed[assumedIndex]
        assumedIndex++
        return {
          ...assumedWearable,
        }
      } else {
        return {
          image_uri: 'https://doodles.app/images/dooplicator/missingDood.png',
        }
      }
    }
    return wearable
  })

  const query = gql`
    query SearchMarketplaceNFTs($input: SearchMarketplaceNFTsInputV2!) {
      searchMarketplaceNFTsV2(input: $input) {
        marketplaceNFTs {
          editionID
          name
          description
          activeListing {
            vaultType
            price
          }
        }
        totalResults
      }
    }
  `
  const costPromises = wearables
    .filter((item) => typeof item.wearable_id !== 'undefined')
    .map((item) => {
      const collectionId = item.wearable_id !== '244' ? 'doodleswearables' : 'doodlesbetapass'
      const variables = {
        input: {
          collectionID: collectionId,
          editionID: item.wearable_id,
          forSale: true,
          limit: 1,
          orderBy: 'price_asc',
        },
      }
      return request('https://api-v2.ongaia.com/graphql/', query, variables)
    })
  const costs = await Promise.all(costPromises)
  const costResponse = costs.map((cost) => cost['searchMarketplaceNFTsV2']['marketplaceNFTs'][0])
  return {
    ...doodleResponse,
    wearables,
    costs: costResponse,
  }
}
export { getDoodle, DoodleMetadata, DooplicatorWearables, Wearable }
