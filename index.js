try {
  const dotenv = require('dotenv').config();
} catch(_) {}
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const {body, query, validationResult} = require('express-validator');
const abiDecoder = require('abi-decoder');
const app = express();
const PORT = process.env.PORT || 8000;
const {
  doopContracts,
  IPFS_DOMAIN,
  DOOPLICATOR_ADDRESS,
  DOOPMARKET_ADDRESS,
  DOOPLICATION_BLOCK
} = require('./constants');
const { cacheServiceInstance } = require("./cacheService");
const { ethers, JsonRpcProvider } = require('ethers');


async function resolveENS(name) {
  const provider = new JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
  const address = await provider.resolveName(name);
  return address;
}

const cacheGet = async (url, extra = {}, clearCache = false)=> {
  let key = url;
  if(typeof extra.params !== 'undefined') {
    key = `${url}?${new URLSearchParams(extra.params)}`
  }
  if (cacheServiceInstance.has(key) && !cacheServiceInstance.isExpired(key, 300) && !clearCache) {
    return cacheServiceInstance.get(key);
  }
  const fetchRes = await fetch(key);
  const response = await fetchRes.json();
  const result = response.result;
  cacheServiceInstance.set(key, response);
  return response;
};

app.use(cors())
app.use(bodyParser.json());
app.get('/', (req, res)=>{
  res.json({})
})

app.get('/doops', async (req, res)=>{
  if(typeof req.query.address === 'undefined') {
    res.json({error:'No address found'});
    return;
  }
  let address = req.query.address;
  if(address.includes('.eth')) {
    address = await resolveENS(address);
  }

  let allResults = [];
  let page = 2;
  const response =  await cacheGet('https://api.etherscan.io/api', {
    params: {
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: DOOPLICATION_BLOCK,
      page: 1,
      offset: 1000,
      sort: 'desc',
      apikey: process.env.ETHERSCAN_API_KEY
    }
  });
  let newResults = response.result;
  allResults = [...allResults, ...newResults];
  while(newResults.length > 0) {
    const res =  await cacheGet('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: DOOPLICATION_BLOCK,
        page: page,
        offset: 1000,
        sort: 'desc',
        apikey: process.env.ETHERSCAN_API_KEY
      }
    });
    newResults = res.result;
    allResults = [...allResults, ...newResults];
    page ++;
  }
  const results = allResults.filter((transaction)=>{
    return [DOOPMARKET_ADDRESS, DOOPLICATOR_ADDRESS].indexOf(transaction.to) > -1 && transaction.functionName.substring(0,10) === 'dooplicate';
  }).map((transaction)=>{
    abiDecoder.addABI(doopContracts[transaction.to]);
    const decodedData = abiDecoder.decodeMethod(transaction.input)
    info = [...decodedData.params].reduce((acc, param)=>{
      const names = ['tokenId', 'dooplicatorId', 'addressOnTheOtherSide'];
      if (names.indexOf(param.name) > -1) {
        acc = {
          ...acc,
          [param.name]: param.value
        }
      }
      return acc;
    },{});

    return {
      blockNumber: transaction.blockNumber,
      timeStamp: transaction.timeStamp,
      from: transaction.from,
      hash: transaction.hash,
      value: transaction.value,
      gas: transaction.gas,
      gasPrice: transaction.gasPrice,
      cumulativeGasUsed: transaction.cumulativeGasUsed,
      functionName: decodedData?.name,
      ...info
    }
  });
  res.json(results);
});

app.get('/assets/:tokenId', async (req, res)=>{
  if(typeof req.params.tokenId === 'undefined') {
    res.json({error:'No tokenId found'});
    return;
  }
  const wearablesResponse = await cacheGet(`https://doodles.app/api/dooplicator/${req.params.tokenId}`);

  const doodleResponse = await cacheGet(`${IPFS_DOMAIN}/QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS/${req.params.tokenId}`);
  res.json({
    ...doodleResponse,
    ...wearablesResponse
  });
});

