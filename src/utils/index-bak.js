try {
  const dotenv = require('dotenv').config()
} catch (_) {}
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const { body, query } = require('express-validator')
const abiDecoder = require('abi-decoder')
const app = express()
const PORT = process.env.PORT || 8000
const {
  doopContracts,
  assumedWearablesMap,
  IPFS_DOMAIN,
  DOOPLICATOR_ADDRESS,
  DOOPMARKET_ADDRESS,
  DOODLE_ADDRESS,
  DOOPLICATION_BLOCK,
  ETHEREUM_RPC_URL,
} = require('./constants')
const { cacheServiceInstance } = require('./cacheService')
const { ethers, JsonRpcProvider, Contract } = require('ethers')
const { request, gql } = require('graphql-request')
const { abi: DoopmarketABI } = require('../abis/DoopmarketABI.json')

async function resolveENS(name) {
  const provider = new JsonRpcProvider(ETHEREUM_RPC_URL)
  const address = await provider.resolveName(name)
  return address
}
async function getBlockNumber() {
  const provider = new JsonRpcProvider(ETHEREUM_RPC_URL)
  const blockNumber = await provider.getBlockNumber()
  return blockNumber
}

const blockSortDesc = (a, b) => {
  if (a['blockNumber'] > b['blockNumber']) {
    return -1
  }
  if (a['blockNumber'] < b['blockNumber']) {
    return 1
  }
  return 0
}

const cacheGet = async (url, extra = {}, clearCache = false) => {
  let key = url
  if (typeof extra.params !== 'undefined') {
    key = `${url}?${new URLSearchParams(extra.params)}`
  }
  //we bust cache
  // clearCache = true;
  if (cacheServiceInstance.has(key) && !cacheServiceInstance.isExpired(key, 300) && !clearCache) {
    return cacheServiceInstance.get(key)
  }
  const fetchRes = await fetch(key)
  const response = await fetchRes.json()
  cacheServiceInstance.set(key, response)
  return response
}

app.use(cors())
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.json({})
})

app.get('/doops', async (req, res) => {
  if (typeof req.query.address === 'undefined') {
    res.json({ error: 'No address found' })
    return
  }
  let address = req.query.address
  if (address.includes('.eth')) {
    address = await resolveENS(address)
  }
  const blockNumber = await getBlockNumber()
  let allResults = []
  let page = 1
  let newResults = []
  while (newResults.length > 0 || page === 1) {
    const res = await cacheGet('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: DOOPLICATION_BLOCK,
        endblock: blockNumber,
        page,
        offset: 100,
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    })
    newResults = res.result
    allResults = [...allResults, ...newResults]
    page++
  }
  const results = allResults
    .filter((transaction) => {
      return (
        [DOOPMARKET_ADDRESS, DOOPLICATOR_ADDRESS].indexOf(transaction.to) > -1 &&
        transaction.functionName.substring(0, 10) === 'dooplicate' &&
        transaction.isError === '0'
      )
    })
    .map((transaction) => {
      abiDecoder.addABI(doopContracts[transaction.to])
      const decodedData = abiDecoder.decodeMethod(transaction.input)
      info = [...decodedData.params].reduce((acc, param) => {
        const names = ['tokenId', 'dooplicatorId', 'addressOnTheOtherSide']
        if (names.indexOf(param.name) > -1) {
          acc = {
            ...acc,
            [param.name]: param.value,
          }
        }
        return acc
      }, {})

      return {
        blockNumber: Number(transaction.blockNumber),
        timeStamp: Number(transaction.timeStamp),
        from: transaction.from,
        hash: transaction.hash,
        value: transaction.value,
        gas: transaction.gas,
        gasPrice: transaction.gasPrice,
        cumulativeGasUsed: transaction.cumulativeGasUsed,
        functionName: decodedData?.name,
        ...info,
      }
    })
    .sort(blockSortDesc)

  res.json(results)
})

