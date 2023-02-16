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
const {doopContracts} = require('./constants');
const { cacheServiceInstance } = require("./cacheService");
const { ethers, JsonRpcProvider } = require('ethers');


async function resolveENS(name) {
  const provider = new JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
  const address = await provider.resolveName(name);
  return address;
}

const cacheAxiosGet = async (url, extra = {})=> {
  if (cacheServiceInstance.has(url) && !cacheServiceInstance.isExpired(url, 300)) {
    return cacheServiceInstance.get(url);
  }
  const response = await axios.get(url, extra);
  cacheServiceInstance.set(url, response);
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
  const response = await axios.get('https://api.etherscan.io/api', {
    params: {
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: 16508485,
      endblock: 99999999,
      page: 1,
      offset: 100,
      sort: 'desc',
      apikey: process.env.ETHERSCAN_API_KEY
    }
  });
  let newResults = response.data.result;
  allResults = [...allResults, ...newResults];
  while(newResults.length > 0) {
    const res = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 16508485,
        endblock: 99999999,
        page: page,
        offset: 100,
        sort: 'desc',
        apikey: process.env.ETHERSCAN_API_KEY
      }
    });
    newResults = res.data.result;
    allResults = [...allResults, ...res.data.result];
    page ++;
  }
  const results = allResults.filter((transaction)=>{
    return Object.keys(doopContracts).indexOf(transaction.to) > -1 && transaction.functionName.substring(0,10) === 'dooplicate';
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

app.listen(PORT, () => {
  console.log(`Started on PORT ${PORT}`);
});