import { gql, request } from 'graphql-request'
import { cacheGet } from '../utils/cacheGet'
import {
  DOODLE_METADATA_URL,
  DOOPLICATOR_WEARABLES_URL,
  assumedWearablesMap,
  UNKNOWN_WEARABLE,
} from '../utils/constants'
import {
  DoodleAttribute,
  DoodleMetadata,
  Wearable,
  DooplicatorWearables,
  Doodle,
  AssumedWearableInfo,
} from '../interface/Doodle'

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
          image_uri: UNKNOWN_WEARABLE,
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

export { getDoodle }