app.get('/assets/:tokenId', async (req, res) => {
  if (typeof req.params.tokenId === 'undefined') {
    res.json({ error: 'No tokenId found' })
    return
  }
  const doodleResponse = await cacheGet(
    `${IPFS_DOMAIN}/QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS/${req.params.tokenId}`,
  )
  const assumed = doodleResponse.attributes.reduce((acc, item) => {
    let ids = assumedWearablesMap[item.value]
    if (typeof ids === 'undefined') ids = []
    return [...acc, ...ids]
  }, [])
  const wearablesResponse = await cacheGet(`https://doodles.app/api/dooplicator/${req.params.tokenId}`)
  let assumedIndex = 0
  const wearables = wearablesResponse.wearables.map((wearable) => {
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
      let collectionId = item.wearable_id !== '244' ? 'doodleswearables' : 'doodlesbetapass'
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

  res.json({
    ...doodleResponse,
    wearables,
    costs: costResponse,
  })
})

app.get('/leaderboard', async (req, res) => {
  const doopMarket = await getDooplicatorTransactions(DOOPMARKET_ADDRESS, true)
  const dooplicators = await getDooplicatorTransactions(DOOPLICATOR_ADDRESS, true)
  let leaderboard = [...doopMarket, ...dooplicators].reduce((acc, item) => {
    let user = {
      timeStamp: 0,
      address: '',
      dooplicate: 0,
      dooplicateItem: 0,
      value: 0,
    }
    if (typeof acc[item.from] === 'undefined') {
      user = {
        timeStamp: Number(item.timeStamp),
        address: item.from,
        dooplicate: item.functionName === 'dooplicate' ? 1 : 0,
        dooplicateItem: item.functionName === 'dooplicateItem' ? 1 : 0,
        value: Number(item.value),
      }
    } else {
      const existingUser = acc[item.from]
      user = {
        ...existingUser,
        timeStamp: existingUser.timeStamp >= item.timeStamp ? existingUser.timeStamp : item.timeStamp,
        value: Number(existingUser.value) + Number(item.value),
        dooplicate: item.functionName === 'dooplicate' ? existingUser.dooplicate + 1 : existingUser.dooplicate,
        dooplicateItem:
          item.functionName === 'dooplicateItem' ? existingUser.dooplicateItem + 1 : existingUser.dooplicateItem,
      }
    }
    acc = {
      ...acc,
      [item.from]: user,
    }
    return acc
  }, {})
  res.json(Object.values(leaderboard))
})

app.get('/doopmarket', async (req, res) => {
  const provider = new JsonRpcProvider(ETHEREUM_RPC_URL)
  const doopmarketContract = new Contract(DOOPMARKET_ADDRESS, DoopmarketABI, provider)
  const listing = await doopmarketContract.getListings(DOOPLICATOR_ADDRESS, DOODLE_ADDRESS)
  const jsonStringify = JSON.stringify(listing, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
  const jsonParse = JSON.parse(jsonStringify)

  const result = jsonParse
    .filter((item) => item[2] === true)
    .map((item) => {
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
    .sort((a, b) => {
      if (a['value'] < b['value']) {
        return -1
      }
      if (a['value'] > b['value']) {
        return 1
      }
      return 0
    })

  res.json(result)
})

app.get('/history', async (req, res) => {
  let { offset, page } = req.query

  if (typeof page === 'undefined' || page < 1) {
    page = 1
  } else {
    page = Number(page)
  }

  if (typeof offset === 'undefined') {
    offset = 20
  } else {
    offset = Number(offset)
  }
  const dooplicators = await getDooplicatorTransactions(DOOPLICATOR_ADDRESS)
  const doopMarket = await getDooplicatorTransactions(DOOPMARKET_ADDRESS)
  const results = [...dooplicators, ...doopMarket].sort(blockSortDesc).slice((page - 1) * offset, offset * page)

  res.json(results)
})

app.get('/feed', async (req, res) => {
  let { startBlock } = req.query

  if (typeof startBlock === 'undefined' || startBlock < 1) {
    res.json(results)
    return
  } else {
    startBlock = Number(startBlock) + 1
  }

  const doopMarket = await getDooplicatorTransactions(DOOPMARKET_ADDRESS, true, 100, startBlock)
  const dooplicators = await getDooplicatorTransactions(DOOPLICATOR_ADDRESS, true, 100, startBlock)

  const results = [...doopMarket, ...dooplicators].sort(blockSortDesc)

  res.json(results)
})

app.get('/doodle-floor', async (req, res) => {
  let { offset, page } = req.query

  if (typeof page === 'undefined' || page < 1) {
    page = 1
  } else {
    page = Number(page)
  }

  if (typeof offset === 'undefined') {
    offset = 10
  } else {
    offset = Number(offset)
  }

  const headers = {
    'Content-Type': 'application/json',
    origin: 'https://www.gem.xyz',
    referer: 'https://www.gem.xyz/',
    'x-api-key': process.env.GEM_API_KEY,
  }
  const body = {
    filters: {
      slug: 'doodles-official',
    },
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
    offset: (page - 1) * offset,
    limit: offset,
    status: ['buy_now'],
  }
  const response = await fetch('https://api-v2-1.gemlabs.xyz/assets', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: headers,
  })
  let undooped = []
  const responseJSON = await response.json()
  for (let i = 0; i < responseJSON.data.length; i++) {
    const { tokenId, marketUrl, currentBasePrice, supportsWyvern } = responseJSON.data[i]
    const wearablesResponse = await cacheGet(`https://doodles.app/api/dooplicator/${tokenId}`)
    const isDooplicated =
      wearablesResponse.wearables.filter((wearable) => typeof wearable.wearable_id === 'undefined').length === 0
    if (!isDooplicated) {
      undooped = [...undooped, { tokenId, marketUrl, currentBasePrice, supportsWyvern }]
    }
  }
  res.json(undooped)
})

app.get('/doop-floor', async (req, res) => {
  let { rarity } = req.query

  if (typeof rarity === 'undefined' || rarity < 0) {
    rarity = 0
  } else {
    rarity = Number(rarity)
  }
  if (rarity > 2) {
    rarity = 2
  }
  const rarityMap = ['very common', 'common', 'rare']
  const headers = {
    'Content-Type': 'application/json',
    origin: 'https://www.gem.xyz',
    referer: 'https://www.gem.xyz/',
    'x-api-key': process.env.GEM_API_KEY,
  }
  const body = {
    filters: {
      slug: 'the-dooplicator',
      traits: {
        Rarity: [`${rarityMap[rarity]}`],
        'OG Wearables charge': ['available'],
      },
    },
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
    offset: 0,
    limit: 5,
    status: ['buy_now'],
  }
  const response = await fetch('https://api-v2-1.gemlabs.xyz/assets', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: headers,
  })
  const responseJSON = await response.json()
  res.json(responseJSON.data)
})

const getDooplicatorTransactions = async (
  address,
  clearCahce = false,
  offset = 10000,
  startBlock = DOOPLICATION_BLOCK,
) => {
  const blockNumber = await getBlockNumber()
  let page = 1
  const response = await cacheGet(
    'https://api.etherscan.io/api',
    {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: startBlock,
        endblock: blockNumber,
        page,
        offset,
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    },
    clearCahce,
  )
  const results = response.result
    .filter((transaction) => {
      return transaction.functionName.substring(0, 10) === 'dooplicate' && transaction.isError === '0'
    })
    .map((transaction) => {
      abiDecoder.addABI(doopContracts[transaction.to])
      const decodedData = abiDecoder.decodeMethod(transaction.input)
      info = [...decodedData.params].reduce((acc, param) => {
        const names = ['tokenId', 'dooplicatorId', 'addressOnTheOtherSide']
        if (names.indexOf(param.name) > -1) {
          acc = {
            ...acc,
            [param.name]: param.value,
          }
        }
        return acc
      }, {})
      return {
        blockNumber: Number(transaction.blockNumber),
        timeStamp: Number(transaction.timeStamp),
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        functionName: decodedData?.name,
        ...info,
      }
    })
  return results.sort(blockSortDesc)
}

app.listen(PORT, () => {
  console.log(`Started on PORT ${PORT}`)
})
