import { cacheGet } from '../utils/cacheGet'
import { DOOPLICATOR_WEARABLES_URL } from '../utils/constants'
import { DooplicatorWearables, Wearable } from './Doodle'
import { GemResponse, getGemAssets } from './Gem'
interface UndoopedDoodle {
  tokenId: string
  marketUrl: string
  currentBasePrice: number
  supportsWyvern: boolean
}
const getUndoopedDoodles = async (page: number, limit = 20): Promise<UndoopedDoodle[]> => {
  const filters = {
    slug: 'doodles-official',
  }
  const response = await getGemAssets(filters, page, limit)
  let undooped: UndoopedDoodle[] = []
  for (let i = 0; i < response.length; i++) {
    const { tokenId, marketUrl, currentBasePrice, supportsWyvern } = response[i]
    const wearablesResponse = (await cacheGet(`${DOOPLICATOR_WEARABLES_URL}/${tokenId}`)) as DooplicatorWearables
    const isDooplicated =
      wearablesResponse.wearables.filter((wearable: Wearable) => typeof wearable.wearable_id === 'undefined').length ===
      0
    if (!isDooplicated) {
      undooped = [...undooped, { tokenId, marketUrl, currentBasePrice, supportsWyvern }]
    }
  }
  return undooped
}
const getUndoopedDooplicator = async (rarity: number): Promise<GemResponse[]> => {
  const rarityMap = ['very common', 'common', 'rare']
  const filters = {
    slug: 'the-dooplicator',
    traits: {
      Rarity: [`${rarityMap[rarity]}`],
      'OG Wearables charge': ['available'],
    },
  }
  const response = await getGemAssets(filters)
  return response
}

export { getUndoopedDoodles, getUndoopedDooplicator }
