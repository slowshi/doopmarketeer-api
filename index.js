const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const axios = require('axios');
const {body, query, validationResult} = require('express-validator');
const abiDecoder = require('abi-decoder');
const app = express();
const PORT = process.env.PORT || 8000;
const {doopContracts} = require('./constants');

app.use(cors())
app.use(bodyParser.json());

app.get('/getDoops', async (req, res)=>{
  if(typeof req.query.address === 'undefined') {
    res.json({error:'No address found'});
    return;
  }
  let allResults = [];
  let page = 2;
  const response = await axios.get('https://api.etherscan.io/api', {
    params: {
      module: 'account',
      action: 'txlist',
      address: req.query.address,
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
        address: req.query.address,
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
    return Object.keys(doopContracts).indexOf(transaction.to) > -1;
  }).map((transaction)=>{
    abiDecoder.addABI(doopContracts[transaction.to]);
    const decodedData = abiDecoder.decodeMethod(transaction.input)

    const info = [...decodedData.params].reduce((acc, param)=>{
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
      functionName: decodedData.name,
      ...info
    }
  });
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Started on PORT ${PORT}`);
});