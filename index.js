try {
  const dotenv = require('dotenv').config();
} catch(_) {}
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const axios = require('axios');
const {body, query, validationResult} = require('express-validator');
const abiDecoder = require('abi-decoder');
const app = express();
const PORT = process.env.PORT || 8000;
const {doopContracts, DOOPLICATOR_ADDRESS, DOOPMARKET_ADDRESS} = require('./constants');
const { cacheServiceInstance } = require("./cacheService");
const { ethers, JsonRpcProvider } = require('ethers');


async function resolveENS(name) {
  const provider = new JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
  const address = await provider.resolveName(name);
  return address;
}

const cacheAxiosGet = async (url, extra = {})=> {
  const key = `${url}_${JSON.stringify(extra)}`
  if (cacheServiceInstance.has(key) && !cacheServiceInstance.isExpired(key, 300)) {
    return cacheServiceInstance.get(key);
  }
  const response = await axios.get(url, extra);
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
  const response =  await cacheAxiosGet('https://api.etherscan.io/api', {
    params: {
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: 16508485,
      endblock: 99999999,
      page: 1,
      offset: 1000,
      sort: 'desc',
      apikey: process.env.ETHERSCAN_API_KEY
    }
  });
  let newResults = response.data.result;
  allResults = [...allResults, ...newResults];
  while(newResults.length > 0) {
    const res =  await cacheAxiosGet('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 16508485,
        endblock: 99999999,
        page: page,
        offset: 1000,
        sort: 'desc',
        apikey: process.env.ETHERSCAN_API_KEY
      }
    });
    newResults = res.data.result;
    allResults = [...allResults, ...res.data.result];
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
  const wearablesResponse = await cacheAxiosGet(`https://doodles.app/api/dooplicator/${req.params.tokenId}`);

  const doodleResponse = await cacheAxiosGet(`https://alchemy.mypinata.cloud/ipfs/QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS//${req.params.tokenId}`);

  res.json({
    ...doodleResponse.data,
    ...wearablesResponse.data
  });
});

app.get('/leaderboard', async (req, res)=>{
  const doopMarket = await getDooplicatorTransactions(DOOPMARKET_ADDRESS);
  const dooplicators = await getDooplicatorTransactions(DOOPLICATOR_ADDRESS);
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

const getDooplicatorTransactions = async (address) => {
  const response = await cacheAxiosGet('https://api.etherscan.io/api', {
    params: {
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: 16508485,
      endblock: 99999999,
      page: 1,
      offset: 10000,
      sort: 'desc',
      apikey: process.env.ETHERSCAN_API_KEY
    }
  });
  const results = response.data.result.filter((transaction)=>{
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
      timeStamp: transaction.timeStamp,
      from: transaction.from,
      value: transaction.value,
      functionName: decodedData?.name,
      // ...info
    }
  });
  return results;
}
app.listen(PORT, () => {
  console.log(`Started on PORT ${PORT}`);
});