app.get('/leaderboard', async (req, res)=>{
  const doopMarket = await getDooplicatorTransactions(DOOPMARKET_ADDRESS, true);
  const dooplicators = await getDooplicatorTransactions(DOOPLICATOR_ADDRESS, true);
  let leaderboard = [...doopMarket, ...dooplicators].reduce((acc, item)=>{
    let user = {
      timeStamp: 0,
      address: '',
      dooplicate: 0,
      dooplicateItem: 0,
      value: 0
    };
    if (typeof acc[item.from] === 'undefined') {
      user = {
        timeStamp: Number(item.timeStamp),
        address: item.from,
        dooplicate: item.functionName === 'dooplicate' ? 1 : 0,
        dooplicateItem: item.functionName === 'dooplicateItem' ? 1 : 0,
        value: Number(item.value)
      }
    } else {
      const existingUser = acc[item.from];
      user = {
        ...existingUser,
        timeStamp: existingUser.timeStamp >= item.timeStamp ? existingUser.timeStamp : item.timeStamp,
        value: Number(existingUser.value) + Number(item.value),
        dooplicate: item.functionName === 'dooplicate' ? existingUser.dooplicate + 1 : existingUser.dooplicate,
        dooplicateItem: item.functionName === 'dooplicateItem' ? existingUser.dooplicateItem + 1 : existingUser.dooplicateItem,
      }
    }
    acc = {
      ...acc,
      [item.from]: user
    }
    return acc;
  }, {})
  res.json(Object.values(leaderboard))
})

app.get('/history', async (req, res)=>{
  let {offset,page} = req.query;

  if(typeof page === 'undefined' || page < 1) {
    page = 1
  } else {
    page = Number(page)
  }

  if(typeof offset === 'undefined') {
    offset = 20
  } else {
    offset = Number(offset)
  }
  const dooplicators = await getDooplicatorTransactions(DOOPLICATOR_ADDRESS);
  const doopMarket = await getDooplicatorTransactions(DOOPMARKET_ADDRESS);
  const results = [...doopMarket,...dooplicators].sort((a,b)=>{
    if (a['blockNumber'] > b['blockNumber']) {
      return -1;
    }
    if (a['blockNumber'] < b['blockNumber']) {
      return 1;
    }
    return 0;
  }).slice((page - 1) * offset, offset * page);

  res.json(results)
})

app.get('/feed', async(req, res)=> {
  let {startBlock} = req.query;

  if(typeof startBlock === 'undefined' || startBlock < 1) {
    res.json(results)
    return;
  } else {
    startBlock = Number(startBlock) + 1
  }

  const doopMarket = await getDooplicatorTransactions(DOOPMARKET_ADDRESS, true, 1, 1000, startBlock);
  const dooplicators = await getDooplicatorTransactions(DOOPLICATOR_ADDRESS, true, 1, 1000, startBlock);

  const results = [...doopMarket, ...dooplicators].sort((a,b)=>{
    if (a['blockNumber'] > b['blockNumber']) {
      return -1;
    }
    if (a['blockNumber'] < b['blockNumber']) {
      return 1;
    }
    return 0;
  })

  res.json(results)
})
const getDooplicatorTransactions = async (address, clearCahce=false, page = 1, offset = 10000, startBlock = DOOPLICATION_BLOCK) => {
  const response = await cacheGet('https://api.etherscan.io/api', {
    params: {
      module: 'account',
      action: 'txlist',
      address,
      startBlock,
      page: page,
      offset: offset,
      sort: 'desc',
      apikey: process.env.ETHERSCAN_API_KEY
    }
  }, clearCahce);
  const results = response.result.filter((transaction)=>{
    return transaction.functionName.substring(0,10) === 'dooplicate';
  }).map((transaction)=>{
    abiDecoder.addABI(doopContracts[transaction.to]);
    const decodedData = abiDecoder.decodeMethod(transaction.input)
    info = [...decodedData.params].reduce((acc, param)=>{
      const names = ['tokenId', 'dooplicatorId', 'addressOnTheOtherSide'];
      if (names.indexOf(param.name) > -1) {
        acc = {
          ...acc,
          [param.name]: param.value
        }
      }
      return acc;
    },{});
    return {
      blockNumber: Number(transaction.blockNumber),
      timeStamp: Number(transaction.timeStamp),
      hash: transaction.hash,
      from: transaction.from,
      value: transaction.value,
      functionName: decodedData?.name,
      ...info
    }
  });
  return results;
}


app.listen(PORT, () => {
  console.log(`Started on PORT ${PORT}`);
});
